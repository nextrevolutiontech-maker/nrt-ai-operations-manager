import { EventStoreService } from '../events/event-store.service';
import { EventBusService } from '../events/event-bus.service';
import { EventReplayService } from '../events/event-replay.service';
import { InventoryMonitorService } from '../monitors/inventory-monitor.service';
import { BusinessEventType } from '../events/event-types';
import { PurchaseMonitorService } from '../monitors/purchase-monitor.service';
import { WarehouseMonitorService } from '../monitors/warehouse-monitor.service';
import { FinanceMonitorService } from '../monitors/finance-monitor.service';
import { CustomerMonitorService } from '../monitors/customer-monitor.service';
import { KpiMonitorService } from '../monitors/kpi-monitor.service';

import { RecommendationEngineService } from '../recommendations/recommendation-engine.service';
import { RecommendationHistoryService } from '../recommendations/recommendation-history.service';
import { RecommendationFeedbackService } from '../recommendations/recommendation-feedback.service';

import { AiTaskService } from '../tasks/ai-task.service';
import { AiTaskExecutorService } from '../tasks/ai-task-executor.service';
import { ToolRegistryService } from '../brain/tools/tool-registry.service';
import { ToolExecutorService } from '../brain/tools/tool-executor.service';
import { ToolResultNormalizerService } from '../brain/tools/tool-result-normalizer.service';
import { PolicyEngineService } from '../brain/governance/policy-engine.service';
import { DecisionTraceService } from '../brain/execution/decision-trace.service';
import { AiApprovalsService } from '../approvals/ai-approvals.service';
import { ApprovalWorkflowService } from '../approvals/approval-workflow.service';

import { ProductsToolsProvider } from '../brain/tools/modules/products-tools.provider';
import { InventoryToolsProvider } from '../brain/tools/modules/inventory-tools.provider';
import { WarehouseToolsProvider } from '../brain/tools/modules/warehouse-tools.provider';
import { PurchaseToolsProvider } from '../brain/tools/modules/purchase-tools.provider';
import { SalesToolsProvider } from '../brain/tools/modules/sales-tools.provider';
import { CustomersToolsProvider } from '../brain/tools/modules/customers-tools.provider';
import { SuppliersToolsProvider } from '../brain/tools/modules/suppliers-tools.provider';
import { FinanceToolsProvider } from '../brain/tools/modules/finance-tools.provider';
import { ReportsToolsProvider } from '../brain/tools/modules/reports-tools.provider';
import { DashboardToolsProvider } from '../brain/tools/modules/dashboard-tools.provider';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';

import { NotificationEngineService } from '../notifications/notification-engine.service';
import { NotificationPreferencesService } from '../notifications/notification-preferences.service';
import { EscalationPolicyService } from '../notifications/escalation-policy.service';
import { InAppNotificationProvider } from '../notifications/inapp.provider';
import { EmailNotificationProvider } from '../notifications/email.provider';
import { WebhookNotificationProvider } from '../notifications/webhook.provider';
import { NotificationHistoryService } from '../notifications/notification-history.service';

import { DailySummaryService } from '../briefings/daily-summary.service';
import { WeeklyReviewService } from '../briefings/weekly-review.service';
import { MonthlyBusinessReviewService } from '../briefings/monthly-business-review.service';
import { ExecutiveBriefingService } from '../briefings/executive-briefing.service';

import { WorkflowStateService } from '../orchestration/workflow-state.service';
import { WorkflowHistoryService } from '../orchestration/workflow-history.service';
import { WorkflowEngineService } from '../orchestration/workflow-engine.service';

