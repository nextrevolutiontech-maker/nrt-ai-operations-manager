import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { RuntimeStateService } from './runtime-state.service';
import { RuntimeHealthService } from './runtime-health.service';
import { RuntimeMetricsService } from './runtime-metrics.service';

@Injectable()
export class AiRuntimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiRuntimeService.name);

  constructor(
    private readonly stateService: RuntimeStateService,
    private readonly healthService: RuntimeHealthService,
    private readonly metricsService: RuntimeMetricsService,
  ) {}

  onModuleInit() {
    this.startRuntime();
  }

  onModuleDestroy() {
    this.stopRuntime();
  }

  startRuntime() {
    this.logger.log('[AI RUNTIME] Starting Enterprise AI Operations Manager Runtime...');
    this.stateService.setStatus('STARTING');

    setTimeout(() => {
      this.stateService.setStatus('RUNNING');
      this.logger.log('[AI RUNTIME] Enterprise AI Operations Manager Runtime is RUNNING.');
    }, 100);
  }

  stopRuntime() {
    this.logger.log('[AI RUNTIME] Stopping Enterprise AI Operations Manager Runtime...');
    this.stateService.setStatus('STOPPED');
  }

  getRuntimeOverview() {
    return {
      health: this.healthService.checkHealth(),
      metrics: this.metricsService.getMetrics(),
    };
  }
}
