import { RecommendationEngineService } from '../recommendations/recommendation-engine.service';
import { RecommendationHistoryService } from '../recommendations/recommendation-history.service';
import { RecommendationFeedbackService } from '../recommendations/recommendation-feedback.service';
import { AlertEngineService } from '../alerts/alert-engine.service';
import { AlertDeduplicatorService } from '../alerts/alert-deduplicator.service';
import { AlertPriorityService } from '../alerts/alert-priority.service';
import { AlertHistoryService } from '../alerts/alert-history.service';
import { BusinessEventType } from '../events/event-types';

describe('Recommendations & Alerts Tests', () => {
  let recEngine: RecommendationEngineService;
  let recHistory: RecommendationHistoryService;
  let recFeedback: RecommendationFeedbackService;
  let alertEngine: AlertEngineService;

  beforeEach(() => {
    recHistory = new RecommendationHistoryService();
    recEngine = new RecommendationEngineService(recHistory);
    recFeedback = new RecommendationFeedbackService();

    const dedup = new AlertDeduplicatorService();
    const priority = new AlertPriorityService();
    const alertHistory = new AlertHistoryService();
    alertEngine = new AlertEngineService(dedup, priority, alertHistory);
  });

  it('should generate SIERNA recommendation from business event', () => {
    const rec = recEngine.generateRecommendation({
      eventId: 'EVT-01',
      eventType: BusinessEventType.PURCHASE_PO_DELAY,
      severity: 'HIGH',
      domain: 'purchase',
      sourceModule: 'PurchaseMonitor',
      companyId: 'COMP-01',
      payload: { poNumber: 'PO-8810', delayDays: 14 },
      timestamp: new Date().toISOString(),
    });

    expect(rec.id).toBeDefined();
    expect(rec.approvalRequired).toBe(true);
    expect(rec.confidenceScore).toBe(0.92);
  });

  it('should track recommendation feedback loop outcomes', () => {
    recFeedback.recordFeedback({
      recommendationId: 'REC-01',
      outcome: 'ACCEPTED',
      userNotes: 'Approved PO split recommendation',
      actualRoiRealized: 4.2,
      timestamp: new Date(),
    });

    const logs = recFeedback.getFeedbackHistory();
    expect(logs.length).toBe(1);
    expect(logs[0].outcome).toBe('ACCEPTED');
  });

  it('should deduplicate identical alerts within sliding time window', () => {
    const evt = {
      eventId: 'EVT-DUP-01',
      eventType: BusinessEventType.INVENTORY_LOW_STOCK,
      severity: 'HIGH' as const,
      domain: 'inventory',
      sourceModule: 'InventoryMonitor',
      companyId: 'COMP-01',
      payload: { sku: 'SKU-8092' },
      timestamp: new Date().toISOString(),
    };

    const alert1 = alertEngine.processEvent(evt);
    const alert2 = alertEngine.processEvent(evt);

    expect(alert1).not.toBeNull();
    expect(alert2).toBeNull(); // Deduplicated
  });
});