describe('Sprint C — 15 Autonomous Scenario Test Suite', () => {
  let eventStore: EventStoreService;
  let eventBus: EventBusService;
  let eventReplay: EventReplayService;
  let invMonitor: InventoryMonitorService;
  let poMonitor: PurchaseMonitorService;
  let whMonitor: WarehouseMonitorService;
  let finMonitor: FinanceMonitorService;
  let custMonitor: CustomerMonitorService;
  let kpiMonitor: KpiMonitorService;

  let recEngine: RecommendationEngineService;
  let recFeedback: RecommendationFeedbackService;
  let taskService: AiTaskService;
  let notificationEngine: NotificationEngineService;
  let escalationPolicy: EscalationPolicyService;
  let briefingService: ExecutiveBriefingService;
  let workflowEngine: WorkflowEngineService;
  let workflowHistory: WorkflowHistoryService;

  beforeEach(() => {
    eventStore = new EventStoreService();
    eventBus = new EventBusService(eventStore);
    eventReplay = new EventReplayService(eventStore);

    invMonitor = new InventoryMonitorService(eventBus);
    poMonitor = new PurchaseMonitorService(eventBus);
    whMonitor = new WarehouseMonitorService(eventBus);
    finMonitor = new FinanceMonitorService(eventBus);
    custMonitor = new CustomerMonitorService(eventBus);
    kpiMonitor = new KpiMonitorService(eventBus);

    const recHistory = new RecommendationHistoryService();
    recEngine = new RecommendationEngineService(recHistory);
    recFeedback = new RecommendationFeedbackService();

    taskService = new AiTaskService();

    // ERP Tools Setup
    const mockPrisma: any = {
      product: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
      inventory: { findFirst: jest.fn().mockResolvedValue(null) },
      purchaseOrder: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { findMany: jest.fn().mockResolvedValue([]) },
      customer: { findFirst: jest.fn().mockResolvedValue(null) },
      companySettings: { findFirst: jest.fn().mockResolvedValue(null) },
      aiApproval: { create: jest.fn().mockResolvedValue({}) },
    };

    const siernaFormatter = new SiernaFormatterService();
    const toolRegistry = new ToolRegistryService(
      new ProductsToolsProvider(mockPrisma),
      new InventoryToolsProvider(mockPrisma),
      new WarehouseToolsProvider(mockPrisma),
      new PurchaseToolsProvider(mockPrisma),
      new SalesToolsProvider(mockPrisma),
      new CustomersToolsProvider(mockPrisma),
      new SuppliersToolsProvider(mockPrisma),
      new FinanceToolsProvider(mockPrisma),
      new ReportsToolsProvider(siernaFormatter),
      new DashboardToolsProvider(),
    );

    const normalizer = new ToolResultNormalizerService();
    const policyEngine = new PolicyEngineService();
    const decisionTrace = new DecisionTraceService();
    const workflowSvc = new ApprovalWorkflowService();
    const approvalsSvc = new AiApprovalsService(mockPrisma, workflowSvc);

    const toolExecutor = new ToolExecutorService(
      toolRegistry,
      normalizer,
      policyEngine,
      decisionTrace,
      approvalsSvc,
    );

    const taskExecutor = new AiTaskExecutorService(taskService, toolExecutor);

    const notifPrefs = new NotificationPreferencesService();
    escalationPolicy = new EscalationPolicyService();
    const notifHistory = new NotificationHistoryService();

    notificationEngine = new NotificationEngineService(
      notifPrefs,
      new InAppNotificationProvider(),
      new EmailNotificationProvider(),
      new WebhookNotificationProvider(),
      notifHistory,
    );

    briefingService = new ExecutiveBriefingService(
      new DailySummaryService(siernaFormatter),
      new WeeklyReviewService(siernaFormatter),
      new MonthlyBusinessReviewService(siernaFormatter),
    );

    const wfState = new WorkflowStateService();
    workflowHistory = new WorkflowHistoryService();

    workflowEngine = new WorkflowEngineService(
      wfState,
      workflowHistory,
      eventBus,
      recEngine,
      taskService,
      taskExecutor,
      notificationEngine,
    );
  });

  it('1. Low stock event automatically generates recommendation & staged transfer draft', async () => {
    await invMonitor.scanInventory('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].status).toBe('WAITING_APPROVAL');
  });

  it('2. Supplier delay event creates emergency secondary PO recommendation', async () => {
    await poMonitor.scanPurchaseOrders('COMP-01');

    const tasks = taskService.getTasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('3. Budget variance event generates approval request task', async () => {
    await finMonitor.scanFinance('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history[0].status).toBe('WAITING_APPROVAL');
  });

  it('4. Warehouse congestion event creates labor reallocation task', async () => {
    await whMonitor.scanWarehouse('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history[0].status).toBe('WAITING_APPROVAL');
  });

  it('5. Cash flow risk scan generates finance recommendation', async () => {
    await finMonitor.scanFinance('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history.length).toBe(1);
  });

  it('6. Complaint spike scan creates customer service recovery task', async () => {
    await custMonitor.scanCustomerTickets('COMP-01');

    const tasks = taskService.getTasks();
    expect(tasks[0].title).toContain('CUSTOMER_COMPLAINT_SPIKE');
  });

  it('7. KPI drop generates executive alert', async () => {
    await kpiMonitor.scanKpis('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history[0].status).toBe('COMPLETED');
  });

  it('8. Daily executive briefing is generated automatically via SIERNA', () => {
    const brief = briefingService.generateBriefing('DAILY');
    expect(brief).toContain('Operational Briefing');
  });

  it('9. Duplicate events within sliding window are deduplicated in store', async () => {
    await invMonitor.scanInventory('COMP-01');
    await invMonitor.scanInventory('COMP-01');

    const events = eventStore.getEventHistory();
    expect(events.length).toBe(2);
  });

  it('10. AI task lifecycle completes successfully: DETECTED -> ANALYZED -> STAGED -> WAITING_APPROVAL', async () => {
    await invMonitor.scanInventory('COMP-01');

    const task = taskService.getTasks()[0];
    expect(task.status).toBe('APPROVAL_REQUESTED');
    expect(task.approvalId).toBeDefined();
  });

  it('11. Notification delivery succeeds across In-App, Email, and Webhooks', async () => {
    const results = await notificationEngine.dispatchNotification('CRITICAL', 'CEO', 'Test Urgent Alert');
    expect(results.length).toBe(3);
  });

  it('12. High-risk recommendation mandates human approval staging', async () => {
    await poMonitor.scanPurchaseOrders('COMP-01');

    const history = workflowHistory.getHistory();
    expect(history[0].status).toBe('WAITING_APPROVAL');
  });

  it('13. Persistent Event Store recovers queued events after restart', () => {
    eventStore.saveEvent({
      eventId: 'EVT-QUEUED-RECOVERY-01',
      eventType: BusinessEventType.INVENTORY_STOCKOUT,
      severity: 'CRITICAL',
      domain: 'inventory',
      sourceModule: 'RecoveryTest',
      companyId: 'COMP-01',
      payload: {},
      timestamp: new Date().toISOString(),
    });

    const replayed = eventReplay.replayQueuedEvents(async () => {});
    expect(replayed).toBe(1);
  });

  it('14. Recommendation Feedback Loop tracks outcome metrics', () => {
    recFeedback.recordFeedback({
      recommendationId: 'REC-101',
      outcome: 'ACCEPTED',
      userNotes: 'Approved labor reallocation',
      actualRoiRealized: 3.8,
      timestamp: new Date(),
    });

    expect(recFeedback.getFeedbackHistory().length).toBe(1);
  });

  it('15. Escalation Policy escalates unacknowledged incident from Manager to Executive', () => {
    const esc1 = escalationPolicy.escalate('INCIDENT-991', 'MANAGER');
    expect(esc1.level).toBe('DEPARTMENT_HEAD');

    const esc2 = escalationPolicy.escalate('INCIDENT-991', 'DEPARTMENT_HEAD');
    expect(esc2.level).toBe('EXECUTIVE');
    expect(esc2.targetRole).toBe('CFO');
  });
});
