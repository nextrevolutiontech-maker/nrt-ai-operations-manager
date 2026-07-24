import { Injectable, Logger } from '@nestjs/common';

export type EscalationLevel = 'MANAGER' | 'DEPARTMENT_HEAD' | 'EXECUTIVE';

export interface EscalationRecord {
  incidentId: string;
  level: EscalationLevel;
  targetRole: string;
  escalatedAt: Date;
}

@Injectable()
export class EscalationPolicyService {
  private readonly logger = new Logger(EscalationPolicyService.name);

  escalate(incidentId: string, currentLevel: EscalationLevel = 'MANAGER'): EscalationRecord {
    let nextLevel: EscalationLevel = 'DEPARTMENT_HEAD';
    let targetRole = 'OPERATIONS_DIRECTOR';

    if (currentLevel === 'DEPARTMENT_HEAD') {
      nextLevel = 'EXECUTIVE';
      targetRole = 'CFO';
    }

    const record: EscalationRecord = {
      incidentId,
      level: nextLevel,
      targetRole,
      escalatedAt: new Date(),
    };

    this.logger.warn(
      `[ESCALATION POLICY] Escalated Incident ${incidentId} to ${nextLevel} (${targetRole})`,
    );

    return record;
  }
}
