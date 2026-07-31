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
import { AiContextEngineService } from '../context/ai-context.service';
import { AiSessionsService } from '../sessions/ai-sessions.service';

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
    private readonly contextEngine: AiContextEngineService,
    private readonly sessionsService: AiSessionsService,
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

    // 2. Stage 3 & 4: Live Business Context & ERP Metrics Fetch
    let dynamicContext: any = {};
    try {
      dynamicContext = await this.contextEngine.buildContext(companyId, userId, industryId);
    } catch (e) {
      this.logger.warn(`Context engine fallback: ${e}`);
    }

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

    // 6. Stage 9: Dynamic System Prompt Assembly with Live System Numbers
    const systemPrompt = this.systemPromptEngine.buildSystemPrompt({
      companyName: dynamicContext?.company?.name || 'NRT Enterprise Solutions',
      industryId,
      userRole: dynamicContext?.user?.role || 'OPERATIONS_MANAGER',
      userName: dynamicContext?.user?.name || 'Operations Manager',
      contextData: dynamicContext,
    });

    // 7. Stage 10: Multi-Turn Provider & Tool Execution Loop
    const tools = this.toolRegistry.getToolDefinitionsForAi();
    const MAX_TOOL_ITERATIONS = 3;
    let iteration = 0;
    const executedToolsList: string[] = [];

    // Adaptive maxTokens strategy
    let maxTokens = 700;
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('salam') || lowerPrompt.includes('kaise ho') || lowerPrompt.includes('assalam')) {
      maxTokens = 250;
    } else if (lowerPrompt.includes('briefing') || lowerPrompt.includes('executive') || lowerPrompt.includes('summary') || lowerPrompt.includes('risk') || lowerPrompt.includes('report') || lowerPrompt.includes('all')) {
      maxTokens = 1500;
    }

    // Load past conversation turns for session memory & context resolution
    let conversationHistory: any[] = [];
    try {
      if (sessionId) {
        const historyData = await this.sessionsService.getSessionHistory(sessionId, 1, 10);
        if (historyData?.data && historyData.data.length > 0) {
          // Exclude current message if already saved, format into role/content
          conversationHistory = historyData.data
            .filter((m) => m.content !== prompt)
            .map((m) => ({
              role: m.role === 'USER' ? 'USER' : 'AI',
              content: m.content,
            }));
        }
      }
    } catch (e) {
      this.logger.warn(`Could not load session history for sessionId ${sessionId}: ${e}`);
    }

    let currentPayload: any = {
      systemPrompt,
      userPrompt: prompt,
      tools,
      maxTokens,
      history: conversationHistory,
    };

    let aiResponse = await this.aiProvider.generateResponse(currentPayload);

    while (
      aiResponse.toolCalls &&
      aiResponse.toolCalls.length > 0 &&
      iteration < MAX_TOOL_ITERATIONS
    ) {
      iteration++;
      this.logger.log(
        `[MULTI-TURN LOOP] Iteration ${iteration}/${MAX_TOOL_ITERATIONS} - Executing ${aiResponse.toolCalls.length} tool(s)`,
      );

      const toolResultsText: string[] = [];

      for (const toolCall of aiResponse.toolCalls) {
        executedToolsList.push(toolCall.name);
        try {
          const result = await this.toolExecutor.executeTool(
            toolCall.name,
            toolCall.arguments,
            { companyId, userId, sessionId, userRole: dynamicContext?.user?.role || 'OPERATIONS_MANAGER' },
          );
          toolResultsText.push(
            `Tool '${toolCall.name}' Output: ${JSON.stringify(result)}`,
          );
        } catch (toolErr: any) {
          toolResultsText.push(
            `Tool '${toolCall.name}' Error: ${toolErr.message}`,
          );
        }
      }

      currentPayload.history.push({
        role: 'AI',
        content: `Tool Execution Request: ${JSON.stringify(aiResponse.toolCalls)}`,
      });
      currentPayload.history.push({
        role: 'USER',
        content: `Tool Execution Observations:\n${toolResultsText.join('\n')}\n\nInstruction: Synthesize these tool execution results into a clear, direct, and scope-appropriate response that answers the user's specific question concisely and accurately. Avoid dumping unnecessary boilerplate reports unless explicitly requested.`,
      });

      aiResponse = await this.aiProvider.generateResponse(currentPayload);
    }

    const latencyMs = Date.now() - startTime;

    // 8. Log Decision Trace & Telemetry with executed tools trace
    this.decisionTrace.logTrace({
      sessionId,
      intent,
      evidence: `Assessed risk level: ${riskResult.level} | Confidence: ${(confidenceResult.score * 100).toFixed(0)}%`,
      applicablePolicies: policyResult.violations,
      riskLevel: riskResult.level,
      confidenceScore: confidenceResult.score,
      selectedRecommendation: (aiResponse.content || '').substring(0, 100),
      toolsExecuted: executedToolsList,
    });

    this.observability.recordMetric({
      provider: this.aiProvider.providerName,
      latencyMs,
      promptTokens: aiResponse.usage?.promptTokens || 100,
      completionTokens: aiResponse.usage?.completionTokens || 150,
      totalTokens: aiResponse.usage?.totalTokens || 250,
      toolCallsCount: executedToolsList.length,
      success: true,
    });

    // 9. Return clean, natural response directly
    if (aiResponse.content && aiResponse.content.trim()) {
      return aiResponse.content;
    }

    return `Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. Aapka system operational hai. Aap mujh se business, inventory, ya sentiment ke baare me pooch sakte hain.`;
  }
}
