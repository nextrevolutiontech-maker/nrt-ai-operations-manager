import { MonitoringService } from '../monitoring/monitoring.service';

describe('Production Readiness & Monitoring', () => {
  let monitoring: MonitoringService;

  beforeEach(() => {
    monitoring = new MonitoringService();
  });

  it('should return valid system metrics and uptime', () => {
    const metrics = monitoring.getSystemMetrics();

    expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(metrics.memory.heapUsedMb).toBeDefined();
    expect(metrics.performanceTargets.dashboardTargetMs).toBe(2000);
    expect(metrics.performanceTargets.aiResponseTargetMs).toBe(3000);
  });
});
