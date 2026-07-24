import { IntentDetectorService } from '../brain/reasoning/intent-detector.service';
import { ConflictResolutionService } from '../brain/reasoning/conflict-resolution.service';
import { PlannerService } from '../brain/planning/planner.service';
import { KnowledgeBaseService } from '../brain/knowledge/knowledge-base.service';

describe('10 Operational Scenarios Integration Tests', () => {
  let intentDetector: IntentDetectorService;
  let conflictResolution: ConflictResolutionService;
  let planner: PlannerService;
  let knowledgeBase: KnowledgeBaseService;

  beforeEach(() => {
    intentDetector = new IntentDetectorService();
    conflictResolution = new ConflictResolutionService();
    planner = new PlannerService();
    knowledgeBase = new KnowledgeBaseService();
  });

  it('Scenario 1: Inventory Shortage Handling', () => {
    const plan = planner.generatePlan('Resolve stockout for SKU-8092');
    expect(plan.steps.length).toBeGreaterThan(3);
    expect(plan.steps[0].description).toContain('inventory');
  });

  it('Scenario 2: Supplier Delay Resolution', () => {
    const intent = intentDetector.detectIntent('Supplier Acme Corp shipment is delayed by 14 days');
    expect(intent).toBe('EXCEPTION_TRIAGE');
  });

  it('Scenario 3: Stock Transfer Optimization', () => {
    const plan = planner.generatePlan('Transfer stock between warehouses');
    expect(plan.steps).toBeDefined();
  });

  it('Scenario 4: Purchase Approval Threshold Test', () => {
    const res = conflictResolution.resolveBlanketPoTranche({
      totalPoValue: 55000,
      monthlyBudgetAllowance: 25000,
    });
    expect(res.tranches).toBe(3);
    expect(res.trancheValue).toBe(18333.33);
  });

  it('Scenario 5: Customer Complaint Resolution', () => {
    const intent = intentDetector.detectIntent('Customer logged complaint regarding damaged batch');
    expect(intent).toBe('EXCEPTION_TRIAGE');
  });

  it('Scenario 6: Finance vs Procurement Conflict (Expedite ROI)', () => {
    const HighRoi = conflictResolution.resolveExpediteRoi({
      freightCost: 1000,
      preservedMargin: 5000,
    });
    expect(HighRoi.approveAirFreight).toBe(true);
    expect(HighRoi.roi).toBe(4.0);

    const LowRoi = conflictResolution.resolveExpediteRoi({
      freightCost: 4000,
      preservedMargin: 5000,
    });
    expect(LowRoi.approveAirFreight).toBe(false);
    expect(LowRoi.roi).toBe(0.25);
  });

  it('Scenario 7: Warehouse Bottleneck & Cross-Docking', () => {
    const intent = intentDetector.detectIntent('Warehouse dock is experiencing 48-hour backlog');
    expect(intent).toBe('EXCEPTION_TRIAGE');
  });

  it('Scenario 8: Emergency Facility Incident', () => {
    const intent = intentDetector.detectIntent('Emergency water pipe burst at Warehouse 1');
    expect(intent).toBe('EXCEPTION_TRIAGE');
  });

  it('Scenario 9: Executive Briefing Generation', () => {
    const intent = intentDetector.detectIntent('Provide weekly scorecard briefing for CEO');
    expect(intent).toBe('EXECUTIVE_BRIEFING');
  });

  it('Scenario 10: Industry Pack Selector (Healthcare vs Manufacturing)', () => {
    const mfg = knowledgeBase.getIndustryPack('manufacturing');
    expect(mfg.metadata.id).toBe('manufacturing');

    const health = knowledgeBase.getIndustryPack('healthcare');
    expect(health.metadata.id).toBe('healthcare');
  });
});
