import { IndustryPack } from './industry-pack.interface';

export const logisticsPack: IndustryPack = {
  metadata: {
    id: 'logistics',
    name: 'Logistics & Supply Chain Operations Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['OTIF', 'FleetUtil', 'DOT', 'HOS', 'CrossDock'],
  },
  workflowSummary:
    'Booking Capture -> Load & Route Optimization -> Carrier Assignment -> GPS Telematics Tracking -> Cross-Docking -> POD Capture.',
  criticalKpis: {
    OTIFDelivery: '> 96.0%',
    FleetUtilization: '> 88.0%',
    HOSCompliance: '100.0%',
  },
  operationalRisks: [
    'Port congestion transit delays',
    'Driver Hours of Service violations',
    'Cargo damage or theft during transit',
  ],
  complianceRequirements: ['DOT / FMCSA Regulations', 'IATA / IMDG HazMat', 'Customs C-TPAT'],
  aiRestrictions: [
    'NEVER override legal Driver Hours of Service (HOS) rest period limits',
    'NEVER approve hazardous material transport without verified HazMat docs',
  ],
  sopReferences: {
    CarrierSelection: 'SOP-LOG-014',
    HazMatTransport: 'SOP-LOG-029',
  },
};
