import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class GroqAiProvider implements IAiProvider {
  readonly providerName = 'groq';
  private readonly logger = new Logger(GroqAiProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not configured. Falling back to local cognitive rules.');
      return {
        content: `⚠️ [System Notice - Groq Provider]\nGROQ_API_KEY not configured. Falling back to local cognitive rules.\n\n[SIERNA Analysis]\nSituation: Groq provider invoked without API key.\nImpact: No external API call made.\nRecommendation: Set GROQ_API_KEY in environment variables.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    try {
      const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const startTime = Date.now();

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: payload.systemPrompt },
            ...(payload.history || []).map((h) => ({
              role: h.role === 'USER' ? 'user' : 'assistant',
              content: h.content,
            })),
            { role: 'user', content: payload.userPrompt },
          ],
          temperature: payload.temperature ?? 0.2,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API HTTP Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      const content = data.choices[0]?.message?.content || '';
      const usage = data.usage;

      this.logger.log(`Groq API execution completed in ${latencyMs}ms using ${modelName}`);

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
      this.logger.error(`Groq Provider Execution Error: ${error.message}`);
      return {
        content: `⚠️ [System Notice - Groq Provider Error]\n${error.message}\n\nFallback: Check GROQ_API_KEY in .env file.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
