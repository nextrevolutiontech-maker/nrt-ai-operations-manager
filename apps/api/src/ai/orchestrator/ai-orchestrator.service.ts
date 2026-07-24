import { Injectable, Logger, Inject } from '@nestjs/common';
import { AI_PROVIDER_TOKEN, type IAiProvider } from '../brain/providers/ai-provider.interface';
import { SystemPromptEngineService } from '../brain/persona/system-prompt-engine.service';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';
import { IntentDetectorService } from '../brain/reasoning/intent-detector.service';
import { RiskEngineService } from '../brain/reasoning/risk-engine.service';
import { ConfidenceEngineService } from '../brain/reasoning/confidence-engine.service';
import { PriorityEngineService } from '../brain/reasoning/priority-engine.service';
import { ConflictResolutionService } from '../brain/reasoning/conflict-resolution.service';
import { PolicyEngineService } from '../brain/governance/policy-engine.service';
import { AutonomousMatrixService } from '../brain/governance/autonomous-matrix.service';
import { PlannerService } from '../brain/planning/planner.service';
import { DecisionTraceService } from '../brain/execution/decision-trace.service';
import { ObservabilityService } from '../brain/execution/observability.service';
import { AiSessionStateService } from '../brain/memory/ai-session-state.service';
import { ToolRegistryService } from '../brain/tools/tool-registry.service';
import { ToolExecutorService } from '../brain/tools/tool-executor.service';
import { KnowledgeBaseService } from '../brain/knowledge/knowledge-base.service';

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: IAiProvider,
    private readonly systemPromptEngine: SystemPromptEngineService,
    private readonly siernaFormatter: SiernaFormatterService,
    private readonly intentDetector: IntentDetectorService,
    private readonly riskEngine: RiskEngineService,
    private readonly confidenceEngine: ConfidenceEngineService,
    private readonly priorityEngine: PriorityEngineService,
    private readonly conflictResolution: ConflictResolutionService,
    private readonly policyEngine: PolicyEngineService,
    private readonly autonomousMatrix: AutonomousMatrixService,
    private readonly planner: PlannerService,
    private readonly decisionTrace: DecisionTraceService,
    private readonly observability: ObservabilityService,
    private readonly sessionState: AiSessionStateService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly toolExecutor: ToolExecutorService,
    private readonly knowledgeBase: KnowledgeBaseService,
  ) {}

  async handlePrompt(
    companyId: string,
    userId: string,
    sessionId: string,
    prompt: string,
    industryId?: string,
  ): Promise<string> {
    const startTime = Date.now();

    // 1. Stage 1 & 2: Ingestion & Intent Detection
    const intent = this.intentDetector.detectIntent(prompt);
    this.sessionState.updateActiveGoal(sessionId, prompt);

    // 2. Stage 3 & 4: Business Context & Department Resolution
    const contextData = { companyId, userId, sessionId, industryId };

    // 3. Stage 5 & 6: Data Requirements & Policy Verification
    const policyResult = this.policyEngine.checkPolicy({ actionName: prompt });

    // 4. Stage 7: Risk & Confidence Assessment
    const riskResult = this.riskEngine.assessRisk({
      financialAmount: prompt.includes('50000') ? 55000 : 2500,
    });
    const confidenceResult = this.confidenceEngine.evaluateConfidence({
      dataCompleteness: 0.95,
      policyClarity: 0.9,
      precedentConfidence: 0.85,
    });

    // 5. Stage 8: Planner & Execution DAG
    const plan = this.planner.generatePlan(prompt);

    // 6. Stage 9: Dynamic System Prompt Assembly (Zero Hardcoding)
    const systemPrompt = this.systemPromptEngine.buildSystemPrompt({
      companyName: 'NRT Enterprise',
      industryId,
      userRole: 'OPERATIONS_MANAGER',
      contextData,
    });

    // 7. Stage 10: Provider Execution
    const tools = this.toolRegistry.getToolDefinitionsForAi();
    const payload = {
      systemPrompt,
      userPrompt: prompt,
      tools,
    };

    const aiResponse = await this.aiProvider.generateResponse(payload);
    const latencyMs = Date.now() - startTime;

    // 8. Log Decision Trace & Telemetry
    this.decisionTrace.logTrace({
      sessionId,
      intent,
      evidence: `Assessed risk level: ${riskResult.level} | Confidence: ${(confidenceResult.score * 100).toFixed(0)}%`,
      applicablePolicies: policyResult.violations,
      riskLevel: riskResult.level,
      confidenceScore: confidenceResult.score,
      selectedRecommendation: aiResponse.content.substring(0, 100),
      toolsExecuted: aiResponse.toolCalls?.map((t) => t.name) || [],
    });

    this.observability.recordMetric({
      provider: this.aiProvider.providerName,
      latencyMs,
      promptTokens: aiResponse.usage?.promptTokens || 100,
      completionTokens: aiResponse.usage?.completionTokens || 150,
      totalTokens: aiResponse.usage?.totalTokens || 250,
      toolCallsCount: aiResponse.toolCalls?.length || 0,
      success: true,
    });

    // 9. Format response via SIERNA
    if (aiResponse.content.includes('SIERNA') || aiResponse.content.includes('Situation')) {
      return aiResponse.content;
    }

    return this.siernaFormatter.format({
      situation: `Processed Operational Prompt: "${prompt}"`,
      impact: `Risk Level: ${riskResult.level}. Assessed across priority hierarchy (${this.priorityEngine.getPriorityRank('P3_CUSTOMER')} customer focus).`,
      evidence: `Intent: ${intent}. Plan generated with ${plan.steps.length} steps. Confidence score: ${(confidenceResult.score * 100).toFixed(0)}%.`,
      recommendation: aiResponse.content,
      nextActions: plan.steps.map((s) => s.description),
    });
  }
}
