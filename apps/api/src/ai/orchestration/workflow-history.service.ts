import { Injectable } from '@nestjs/common';
import { WorkflowInstance } from './workflow-state.service';

@Injectable()
export class WorkflowHistoryService {
  private readonly history: WorkflowInstance[] = [];

  logWorkflow(instance: WorkflowInstance) {
    this.history.push({ ...instance });
  }

  getHistory(): WorkflowInstance[] {
    return this.history;
  }
}
