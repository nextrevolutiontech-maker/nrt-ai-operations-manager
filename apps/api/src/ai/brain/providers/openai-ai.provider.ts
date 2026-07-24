import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        content: `⚠️ [System Notice - OpenAI Provider]\nOPENAI_API_KEY not configured. Falling back to local cognitive rules.\n\n[SIERNA Analysis]\nSituation: OpenAI provider invoked without API key.\nImpact: No external API call made.\nRecommendation: Configure OPENAI_API_KEY in environment variables.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages: [
            { role: 'system', content: payload.systemPrompt },
            ...(payload.history || []).map((h) => ({
              role: h.role === 'USER' ? 'user' : 'assistant',
              content: h.content,
            })),
            { role: 'user', content: payload.userPrompt },
          ],
          temperature: payload.temperature ?? 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const usage = data.usage;

      return {
        content,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(`OpenAI Provider Error: ${error.message}`);
      return {
        content: `⚠️ [System Notice - OpenAI Provider Error]\n${error.message}`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
