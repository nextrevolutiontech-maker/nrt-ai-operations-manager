import { IndustryPack } from './industry-pack.interface';

export const manufacturingPack: IndustryPack = {
  metadata: {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial Production Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['OEE', 'BOM', 'Scrap', 'WorkOrders', 'ISO9001'],
  },
  workflowSummary:
    'Forecast -> BOM Explosion -> Raw Material Purchase -> Work Order Release -> Assembly Execution -> QA Inspection -> Finished Goods Intake.',
  criticalKpis: {
    OEE: '> 85.0%',
    ScrapRate: '< 1.2%',
    UnplannedDowntime: '< 2.0 hours/month',
  },
  operationalRisks: [
    'Single-point machine failure',
    'Raw material component stockouts',
    'QA tolerance failure scrap spikes',
  ],
  complianceRequirements: ['ISO 9001', 'ISO 14001', 'OSHA Safety Standards', 'REACH/RoHS'],
  aiRestrictions: [
    'NEVER auto-alter machine operating parameters (speeds, temps, press PSI)',
    'NEVER override QA safety holds or release un-inspected batches',
  ],
  sopReferences: {
    WorkOrderRelease: 'SOP-MFG-004',
    ScrapAudit: 'SOP-MFG-012',
  },
};
