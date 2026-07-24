import { IndustryPack } from './industry-pack.interface';

export const saasItPack: IndustryPack = {
  metadata: {
    id: 'saas-it',
    name: 'SaaS & IT Services Pack',
    version: '1.0.0',
    lastUpdated: '2026-07-23',
    priority: 1,
    tags: ['MRR', 'ARR', 'NRR', 'UptimeSLA', 'SOC2', 'ISO27001'],
  },
  workflowSummary:
    'Lead Signup -> Provisioning & Onboarding -> Cloud Resource Allocation -> SLA Monitoring -> Support Triage -> Subscription Renewal.',
  criticalKpis: {
    SystemUptimeSLA: '> 99.99%',
    NetRevenueRetention: '> 110.0%',
    CustomerChurnRate: '< 1.0%/month',
  },
  operationalRisks: ['Cloud infrastructure outages', 'Data security breaches', 'Runaway cloud hosting OPEX'],
  complianceRequirements: ['SOC 2 Type II', 'ISO 27001', 'GDPR / CCPA'],
  aiRestrictions: [
    'NEVER execute automated production database deletion, drop table, or schema destruction',
    'NEVER auto-apply unverified security patches to live production without peer code review',
  ],
  sopReferences: {
    IncidentTriage: 'SOP-ITS-022',
    CloudScaling: 'SOP-ITS-035',
  },
};
