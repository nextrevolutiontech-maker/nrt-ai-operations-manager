import { EventStoreService } from '../events/event-store.service';
import { EventBusService } from '../events/event-bus.service';
import { EventReplayService } from '../events/event-replay.service';
import { InventoryMonitorService } from '../monitors/inventory-monitor.service';
import { BusinessEventType } from '../events/event-types';

describe('Event Engine & Monitoring Tests', () => {
  let eventStore: EventStoreService;
  let eventBus: EventBusService;
  let eventReplay: EventReplayService;
  let invMonitor: InventoryMonitorService;

  beforeEach(() => {
    eventStore = new EventStoreService();
    eventBus = new EventBusService(eventStore);
    eventReplay = new EventReplayService(eventStore);
    invMonitor = new InventoryMonitorService(eventBus);
  });

  it('should persist and dispatch business events via EventBus', async () => {
    let capturedEvent: any;
    eventBus.subscribe(BusinessEventType.INVENTORY_LOW_STOCK, async (evt) => {
      capturedEvent = evt;
    });

    await invMonitor.scanInventory('COMP-01');

    expect(capturedEvent).toBeDefined();
    expect(capturedEvent.payload.sku).toBe('SKU-8092');

    const history = eventStore.getEventHistory();
    expect(history.length).toBe(1);
    expect(history[0].status).toBe('COMPLETED');
  });

  it('should replay queued events cleanly', () => {
    eventStore.saveEvent({
      eventId: 'EVT-QUEUED-01',
      eventType: BusinessEventType.INVENTORY_STOCKOUT,
      severity: 'HIGH',
      domain: 'inventory',
      sourceModule: 'Test',
      companyId: 'COMP-01',
      payload: {},
      timestamp: new Date().toISOString(),
    });

    let replayed = false;
    const replayedCount = eventReplay.replayQueuedEvents(async () => {
      replayed = true;
    });

    expect(replayedCount).toBe(1);
    expect(replayed).toBe(true);
  });
});
