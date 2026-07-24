import { IndustryPack } from './industry-pack.interface';

export const constructionPack: IndustryPack = {
  metadata: {
    id: 'construction',
    name: 'Construction Operations Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['OSHA', 'ScheduleVariance', 'CostVariance', 'BuildingPermits'],
  },
  workflowSummary:
    'Design & Permits -> Subcontractor Bidding -> Site Staging -> Material Delivery -> Structural Assembly -> Inspection -> Handover.',
  criticalKpis: {
    ScheduleVariance: '>= 0 Days',
    CostVariance: '>= $0',
    MaterialWasteRate: '< 3.0%',
    OSHALostTimeIncidents: '0.0',
  },
  operationalRisks: ['Weather delays', 'Subcontractor defaults', 'Building code inspection failure'],
  complianceRequirements: ['OSHA Safety Standards', 'Local Building Codes', 'EPA Dust & Runoff'],
  aiRestrictions: [
    'NEVER auto-approve structural engineering design changes or building code sign-offs',
    'NEVER override worksite safety shutdown directives issued by OSHA inspectors',
  ],
  sopReferences: {
    MaterialReceiving: 'SOP-CON-003',
    SafetyInspection: 'SOP-CON-010',
  },
};
