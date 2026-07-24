import { RuntimeStateService } from '../runtime/runtime-state.service';
import { RuntimeHealthService } from '../runtime/runtime-health.service';
import { RuntimeMetricsService } from '../runtime/runtime-metrics.service';
import { AiRuntimeService } from '../runtime/ai-runtime.service';

describe('AI Runtime & Health Services', () => {
  let stateService: RuntimeStateService;
  let healthService: RuntimeHealthService;
  let metricsService: RuntimeMetricsService;
  let runtimeService: AiRuntimeService;

  beforeEach(() => {
    stateService = new RuntimeStateService();
    healthService = new RuntimeHealthService(stateService);
    metricsService = new RuntimeMetricsService();
    runtimeService = new AiRuntimeService(stateService, healthService, metricsService);
  });

  it('should initialize and manage runtime state transitions', () => {
    expect(stateService.getStatus()).toBe('STOPPED');
    runtimeService.startRuntime();
    expect(stateService.getStatus()).toBe('STARTING');
  });

  it('should track runtime metrics correctly', () => {
    metricsService.incrementEvents();
    metricsService.incrementRecommendations();
    metricsService.incrementTasks();

    const metrics = metricsService.getMetrics();
    expect(metrics.eventsProcessed).toBe(1);
    expect(metrics.recommendationsGenerated).toBe(1);
    expect(metrics.tasksExecuted).toBe(1);
  });

  it('should perform runtime recovery cleanly', () => {
    healthService.recover();
    expect(stateService.getStatus()).toBe('RECOVERING');
  });
});
