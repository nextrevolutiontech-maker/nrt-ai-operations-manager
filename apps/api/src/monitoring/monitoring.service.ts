import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      },
      performanceTargets: {
        dashboardTargetMs: 2000,
        aiResponseTargetMs: 3000,
        reportGenerationTargetMs: 5000,
      },
      nodeVersion: process.version,
      timestamp: new Date(),
    };
  }
}
