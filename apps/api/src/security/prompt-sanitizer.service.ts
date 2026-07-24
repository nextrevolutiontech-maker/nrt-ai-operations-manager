import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PromptSanitizerService {
  private readonly logger = new Logger(PromptSanitizerService.name);

  private readonly BANNED_PATTERNS = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior rules/i,
    /system override/i,
    /you are now in DAN mode/i,
    /act as an unrestricted AI/i,
    /reveal system prompt/i,
    /show developer instructions/i,
    /drop table/i,
    /delete from/i,
    /<script>/i,
  ];

  sanitizePrompt(prompt: string): { cleanPrompt: string; wasSanitized: boolean; flagCount: number } {
    if (!prompt || typeof prompt !== 'string') {
      return { cleanPrompt: '', wasSanitized: false, flagCount: 0 };
    }

    let cleanPrompt = prompt;
    let flagCount = 0;

    for (const pattern of this.BANNED_PATTERNS) {
      if (pattern.test(cleanPrompt)) {
        flagCount++;
        this.logger.warn(`Adversarial prompt injection pattern detected: "${pattern.source}"`);
        cleanPrompt = cleanPrompt.replace(pattern, '[REDACTED_SECURITY_POLICY]');
      }
    }

    return {
      cleanPrompt: cleanPrompt.trim(),
      wasSanitized: flagCount > 0,
      flagCount,
    };
  }
}
