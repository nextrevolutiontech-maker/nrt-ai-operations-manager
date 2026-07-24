import { Injectable } from '@nestjs/common';

export type UserIntent =
  | 'ACTION_EXECUTION'
  | 'DATA_QUERY'
  | 'APPROVAL_REQUEST'
  | 'EXCEPTION_TRIAGE'
  | 'EXECUTIVE_BRIEFING';

@Injectable()
export class IntentDetectorService {
  detectIntent(prompt: string): UserIntent {
    const p = prompt.toLowerCase();

    if (
      p.includes('add') ||
      p.includes('create') ||
      p.includes('order') ||
      p.includes('reorder') ||
      p.includes('transfer') ||
      p.includes('expedite')
    ) {
      return 'ACTION_EXECUTION';
    }

    if (
      p.includes('approve') ||
      p.includes('approval') ||
      p.includes('reject') ||
      p.includes('sign off')
    ) {
      return 'APPROVAL_REQUEST';
    }

    if (
      p.includes('delay') ||
      p.includes('stockout') ||
      p.includes('discrepancy') ||
      p.includes('complaint') ||
      p.includes('broken') ||
      p.includes('emergency') ||
      p.includes('backlog') ||
      p.includes('congestion')
    ) {
      return 'EXCEPTION_TRIAGE';
    }

    if (
      p.includes('report') ||
      p.includes('summary') ||
      p.includes('kpi') ||
      p.includes('briefing') ||
      p.includes('scorecard')
    ) {
      return 'EXECUTIVE_BRIEFING';
    }

    return 'DATA_QUERY';
  }
}
