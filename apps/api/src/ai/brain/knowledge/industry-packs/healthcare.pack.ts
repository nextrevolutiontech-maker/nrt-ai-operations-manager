import { IndustryPack } from './industry-pack.interface';

export const healthcarePack: IndustryPack = {
  metadata: {
    id: 'healthcare',
    name: 'Healthcare & Hospital Operations Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['HIPAA', 'BedTurnover', 'ColdChain', 'FDA', 'MedicalSupply'],
  },
  workflowSummary:
    'Patient Triage -> Bed/Ward Allocation -> Clinical Supply Requisition -> Cold-Chain Audit -> Patient Care -> Discharge & Billing.',
  criticalKpis: {
    BedOccupancy: '80% - 88%',
    MedicalSupplyStockout: '0.0%',
    DrugExpirationScrap: '$0',
  },
  operationalRisks: [
    'Emergency drug/supply stockouts',
    'Cold-chain refrigeration failure',
    'HIPAA patient privacy breaches',
  ],
  complianceRequirements: ['HIPAA Privacy Rule', 'FDA Drug Traceability', 'Joint Commission Standards'],
  aiRestrictions: [
    'NEVER auto-alter drug dosages, prescriptions, or clinical treatment plans',
    'NEVER override emergency medical triage prioritization or care protocols',
  ],
  sopReferences: {
    ColdChain: 'SOP-MED-009',
    SupplyTraceability: 'SOP-MED-015',
  },
};
