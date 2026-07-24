import { Injectable, Logger } from '@nestjs/common';
import { IndustryPack } from './industry-packs/industry-pack.interface';
import { manufacturingPack } from './industry-packs/manufacturing.pack';
import { retailPack } from './industry-packs/retail.pack';
import { healthcarePack } from './industry-packs/healthcare.pack';
import { logisticsPack } from './industry-packs/logistics.pack';
import { constructionPack } from './industry-packs/construction.pack';
import { foodBeveragePack } from './industry-packs/food-beverage.pack';
import { ecommercePack } from './industry-packs/e-commerce.pack';
import { saasItPack } from './industry-packs/saas-it.pack';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly industryPacks: Map<string, IndustryPack> = new Map();

  constructor() {
    this.registerPack(manufacturingPack);
    this.registerPack(retailPack);
    this.registerPack(healthcarePack);
    this.registerPack(logisticsPack);
    this.registerPack(constructionPack);
    this.registerPack(foodBeveragePack);
    this.registerPack(ecommercePack);
    this.registerPack(saasItPack);
  }

  private registerPack(pack: IndustryPack) {
    this.industryPacks.set(pack.metadata.id.toLowerCase(), pack);
  }

  getIndustryPack(industryId?: string): IndustryPack {
    const key = (industryId || 'retail').toLowerCase();
    const pack = this.industryPacks.get(key) || this.industryPacks.get('retail');
    return pack!;
  }

  getKnowledgePromptInjection(industryId?: string): string {
    const pack = this.getIndustryPack(industryId);
    return `
[ACTIVE INDUSTRY KNOWLEDGE PACK: ${pack.metadata.name} (v${pack.metadata.version})]
- Workflow: ${pack.workflowSummary}
- Target KPIs: ${JSON.stringify(pack.criticalKpis)}
- Operational Risks: ${pack.operationalRisks.join('; ')}
- Compliance Rules: ${pack.complianceRequirements.join('; ')}
- STRICT AI RESTRICTIONS:
  ${pack.aiRestrictions.map((r) => `* ${r}`).join('\n  ')}
`;
  }
}
