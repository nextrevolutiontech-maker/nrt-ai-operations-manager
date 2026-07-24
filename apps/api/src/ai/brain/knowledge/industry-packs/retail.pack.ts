import { IndustryPack } from './industry-pack.interface';

export const retailPack: IndustryPack = {
  metadata: {
    id: 'retail',
    name: 'Retail & Wholesale Operations Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['ITR', 'Shrinkage', 'Planogram', 'MAP', 'POS'],
  },
  workflowSummary:
    'Vendor Sourcing -> Central DC Receiving -> Store Replenishment & Planogram -> POS Checkout -> Cycle Count -> Reorder.',
  criticalKpis: {
    InventoryTurnover: '8.0x - 14.0x / year',
    ShrinkageRate: '< 0.8%',
    FastMoverStockoutRate: '< 1.0%',
  },
  operationalRisks: ['Inventory shrinkage theft/damage', 'Obsolete stock buildup', 'Planogram non-compliance'],
  complianceRequirements: ['PCI-DSS', 'Consumer Protection Act', 'Fair Trade Standards'],
  aiRestrictions: [
    'NEVER auto-adjust list prices below Minimum Advertised Price (MAP) policy',
    'NEVER execute store inventory write-offs exceeding $500 without sign-off',
  ],
  sopReferences: {
    Replenishment: 'SOP-RET-018',
    ShrinkageAudit: 'SOP-RET-022',
  },
};
