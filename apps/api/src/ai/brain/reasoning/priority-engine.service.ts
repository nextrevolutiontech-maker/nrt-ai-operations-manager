import { Injectable } from '@nestjs/common';
import { AI_CONFIG } from '../../config/ai.config';

export type PriorityLevel =
  | 'P1_SAFETY'
  | 'P2_LEGAL'
  | 'P3_CUSTOMER'
  | 'P4_REVENUE'
  | 'P5_CONTINUITY'
  | 'P6_COST'
  | 'P7_SPEED';

@Injectable()
export class PriorityEngineService {
  getPriorityRank(priority: PriorityLevel): number {
    const index = AI_CONFIG.priorityOrder.indexOf(priority);
    return index !== -1 ? index : 99;
  }

  comparePriorities(a: PriorityLevel, b: PriorityLevel): number {
    return this.getPriorityRank(a) - this.getPriorityRank(b);
  }

  isHigherPriority(a: PriorityLevel, b: PriorityLevel): boolean {
    return this.getPriorityRank(a) < this.getPriorityRank(b);
  }
}
