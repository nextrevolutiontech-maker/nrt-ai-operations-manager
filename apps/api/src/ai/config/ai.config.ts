export interface AiConfig {
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  confidenceThresholds: {
    high: number;
    medium: number;
  };
  approvalThresholds: {
    opsManager: number;
    cfo: number;
    scrapWriteoff: number;
    rmaAutoApproval: number;
  };
  priorityOrder: string[];
  defaultProvider: string;
  timeouts: {
    providerMs: number;
  };
  retries: number;
}

export const AI_CONFIG: AiConfig = {
  riskThresholds: {
    low: 1000,
    medium: 5000,
    high: 50000,
  },
  confidenceThresholds: {
    high: 0.90,
    medium: 0.70,
  },
  approvalThresholds: {
    opsManager: 5000,
    cfo: 50000,
    scrapWriteoff: 1000,
    rmaAutoApproval: 50,
  },
  priorityOrder: [
    'P1_SAFETY',
    'P2_LEGAL',
    'P3_CUSTOMER',
    'P4_REVENUE',
    'P5_CONTINUITY',
    'P6_COST',
    'P7_SPEED',
  ],
  defaultProvider: process.env.AI_PROVIDER || 'gemini',
  timeouts: {
    providerMs: 15000,
  },
  retries: 2,
};
