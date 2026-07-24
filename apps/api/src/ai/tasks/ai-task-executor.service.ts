import { Injectable, Logger } from '@nestjs/common';
import { AiTaskService } from './ai-task.service';
import { ToolExecutorService } from '../brain/tools/tool-executor.service';
import { AiTaskRecord } from './ai-task.entity';

@Injectable()
export class AiTaskExecutorService {
  private readonly logger = new Logger(AiTaskExecutorService.name);

  constructor(
    private readonly taskService: AiTaskService,
    private readonly toolExecutor: ToolExecutorService,
  ) {}

  async executeTask(task: AiTaskRecord, toolName?: string, toolArgs?: any, context?: any) {
    this.logger.log(`[AI TASK EXECUTOR] Executing Task ${task.id} (${task.title})...`);
    this.taskService.updateTaskStatus(task.id, 'ANALYZED');

    if (toolName) {
      this.taskService.updateTaskStatus(task.id, 'DRAFT_GENERATED');
      const res = await this.toolExecutor.executeTool(toolName, toolArgs, context);

      if (res.status === 'STAGED_FOR_APPROVAL') {
        this.taskService.updateTaskStatus(task.id, 'APPROVAL_REQUESTED');
        task.approvalId = res.approvalId;
      } else {
        this.taskService.updateTaskStatus(task.id, 'EXECUTED');
        this.taskService.updateTaskStatus(task.id, 'VERIFIED');
        this.taskService.updateTaskStatus(task.id, 'CLOSED');
      }
      return res;
    }

    this.taskService.updateTaskStatus(task.id, 'CLOSED');
    return { status: 'COMPLETED', taskId: task.id };
  }
}
