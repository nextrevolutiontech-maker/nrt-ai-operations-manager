import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationPriorityService {
  calculatePriorityScore(estimatedRoi: number, riskLevel: string): number {
    let base = estimatedRoi * 10;
    if (riskLevel === 'LOW') base += 30;
    if (riskLevel === 'MEDIUM') base += 20;
    if (riskLevel === 'HIGH') base += 10;
    return Math.round(base);
  }
}
