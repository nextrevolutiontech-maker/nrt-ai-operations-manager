import { Module } from '@nestjs/common';
import { AI_PROVIDER_TOKEN } from './brain/providers/ai-provider.interface';
import { GeminiAiProvider } from './brain/providers/gemini-ai.provider';
import { OpenAiProvider } from './brain/providers/openai-ai.provider';
import { ClaudeAiProvider } from './brain/providers/claude-ai.provider';
import { LocalLlmProvider } from './brain/providers/local-llm.provider';

import { KnowledgeBaseService } from './brain/knowledge/knowledge-base.service';
import { SystemPromptEngineService } from './brain/persona/system-prompt-engine.service';
import { SiernaFormatterService } from './brain/persona/sierna-formatter.service';

import { IntentDetectorService } from './brain/reasoning/intent-detector.service';
import { RiskEngineService } from './brain/reasoning/risk-engine.service';
import { ConfidenceEngineService } from './brain/reasoning/confidence-engine.service';
import { PriorityEngineService } from './brain/reasoning/priority-engine.service';
import { ConflictResolutionService } from './brain/reasoning/conflict-resolution.service';

import { PolicyEngineService } from './brain/governance/policy-engine.service';
import { AutonomousMatrixService } from './brain/governance/autonomous-matrix.service';

import { PlannerService } from './brain/planning/planner.service';
import { DecisionTraceService } from './brain/execution/decision-trace.service';
import { ObservabilityService } from './brain/execution/observability.service';
import { AiSessionStateService } from './brain/memory/ai-session-state.service';

import { ToolRegistryService } from './brain/tools/tool-registry.service';
import { ToolExecutorService } from './brain/tools/tool-executor.service';
import { ToolResultNormalizerService } from './brain/tools/tool-result-normalizer.service';

import { ProductsToolsProvider } from './brain/tools/modules/products-tools.provider';
import { InventoryToolsProvider } from './brain/tools/modules/inventory-tools.provider';
import { WarehouseToolsProvider } from './brain/tools/modules/warehouse-tools.provider';
import { PurchaseToolsProvider } from './brain/tools/modules/purchase-tools.provider';
import { SalesToolsProvider } from './brain/tools/modules/sales-tools.provider';
import { CustomersToolsProvider } from './brain/tools/modules/customers-tools.provider';
import { SuppliersToolsProvider } from './brain/tools/modules/suppliers-tools.provider';
import { FinanceToolsProvider } from './brain/tools/modules/finance-tools.provider';
import { ReportsToolsProvider } from './brain/tools/modules/reports-tools.provider';
import { DashboardToolsProvider } from './brain/tools/modules/dashboard-tools.provider';

import { AiOrchestratorService } from './orchestrator/ai-orchestrator.service';
import { AiController } from './ai.controller';
import { AiContextEngineService } from './context/ai-context.service';
import { AiSessionsService } from './sessions/ai-sessions.service';
import { AiApprovalsService } from './approvals/ai-approvals.service';
import { ApprovalWorkflowService } from './approvals/approval-workflow.service';
import { DemoScenariosService } from './demo/demo-scenarios.service';
import { AiInsightsService } from './insights/ai-insights.service';

// Sprint C Services
import { RuntimeStateService } from './runtime/runtime-state.service';
import { RuntimeHealthService } from './runtime/runtime-health.service';
import { RuntimeMetricsService } from './runtime/runtime-metrics.service';
import { AiRuntimeService } from './runtime/ai-runtime.service';

import { EventStoreService } from './events/event-store.service';
import { EventReplayService } from './events/event-replay.service';
import { EventBusService } from './events/event-bus.service';
import { EventRouterService } from './events/event-router.service';
import { EventRegistryService } from './events/event-registry.service';
import { EventDispatcherService } from './events/event-dispatcher.service';

import { InventoryMonitorService } from './monitors/inventory-monitor.service';
import { WarehouseMonitorService } from './monitors/warehouse-monitor.service';
import { PurchaseMonitorService } from './monitors/purchase-monitor.service';
import { SupplierMonitorService } from './monitors/supplier-monitor.service';
import { SalesMonitorService } from './monitors/sales-monitor.service';
import { FinanceMonitorService } from './monitors/finance-monitor.service';
import { CustomerMonitorService } from './monitors/customer-monitor.service';
import { DashboardMonitorService } from './monitors/dashboard-monitor.service';
import { KpiMonitorService } from './monitors/kpi-monitor.service';

import { AlertDeduplicatorService } from './alerts/alert-deduplicator.service';
import { AlertPriorityService } from './alerts/alert-priority.service';
import { AlertHistoryService } from './alerts/alert-history.service';
import { AlertEngineService } from './alerts/alert-engine.service';

