import { Injectable } from '@nestjs/common';
import { AI_CONFIG } from '../../config/ai.config';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAssessment {
  level: RiskLevel;
  financialAmount: number;
  reasons: string[];
}

@Injectable()
export class RiskEngineService {
  assessRisk(params: {
    financialAmount?: number;
    isSafetyIncident?: boolean;
    isLegalViolation?: boolean;
    isFacilityOutage?: boolean;
    isComplianceBreach?: boolean;
  }): RiskAssessment {
    const amount = params.financialAmount || 0;
    const reasons: string[] = [];

    if (
      params.isSafetyIncident ||
      params.isLegalViolation ||
      params.isFacilityOutage ||
      amount > AI_CONFIG.riskThresholds.high
    ) {
      if (params.isSafetyIncident) reasons.push('Life Safety / Hazard Incident');
      if (params.isLegalViolation) reasons.push('Legal / Regulatory Compliance Violation');
      if (params.isFacilityOutage) reasons.push('Severity 1 Facility / IT Outage');
      if (amount > AI_CONFIG.riskThresholds.high)
        reasons.push(`Financial exposure ($${amount}) > $50,000 threshold`);

      return { level: 'CRITICAL', financialAmount: amount, reasons };
    }

    if (amount > AI_CONFIG.riskThresholds.medium || params.isComplianceBreach) {
      if (amount > AI_CONFIG.riskThresholds.medium)
        reasons.push(`Financial exposure ($${amount}) > $5,000 threshold`);
      if (params.isComplianceBreach) reasons.push('Departmental Compliance Policy Breach');

      return { level: 'HIGH', financialAmount: amount, reasons };
    }

    if (amount > AI_CONFIG.riskThresholds.low) {
      reasons.push(`Financial amount ($${amount}) > $1,000 threshold`);
      return { level: 'MEDIUM', financialAmount: amount, reasons };
    }

    reasons.push('Standard low-risk routine operational action (< $1,000)');
    return { level: 'LOW', financialAmount: amount, reasons };
  }
}
