import { RiskEngineService } from '../brain/reasoning/risk-engine.service';
import { ConfidenceEngineService } from '../brain/reasoning/confidence-engine.service';
import { PriorityEngineService } from '../brain/reasoning/priority-engine.service';
import { PolicyEngineService } from '../brain/governance/policy-engine.service';
import { AutonomousMatrixService } from '../brain/governance/autonomous-matrix.service';

describe('Decision Engine Unit Tests', () => {
  let riskEngine: RiskEngineService;
  let confidenceEngine: ConfidenceEngineService;
  let priorityEngine: PriorityEngineService;
  let policyEngine: PolicyEngineService;
  let autonomousMatrix: AutonomousMatrixService;

  beforeEach(() => {
    riskEngine = new RiskEngineService();
    confidenceEngine = new ConfidenceEngineService();
    priorityEngine = new PriorityEngineService();
    policyEngine = new PolicyEngineService();
    autonomousMatrix = new AutonomousMatrixService();
  });

  it('should classify risk correctly based on financial thresholds', () => {
    expect(riskEngine.assessRisk({ financialAmount: 500 }).level).toBe('LOW');
    expect(riskEngine.assessRisk({ financialAmount: 2500 }).level).toBe('MEDIUM');
    expect(riskEngine.assessRisk({ financialAmount: 15000 }).level).toBe('HIGH');
    expect(riskEngine.assessRisk({ financialAmount: 75000 }).level).toBe('CRITICAL');
    expect(riskEngine.assessRisk({ isSafetyIncident: true }).level).toBe('CRITICAL');
  });

  it('should evaluate confidence levels and actionability', () => {
    const high = confidenceEngine.evaluateConfidence({
      dataCompleteness: 0.95,
      policyClarity: 0.95,
      precedentConfidence: 0.9,
    });
    expect(high.tier).toBe('HIGH');
    expect(high.actionable).toBe(true);

    const low = confidenceEngine.evaluateConfidence({
      dataCompleteness: 0.4,
      policyClarity: 0.5,
      precedentConfidence: 0.5,
    });
    expect(low.tier).toBe('LOW');
    expect(low.actionable).toBe(false);
  });

  it('should enforce priority hierarchy (Safety > Legal > Customer > Revenue)', () => {
    expect(priorityEngine.isHigherPriority('P1_SAFETY', 'P4_REVENUE')).toBe(true);
    expect(priorityEngine.isHigherPriority('P2_LEGAL', 'P6_COST')).toBe(true);
    expect(priorityEngine.isHigherPriority('P7_SPEED', 'P3_CUSTOMER')).toBe(false);
  });

  it('should enforce policy limits and human approval rules', () => {
    const lowCheck = policyEngine.checkPolicy({ actionName: 'reorder', amount: 500 });
    expect(lowCheck.requiresHumanApproval).toBe(false);

    const highCheck = policyEngine.checkPolicy({ actionName: 'purchase', amount: 15000 });
    expect(highCheck.requiresHumanApproval).toBe(true);
    expect(highCheck.approvalRole).toBe('OPERATIONS_DIRECTOR');

    const blockedCheck = policyEngine.checkPolicy({
      actionName: 'machine_parameter_change',
      isBlockedAction: true,
    });
    expect(blockedCheck.allowed).toBe(false);
  });

  it('should classify action tiers in Autonomous Action Matrix', () => {
    expect(autonomousMatrix.classifyAction('machine_parameter_override')).toBe('NEVER_PERFORM');
    expect(autonomousMatrix.classifyAction('reorder', 500)).toBe('EXECUTE_AUTOMATICALLY');
    expect(autonomousMatrix.classifyAction('transfer_stock', 2000)).toBe('CREATE_DRAFT');
    expect(autonomousMatrix.classifyAction('purchase_order', 15000)).toBe('REQUIRE_HUMAN_APPROVAL');
  });
});
