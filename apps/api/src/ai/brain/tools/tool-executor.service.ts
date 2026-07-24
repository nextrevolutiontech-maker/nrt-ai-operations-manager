import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { ToolResultNormalizerService } from './tool-result-normalizer.service';
import { PolicyEngineService } from '../governance/policy-engine.service';
import { DecisionTraceService } from '../execution/decision-trace.service';
import { ToolExecutionOptions } from './contracts/ai-tool-contract.interface';
import { AiApprovalsService } from '../../approvals/ai-approvals.service';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);
  private readonly idempotencyCache: Map<string, any> = new Map();

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly normalizer: ToolResultNormalizerService,
    private readonly policyEngine: PolicyEngineService,
    private readonly decisionTrace: DecisionTraceService,
    private readonly approvalsService: AiApprovalsService,
  ) {}

  async executeTool(
    name: string,
    args: any,
    context: any,
    options?: ToolExecutionOptions,
  ): Promise<any> {
    const contract = this.toolRegistry.getToolContract(name);
    if (!contract) {
      throw new Error(`Tool Contract '${name}' is not registered.`);
    }

    // 1. Idempotency Check
    if (options?.idempotencyKey && this.idempotencyCache.has(options.idempotencyKey)) {
      this.logger.log(`[IDEMPOTENCY HIT] Key: ${options.idempotencyKey} | Tool: ${name}`);
      return this.idempotencyCache.get(options.idempotencyKey);
    }

    // 2. Policy Engine & Hard AI Block Check
    const policyResult = this.policyEngine.checkPolicy({
      actionName: name,
      amount: args?.amount || args?.totalAmount || 0,
      userRole: context?.userRole || 'OPERATIONS_MANAGER',
      isBlockedAction:
        contract.riskLevel === 'CRITICAL' &&
        (name.includes('delete') || name.includes('approvePayments')),
    });

    if (!policyResult.allowed) {
      this.decisionTrace.logTrace({
        sessionId: context?.sessionId || 'SESSION-UNKNOWN',
        intent: 'POLICY_BLOCK',
        evidence: `Blocked tool '${name}' due to policy violation`,
        applicablePolicies: policyResult.violations,
        riskLevel: contract.riskLevel,
        confidenceScore: 1.0,
        selectedRecommendation: 'BLOCKED BY POLICY ENGINE',
        toolsExecuted: [],
      });
      throw new ForbiddenException(policyResult.violations.join('; '));
    }

    // 3. Draft & Approval Staging Check
    if (contract.approvalRequired || policyResult.requiresHumanApproval) {
      this.logger.log(`[APPROVAL STAGED] Tool '${name}' requires human approval.`);
      const approvalRecord = await this.approvalsService.createApproval(
        context?.sessionId || 'SESSION-UNKNOWN',
        name,
        args,
      );

      const stagedResult = {
        status: 'STAGED_FOR_APPROVAL',
        approvalId: approvalRecord.id,
        toolName: name,
        riskLevel: contract.riskLevel,
        message: `Action staged for human manager sign-off (${approvalRecord.id}).`,
      };

      if (options?.idempotencyKey) {
        this.idempotencyCache.set(options.idempotencyKey, stagedResult);
      }
      return stagedResult;
    }

    // 4. Safe Handler Execution
    try {
      const rawResult = await contract.handler(args, context);
      const normalizedResult = this.normalizer.normalize(contract.module, rawResult);

      const finalOutput = {
        status: 'SUCCESS',
        toolName: name,
        module: contract.module,
        executedAt: new Date().toISOString(),
        result: normalizedResult,
      };

      // Cache Idempotency
      if (options?.idempotencyKey) {
        this.idempotencyCache.set(options.idempotencyKey, finalOutput);
      }

      // Log Decision Trace
      if (contract.auditEnabled) {
        this.decisionTrace.logTrace({
          sessionId: context?.sessionId || 'SESSION-UNKNOWN',
          intent: `EXECUTE_${contract.module.toUpperCase()}`,
          evidence: `Executed tool '${name}' successfully`,
          applicablePolicies: [],
          riskLevel: contract.riskLevel,
          confidenceScore: 0.95,
          selectedRecommendation: `Executed ${name}`,
          toolsExecuted: [name],
        });
      }

      return finalOutput;
    } catch (error: any) {
      this.logger.error(`Error executing tool '${name}': ${error.message}`);
      throw error;
    }
  }
}
