import { Injectable } from '@nestjs/common';

@Injectable()
export class ConflictResolutionService {
  resolveExpediteRoi(params: {
    freightCost: number;
    preservedMargin: number;
  }): { approveAirFreight: boolean; roi: number; recommendation: string } {
    if (params.freightCost <= 0) {
      return { approveAirFreight: false, roi: 0, recommendation: 'Invalid freight cost' };
    }

    const roi = (params.preservedMargin - params.freightCost) / params.freightCost;
    const approveAirFreight = roi >= 2.0;

    const recommendation = approveAirFreight
      ? `Approve Expedited Air Freight. ROI is ${roi.toFixed(1)}x (Preserves $${params.preservedMargin} margin vs $${params.freightCost} freight spend).`
      : `Deny Air Freight. ROI of ${roi.toFixed(1)}x is below the 2.0x threshold. Use standard freight and issue customer delay notifications.`;

    return { approveAirFreight, roi, recommendation };
  }

  resolveBlanketPoTranche(params: {
    totalPoValue: number;
    monthlyBudgetAllowance: number;
  }): { tranches: number; trancheValue: number; strategy: string } {
    const tranches = Math.ceil(params.totalPoValue / params.monthlyBudgetAllowance);
    const trancheValue = Math.round((params.totalPoValue / tranches) * 100) / 100;

    return {
      tranches,
      trancheValue,
      strategy: `Structure a ${tranches}-tranche Blanket Purchase Order ($${trancheValue} per tranche) to stay within the monthly budget cap of $${params.monthlyBudgetAllowance} while protecting volume discount pricing.`,
    };
  }
}
