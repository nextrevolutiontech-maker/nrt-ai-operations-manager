import { Injectable } from '@nestjs/common';
import { AiTaskRecord, AiTaskStatus } from './ai-task.entity';

@Injectable()
export class AiTaskService {
  private readonly tasks: Map<string, AiTaskRecord> = new Map();

  createTask(title: string, description: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): AiTaskRecord {
    const id = `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const task: AiTaskRecord = {
      id,
      title,
      description,
      status: 'DETECTED',
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  updateTaskStatus(id: string, status: AiTaskStatus): AiTaskRecord | undefined {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
    }
    return task;
  }

  getTasks(): AiTaskRecord[] {
    return Array.from(this.tasks.values());
  }
}
