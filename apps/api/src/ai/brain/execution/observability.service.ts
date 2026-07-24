import { Injectable, Logger } from '@nestjs/common';

export interface TelemetryMetric {
  provider: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  toolCallsCount: number;
  success: boolean;
  errorMessage?: string;
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);
  private readonly metrics: TelemetryMetric[] = [];

  recordMetric(metric: TelemetryMetric) {
    this.metrics.push(metric);
    this.logger.log(
      `[AI TELEMETRY] Provider: ${metric.provider} | Latency: ${metric.latencyMs}ms | Tokens: ${metric.totalTokens} | Tools: ${metric.toolCallsCount} | Status: ${metric.success ? 'SUCCESS' : 'FAILED'}`,
    );
  }

  getMetricsSummary() {
    const totalRequests = this.metrics.length;
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const avgLatencyMs =
      totalRequests > 0
        ? this.metrics.reduce((sum, m) => sum + m.latencyMs, 0) / totalRequests
        : 0;

    return {
      totalRequests,
      totalTokens,
      avgLatencyMs: Math.round(avgLatencyMs),
      successRate:
        totalRequests > 0
          ? (this.metrics.filter((m) => m.success).length / totalRequests) * 100
          : 100,
    };
  }
}
