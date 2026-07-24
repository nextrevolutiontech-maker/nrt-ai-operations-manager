import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DemoScenarioInfo {
  id: string;
  title: string;
  category: string;
  description: string;
  targetModule: string;
  evidence: string[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  policiesApplied: string[];
  toolsUsed: string[];
  expectedRoi: string;
  recommendedAction: string;
}

@Injectable()
export class DemoScenariosService {
  private readonly logger = new Logger(DemoScenariosService.name);

  // In-memory active scenario state per company
  private activeScenarios: Map<string, { scenarioId: string; triggeredAt: Date }> = new Map();

  private readonly scenarios: DemoScenarioInfo[] = [
    {
      id: 'stock-out-emergency',
      title: 'Stock Out Emergency in Central Warehouse',
      category: 'Inventory & Procurement',
      description: 'Central Warehouse stock for NRT AI Server Box (SKU: NRT-SRV-001) dropped below threshold (5 units left, reorder level 15). Demand projected to spike by 40% next week.',
      targetModule: 'Inventory',
      evidence: ['Current Stock: 5 units', 'Reorder Threshold: 15 units', 'Daily Consumption: 3 units/day', 'Estimated Lead Time: 4 days'],
      riskScore: 'HIGH',
      confidenceScore: 96,
      policiesApplied: ['POL-INV-001: Automatic Stockout Prevention', 'POL-PUR-004: Preferred Supplier Allocation'],
      toolsUsed: ['InventoryToolsProvider.getWarehouseStock', 'PurchaseToolsProvider.draftPurchaseOrder'],
      expectedRoi: '$14,500 in prevented lost sales',
      recommendedAction: 'Draft Purchase Order for 50 units from Samsung Global Supplier with priority shipping.',
    },
    {
      id: 'supplier-price-surge',
      title: 'Supplier Price Surge & Alternative Sourcing',
      category: 'Procurement Intelligence',
      description: 'Primary Supplier A increased unit price of SSD 1TB modules by 18.5%. Secondary Supplier B offers identical specification at original pricing with 3-day lead time.',
      targetModule: 'Procurement',
      evidence: ['Supplier A Price: $120 -> $141.70 (+18.5%)', 'Supplier B Price: $118.00', 'Historical Order Volume: 500 units/mo'],
      riskScore: 'MEDIUM',
      confidenceScore: 92,
      policiesApplied: ['POL-PROC-009: Dynamic Margin Protection', 'POL-VEN-002: Multi-Sourcing Requirement'],
      toolsUsed: ['SuppliersToolsProvider.getSupplierQuotes', 'FinanceToolsProvider.calculateMarginImpact'],
      expectedRoi: '$11,850 cost savings over 3 months',
      recommendedAction: 'Switch default vendor allocation for SSD 1TB modules to Supplier B for next quarter.',
    },
    {
      id: 'executive-financial-briefing',
      title: 'Monthly Executive Financial & P&L Review',
      category: 'Executive Briefings',
      description: 'Automated executive summary synthesized across Sales, Procurement, and General Ledger for Q3 performance.',
      targetModule: 'Finance',
      evidence: ['Gross Margin: 42.8% (+3.2% MoM)', 'Operating Cashflow: $184,200', 'Top Revenue Category: Electronics ($340,000)'],
      riskScore: 'LOW',
      confidenceScore: 98,
      policiesApplied: ['POL-FIN-001: Monthly Executive Disclosure Standards'],
      toolsUsed: ['FinanceToolsProvider.getLedgerSummary', 'ReportsToolsProvider.generateExecutiveBriefing'],
      expectedRoi: 'Saved 12 hours of manual C-Suite reporting prep',
      recommendedAction: 'Approve allocation of $30,000 surplus operating margin into Q4 Inventory buffer.',
    },
    {
      id: 'sales-spike-anomaly',
      title: 'Unusual Regional Sales Spike Detection',
      category: 'Sales & Warehouse Balancing',
      description: 'North Regional Hub experienced 320% surge in Dell XPS 15 orders within 48 hours. South Warehouse is overstocked by 80 units.',
      targetModule: 'Warehouse',
      evidence: ['North Hub Sales Rate: +320%', 'North Hub Stock: 4 units remaining', 'South Hub Excess Stock: 85 units'],
      riskScore: 'MEDIUM',
      confidenceScore: 94,
      policiesApplied: ['POL-WH-003: Inter-Warehouse Stock Balancing'],
      toolsUsed: ['WarehouseToolsProvider.calculateStockDistribution', 'InventoryToolsProvider.createTransferOrder'],
      expectedRoi: '$4,200 saved in rush supplier freight costs',
      recommendedAction: 'Execute Inter-Warehouse Stock Transfer of 40 units from South Hub to North Hub.',
    },
    {
      id: 'multi-level-po-approval',
      title: 'High-Value Purchase Order Approval Gate',
      category: 'Approvals & Governance',
      description: 'Purchase Order #PO-2026-089 for $85,000 exceeds single-manager authorization limit ($25,000) and requires CFO approval.',
      targetModule: 'Approvals',
      evidence: ['PO Value: $85,000', 'Approval Threshold: $25,000', 'Vendor Reliability Rating: 99.1%'],
      riskScore: 'MEDIUM',
      confidenceScore: 95,
      policiesApplied: ['POL-GOV-002: Dual-Key Executive Sign-Off (> $50k)'],
      toolsUsed: ['ApprovalWorkflowService.stageAction', 'RiskEngineService.assessFinancialRisk'],
      expectedRoi: 'Compliance audit risk mitigated to 0%',
      recommendedAction: 'Request CFO digital signature approval with pre-validated budget availability.',
    },
    {
      id: 'delayed-shipment-impact',
      title: 'Supplier Delay & Customer SLA Mitigation',
      category: 'Operations & Fulfillment',
      description: 'Shipment #SHP-4091 from Supplier Logistics is delayed by 5 days due to port congestion, risking 12 customer sales orders.',
      targetModule: 'Sales',
      evidence: ['Delay Duration: 5 business days', 'Affected Sales Orders: 12', 'At-risk Revenue: $48,000'],
      riskScore: 'HIGH',
      confidenceScore: 91,
      policiesApplied: ['POL-SLA-001: Customer Delay Notification & Express Partial Dispatch'],
      toolsUsed: ['SalesToolsProvider.getPendingOrders', 'CustomerToolsProvider.notifyAffectedCustomers'],
      expectedRoi: 'Prevented customer churn on 12 VIP accounts',
      recommendedAction: 'Dispatch available partial stock immediately and issue automated delay advisory with 5% goodwill credit.',
    },
    {
      id: 'dead-stock-liquidation',
      title: 'Dead Stock Liquidation & Cash Recovery',
      category: 'Inventory Optimization',
      description: '140 units of legacy Accessories (SKU: APP-KBD-01) have 0 stock movement over 90 days, locking up $12,600 in working capital.',
      targetModule: 'Inventory',
      evidence: ['Days Sales of Inventory (DSI): 112 days', 'Holding Cost: $420/mo', 'Capital Locked: $12,600'],
      riskScore: 'LOW',
      confidenceScore: 93,
      policiesApplied: ['POL-INV-007: Stagnant Stock Capital Recovery'],
      toolsUsed: ['InventoryToolsProvider.getAgedInventory', 'SalesToolsProvider.createPromotionalBundle'],
      expectedRoi: '$9,800 cash recovered within 14 days',
      recommendedAction: 'Launch 25% bundled discount promotion paired with high-velocity Server Box sales.',
    },
    {
      id: 'journal-entry-audit',
      title: 'Automated Ledger Anomaly & Audit Detection',
      category: 'Finance Audit',
      description: 'Journal Entry #JE-9042 contains a duplicate $5,400 debit entry under Miscellaneous Expense without linked Purchase Receipt.',
      targetModule: 'Finance',
      evidence: ['Entry Amount: $5,400.00', 'Duplicate Matching Score: 99.8%', 'Linked Receipt: Missing'],
      riskScore: 'HIGH',
      confidenceScore: 97,
      policiesApplied: ['POL-AUD-001: Duplicate Transaction Safeguard'],
      toolsUsed: ['FinanceToolsProvider.auditJournalEntries', 'ObservabilityService.flagAnomaly'],
      expectedRoi: '$5,400 immediate leakage prevented',
      recommendedAction: 'Hold payment transaction JE-9042 and route to Audit Lead for verification.',
    },
    {
      id: 'conversational-deep-dive',
      title: 'Conversational Deep-Dive & Natural Language Querying',
      category: 'Conversational AI',
      description: 'Interactive natural language inquiry into company-wide operational efficiency, cash flow runway, and inventory valuation.',
      targetModule: 'AI Chat',
      evidence: ['Query Context: Multi-module synthesis', 'Data Sources: Inventory, Ledger, POs', 'Response Time: < 800ms'],
      riskScore: 'LOW',
      confidenceScore: 99,
      policiesApplied: ['POL-AI-001: Context-Aware Query Synthesis'],
      toolsUsed: ['AiContextEngineService.buildContext', 'SystemPromptEngineService.renderPersonaPrompt'],
      expectedRoi: 'Instant C-Suite insights without SQL or report builder',
      recommendedAction: 'Ask AI Chat: "Compare our margin across Electronics vs Accessories for Q2 & Q3".',
    },
    {
      id: 'custom-workflow-creation',
      title: 'Prompt-Driven Automated Workflow Creation',
      category: 'Workflow Automation',
      description: 'Created active background workflow rule: "When Warehouse Stock drops below 10%, auto-create PO draft and notify Ops Lead on Slack/In-App".',
      targetModule: 'Workflows',
      evidence: ['Trigger Condition: Stock < 10%', 'Actions: Draft PO + Notify Ops', 'Status: Active Execution'],
      riskScore: 'LOW',
      confidenceScore: 96,
      policiesApplied: ['POL-WF-002: Autonomous Workflow Guardrails'],
      toolsUsed: ['WorkflowEngineService.createDynamicWorkflow', 'NotificationEngineService.dispatch'],
      expectedRoi: 'Eliminates 100% of manual reorder checking tasks',
      recommendedAction: 'Deploy autonomous monitoring rule for all high-velocity SKUs.',
    },
  ];

  getAllScenarios(): DemoScenarioInfo[] {
    return this.scenarios;
  }

  getScenarioById(id: string): DemoScenarioInfo | undefined {
    return this.scenarios.find((s) => s.id === id);
  }

  getActiveScenario(companyId: string) {
    const active = this.activeScenarios.get(companyId);
    const scenario = active ? this.getScenarioById(active.scenarioId) : this.scenarios[0];
    return {
      demoMode: true,
      activeScenario: scenario,
      dataSource: 'Demo Dataset',
      triggeredAt: active?.triggeredAt || new Date(),
    };
  }

  async triggerScenario(companyId: string, scenarioId: string) {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    this.activeScenarios.set(companyId, {
      scenarioId,
      triggeredAt: new Date(),
    });

    this.logger.log(`Demo Scenario [${scenario.id}] triggered for company ${companyId}`);

    return {
      success: true,
      message: `Demo Scenario "${scenario.title}" triggered successfully!`,
      scenario,
      demoMode: true,
      dataSource: 'Demo Dataset',
    };
  }

  async resetDemoEnvironment(companyId: string) {
    this.activeScenarios.delete(companyId);
    this.logger.log(`Demo Environment reset for company ${companyId}`);

    return {
      success: true,
      message: 'Demo environment reset successfully! All AI sessions, tasks, alerts, and recommendations cleared.',
      demoMode: true,
      activeScenario: this.scenarios[0],
      dataSource: 'Demo Dataset',
    };
  }
}
