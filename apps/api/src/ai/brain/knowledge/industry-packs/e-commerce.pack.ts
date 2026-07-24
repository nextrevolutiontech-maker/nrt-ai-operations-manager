import { IndustryPack } from './industry-pack.interface';

export const ecommercePack: IndustryPack = {
  metadata: {
    id: 'e-commerce',
    name: 'E-Commerce & Digital Retail Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['CycleTime', 'RMA', 'SameDayDispatch', 'PCI-DSS', 'CartAbandon'],
  },
  workflowSummary:
    'Checkout -> Fraud Screening -> Order Routing -> Pick/Pack & Barcode Scan -> Shipping Label -> Tracking -> RMA.',
  criticalKpis: {
    FulfillmentCycleTime: '< 4.0 hours',
    SameDayDispatchRate: '> 98.5%',
    RMARate: '< 4.0%',
  },
  operationalRisks: ['Flash-sale inventory overselling', 'Payment gateway fraud spikes', 'High apparel return rates'],
  complianceRequirements: ['PCI-DSS Security', 'GDPR / CCPA Data Privacy', 'FTC Mail Order Rule'],
  aiRestrictions: [
    'NEVER auto-bypass payment fraud risk flags on high-value orders ($> $500)',
    'NEVER execute mass customer account purges without legal confirmation',
  ],
  sopReferences: {
    OrderRouting: 'SOP-ECOM-005',
    AutoRMA: 'SOP-ECOM-014',
  },
};
