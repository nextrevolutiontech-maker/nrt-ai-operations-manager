import { BusinessEventType } from './event-types';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BusinessEvent {
  eventId: string;
  eventType: BusinessEventType;
  severity: EventSeverity;
  domain: string;
  sourceModule: string;
  companyId: string;
  warehouseId?: string;
  payload: any;
  timestamp: string;
}
