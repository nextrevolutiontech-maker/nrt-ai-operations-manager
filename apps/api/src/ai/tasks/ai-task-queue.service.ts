import { Injectable, Logger } from '@nestjs/common';
import { AiTaskRecord } from './ai-task.entity';

@Injectable()
export class AiTaskQueueService {
  private readonly logger = new Logger(AiTaskQueueService.name);
  private readonly queue: AiTaskRecord[] = [];

  enqueue(task: AiTaskRecord) {
    this.queue.push(task);
    this.logger.log(`[AI TASK QUEUE] Enqueued Task ${task.id} (${task.title})`);
  }

  dequeue(): AiTaskRecord | undefined {
    return this.queue.shift();
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
