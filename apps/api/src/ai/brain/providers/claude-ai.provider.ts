import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class ClaudeAiProvider implements IAiProvider {
  readonly providerName = 'claude';
  private readonly logger = new Logger(ClaudeAiProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        content: `⚠️ [System Notice - Claude Provider]\nANTHROPIC_API_KEY not configured. Falling back to local cognitive rules.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
          system: payload.systemPrompt,
          messages: [
            ...(payload.history || []).map((h) => ({
              role: h.role === 'USER' ? 'user' : 'assistant',
              content: h.content,
            })),
            { role: 'user', content: payload.userPrompt },
          ],
          max_tokens: payload.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';

      return {
        content,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(`Claude Provider Error: ${error.message}`);
      return {
        content: `⚠️ [System Notice - Claude Provider Error]\n${error.message}`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
