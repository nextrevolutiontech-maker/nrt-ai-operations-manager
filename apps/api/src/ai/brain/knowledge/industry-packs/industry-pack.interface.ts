export interface IndustryPackMetadata {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  priority: number;
  tags: string[];
}

export interface IndustryPack {
  metadata: IndustryPackMetadata;
  workflowSummary: string;
  criticalKpis: Record<string, string>;
  operationalRisks: string[];
  complianceRequirements: string[];
  aiRestrictions: string[];
  sopReferences: Record<string, string>;
}
