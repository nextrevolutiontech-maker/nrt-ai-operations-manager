import { Injectable } from '@nestjs/common';

export interface SiernaPayload {
  situation: string;
  impact: string;
  evidence: string;
  options?: { title: string; tradeoff: string }[];
  recommendation: string;
  nextActions: string[];
  ask?: string;
}

@Injectable()
export class SiernaFormatterService {
  format(payload: SiernaPayload): string {
    let markdown = `### 📊 Operational Briefing\n\n`;
    markdown += `**Situation**: ${payload.situation}\n\n`;
    markdown += `**Business Impact**: ${payload.impact}\n\n`;
    markdown += `**Empirical Evidence**: ${payload.evidence}\n\n`;

    if (payload.options && payload.options.length > 0) {
      markdown += `**Decision Options**:\n`;
      payload.options.forEach((opt, idx) => {
        markdown += `${idx + 1}. *${opt.title}*: ${opt.tradeoff}\n`;
      });
      markdown += `\n`;
    }

    markdown += `**Recommended Action**: ${payload.recommendation}\n\n`;

    if (payload.nextActions && payload.nextActions.length > 0) {
      markdown += `**Immediate Next Actions**:\n`;
      payload.nextActions.forEach((act) => {
        markdown += `- [ ] ${act}\n`;
      });
      markdown += `\n`;
    }

    if (payload.ask) {
      markdown += `> ❓ **Executive Clarification Needed**: ${payload.ask}\n`;
    }

    return markdown;
  }
}
