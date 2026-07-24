import { Injectable } from '@nestjs/common';

@Injectable()
export class RuntimeMetricsService {
  private eventsProcessed = 0;
  private recommendationsGenerated = 0;
  private tasksExecuted = 0;

  incrementEvents() {
    this.eventsProcessed++;
  }

  incrementRecommendations() {
    this.recommendationsGenerated++;
  }

  incrementTasks() {
    this.tasksExecuted++;
  }

  getMetrics() {
    return {
      eventsProcessed: this.eventsProcessed,
      recommendationsGenerated: this.recommendationsGenerated,
      tasksExecuted: this.tasksExecuted,
    };
  }
}
