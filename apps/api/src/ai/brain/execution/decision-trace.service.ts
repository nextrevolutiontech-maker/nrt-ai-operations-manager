import { Injectable, Logger } from '@nestjs/common';

export interface DecisionTraceLog {
  traceId: string;
  timestamp: string;
  sessionId: string;
  intent: string;
  evidence: string;
  applicablePolicies: string[];
  riskLevel: string;
  confidenceScore: number;
  selectedRecommendation: string;
  toolsExecuted: string[];
}

@Injectable()
export class DecisionTraceService {
  private readonly logger = new Logger(DecisionTraceService.name);
  private readonly traces: DecisionTraceLog[] = [];

  logTrace(trace: Omit<DecisionTraceLog, 'traceId' | 'timestamp'>): DecisionTraceLog {
    const fullTrace: DecisionTraceLog = {
      ...trace,
      traceId: `TRACE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.traces.push(fullTrace);
    this.logger.log(
      `[DECISION TRACE] ${fullTrace.traceId} | Intent: ${fullTrace.intent} | Risk: ${fullTrace.riskLevel} | Confidence: ${(fullTrace.confidenceScore * 100).toFixed(0)}%`,
    );

    return fullTrace;
  }

  getTraceHistory(sessionId?: string): DecisionTraceLog[] {
    if (sessionId) {
      return this.traces.filter((t) => t.sessionId === sessionId);
    }
    return this.traces;
  }
}