import { RecommendationFeedbackService } from './recommendations/recommendation-feedback.service';
import { RecommendationPriorityService } from './recommendations/recommendation-priority.service';
import { RecommendationLifecycleService } from './recommendations/recommendation-lifecycle.service';
import { RecommendationHistoryService } from './recommendations/recommendation-history.service';
import { RecommendationEngineService } from './recommendations/recommendation-engine.service';

import { AiTaskService } from './tasks/ai-task.service';
import { AiTaskQueueService } from './tasks/ai-task-queue.service';
import { AiTaskSchedulerService } from './tasks/ai-task-scheduler.service';
import { AiTaskExecutorService } from './tasks/ai-task-executor.service';

import { NotificationPreferencesService } from './notifications/notification-preferences.service';
import { EscalationPolicyService } from './notifications/escalation-policy.service';
import { InAppNotificationProvider } from './notifications/inapp.provider';
import { EmailNotificationProvider } from './notifications/email.provider';
import { WebhookNotificationProvider } from './notifications/webhook.provider';
import { NotificationHistoryService } from './notifications/notification-history.service';
import { NotificationEngineService } from './notifications/notification-engine.service';

import { DailySummaryService } from './briefings/daily-summary.service';
import { WeeklyReviewService } from './briefings/weekly-review.service';
import { MonthlyBusinessReviewService } from './briefings/monthly-business-review.service';
import { ExecutiveBriefingService } from './briefings/executive-briefing.service';

import { WorkflowStateService } from './orchestration/workflow-state.service';
import { WorkflowHistoryService } from './orchestration/workflow-history.service';
import { WorkflowEngineService } from './orchestration/workflow-engine.service';
import { GroqAiProvider } from './brain/providers/groq-ai.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (groq: GroqAiProvider, gemini: GeminiAiProvider, openai: OpenAiProvider) => {
        if (process.env.GROQ_API_KEY || process.env.AI_PROVIDER === 'groq') {
          return groq;
        }
        if (process.env.AI_PROVIDER === 'openai' || (!process.env.GEMINI_API_KEY && process.env.OPENAI_API_KEY)) {
          return openai;
        }
        return gemini;
      },
      inject: [GroqAiProvider, GeminiAiProvider, OpenAiProvider],
    },
    GroqAiProvider,
    GeminiAiProvider,
    OpenAiProvider,
    ClaudeAiProvider,
    LocalLlmProvider,
    KnowledgeBaseService,
    SystemPromptEngineService,
    SiernaFormatterService,
    IntentDetectorService,
    RiskEngineService,
    ConfidenceEngineService,
    PriorityEngineService,
    ConflictResolutionService,
    PolicyEngineService,
    AutonomousMatrixService,
    PlannerService,
    DecisionTraceService,
    ObservabilityService,
    AiSessionStateService,
    ToolResultNormalizerService,
    ProductsToolsProvider,
    InventoryToolsProvider,
    WarehouseToolsProvider,
    PurchaseToolsProvider,
    SalesToolsProvider,
    CustomersToolsProvider,
    SuppliersToolsProvider,
    FinanceToolsProvider,
    ReportsToolsProvider,
    DashboardToolsProvider,
    ToolRegistryService,
    ToolExecutorService,
    AiOrchestratorService,
    AiContextEngineService,
    AiSessionsService,
    AiApprovalsService,
    ApprovalWorkflowService,
    DemoScenariosService,
    AiInsightsService,

    // Sprint C Providers
    RuntimeStateService,
    RuntimeHealthService,
    RuntimeMetricsService,
    AiRuntimeService,

    EventStoreService,
    EventReplayService,
    EventBusService,
    EventRouterService,
    EventRegistryService,
    EventDispatcherService,

    InventoryMonitorService,
    WarehouseMonitorService,
    PurchaseMonitorService,
    SupplierMonitorService,
    SalesMonitorService,
    FinanceMonitorService,
    CustomerMonitorService,
    DashboardMonitorService,
    KpiMonitorService,

    AlertDeduplicatorService,
    AlertPriorityService,
    AlertHistoryService,
    AlertEngineService,

    RecommendationFeedbackService,
    RecommendationPriorityService,
    RecommendationLifecycleService,
    RecommendationHistoryService,
    RecommendationEngineService,

    AiTaskService,
    AiTaskQueueService,
    AiTaskSchedulerService,
    AiTaskExecutorService,

    NotificationPreferencesService,
    EscalationPolicyService,
    InAppNotificationProvider,
    EmailNotificationProvider,
    WebhookNotificationProvider,
    NotificationHistoryService,
    NotificationEngineService,

    DailySummaryService,
    WeeklyReviewService,
    MonthlyBusinessReviewService,
    ExecutiveBriefingService,

    WorkflowStateService,
    WorkflowHistoryService,
    WorkflowEngineService,
  ],
  exports: [
    AiOrchestratorService,
    AiRuntimeService,
    EventBusService,
    EventStoreService,
    EventReplayService,
    WorkflowEngineService,
    ExecutiveBriefingService,
    NotificationEngineService,
  ],
})
export class AiModule {}
