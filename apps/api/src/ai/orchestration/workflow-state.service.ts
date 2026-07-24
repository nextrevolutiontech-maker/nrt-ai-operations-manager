import { Injectable } from '@nestjs/common';

export type WorkflowStatus = 'STARTED' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED';

export interface WorkflowInstance {
  id: string;
  name: string;
  context: any;
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkflowStateService {
  private readonly workflows: Map<string, WorkflowInstance> = new Map();

  createInstance(name: string, context: any, totalSteps: number): WorkflowInstance {
    const id = `WF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const instance: WorkflowInstance = {
      id,
      name,
      context,
      status: 'STARTED',
      currentStep: 1,
      totalSteps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(id, instance);
    return instance;
  }

  updateStatus(id: string, status: WorkflowStatus, step?: number) {
    const wf = this.workflows.get(id);
    if (wf) {
      wf.status = status;
      if (step) wf.currentStep = step;
      wf.updatedAt = new Date();
    }
    return wf;
  }

  getWorkflow(id: string): WorkflowInstance | undefined {
    return this.workflows.get(id);
  }
}
