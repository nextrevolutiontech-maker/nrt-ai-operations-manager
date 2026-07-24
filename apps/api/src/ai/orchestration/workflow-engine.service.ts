import { Injectable, Logger } from '@nestjs/common';
import { WorkflowStateService, WorkflowInstance } from './workflow-state.service';
import { WorkflowHistoryService } from './workflow-history.service';
import { EventBusService } from '../events/event-bus.service';
import { RecommendationEngineService } from '../recommendations/recommendation-engine.service';
import { AiTaskService } from '../tasks/ai-task.service';
import { AiTaskExecutorService } from '../tasks/ai-task-executor.service';
import { NotificationEngineService } from '../notifications/notification-engine.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly stateService: WorkflowStateService,
    private readonly historyService: WorkflowHistoryService,
    private readonly eventBus: EventBusService,
    private readonly recEngine: RecommendationEngineService,
    private readonly taskService: AiTaskService,
    private readonly taskExecutor: AiTaskExecutorService,
    private readonly notificationEngine: NotificationEngineService,
  ) {
    this.registerAutonomousListeners();
  }

  private registerAutonomousListeners() {
    this.eventBus.subscribe('*', async (event) => {
      this.logger.log(`[AUTONOMOUS WORKFLOW] Processing Event ${event.eventType} via Autonomous Workflow Engine`);
      await this.runAutonomousScenario(event);
    });
  }

  async runAutonomousScenario(event: any): Promise<WorkflowInstance> {
    const wf = this.stateService.createInstance(`Autonomous Workflow - ${event.eventType}`, event, 4);

    // Step 1: Generate SIERNA Recommendation
    const rec = this.recEngine.generateRecommendation(event);
    this.stateService.updateStatus(wf.id, 'STARTED', 2);

    // Step 2: Create AI Task
    const task = this.taskService.createTask(
      `Mitigate ${event.eventType}`,
      rec.situation,
      event.severity,
    );
    this.stateService.updateStatus(wf.id, 'STARTED', 3);

    // Step 3: Execute Task via Tool Executor & Governing Policy Engine
    let toolName: string | undefined;
    let toolArgs: any;

    if (event.eventType.includes('LOW_STOCK')) {
      toolName = 'inventory_createStockTransferDraft';
      toolArgs = { fromWarehouseId: 'WH-02', toWarehouseId: 'WH-01', quantity: 20 };
    } else if (event.eventType.includes('PO_DELAY')) {
      toolName = 'purchase_supplierReplacementDraft';
      toolArgs = { secondarySupplierId: 'SUP-02' };
    } else if (event.eventType.includes('BUDGET_VARIANCE')) {
      toolName = 'finance_budgetVarianceProposal';
      toolArgs = { requestedAmount: 17000 };
    } else if (event.eventType.includes('DOCK_CONGESTION')) {
      toolName = 'warehouse_laborReallocationDraft';
      toolArgs = { fromDepartment: 'Packing', toDepartment: 'Receiving' };
    }

    const execRes = await this.taskExecutor.executeTask(task, toolName, toolArgs, {
      sessionId: `AUTONOMOUS-SESSION-${wf.id}`,
    });

    // Step 4: Dispatch Multi-Channel Notifications
    await this.notificationEngine.dispatchNotification(
      event.severity,
      'OPERATIONS_MANAGER',
      `[AUTONOMOUS AI ACTION] ${rec.situation} -> ${rec.recommendedAction}`,
    );

    if (execRes?.status === 'STAGED_FOR_APPROVAL') {
      this.stateService.updateStatus(wf.id, 'WAITING_APPROVAL', 4);
    } else {
      this.stateService.updateStatus(wf.id, 'COMPLETED', 4);
    }

    this.historyService.logWorkflow(wf);
    return wf;
  }
}
