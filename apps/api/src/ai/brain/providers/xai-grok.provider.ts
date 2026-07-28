import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class XAiGrokProvider implements IAiProvider {
  readonly providerName = 'grok';
  private readonly logger = new Logger(XAiGrokProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const apiKey = process.env.XAI_GROK_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
      this.logger.warn('XAI_GROK_API_KEY / GROK_API_KEY not configured. Falling back to local cognitive rules.');
      return {
        content: `⚠️ [System Notice - xAI Grok Provider]\nXAI_GROK_API_KEY is not configured in .env.\n\n[SIERNA Analysis]\nSituation: Grok provider invoked without API key.\nImpact: Switched to local cognitive rules.\nRecommendation: Please set XAI_GROK_API_KEY in apps/api/.env from https://console.x.ai/`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    const modelCandidates = [
      process.env.GROK_MODEL,
      'grok-2-latest',
      'grok-2',
      'grok-2-1212',
    ].filter(Boolean) as string[];

    const messages: Array<{ role: string; content: string }> = [];
    if (payload.systemPrompt && payload.systemPrompt.trim()) {
      messages.push({ role: 'system', content: payload.systemPrompt });
    }
    if (payload.history && payload.history.length > 0) {
      for (const h of payload.history) {
        messages.push({
          role: h.role === 'USER' ? 'user' : 'assistant',
          content: h.content,
        });
      }
    }
    messages.push({ role: 'user', content: payload.userPrompt });

    let lastError: Error | null = null;

    for (const modelName of modelCandidates) {
      try {
        const startTime = Date.now();

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: payload.temperature ?? 0.2,
            max_tokens: payload.maxTokens ?? 1024,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.includes('permission-denied') || errorText.includes('credits')) {
            throw new Error(`xAI Account Credits Required: Please add API credits on https://console.x.ai/`);
          }
          throw new Error(`xAI API HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;
        const content = data.choices[0]?.message?.content || '';
        const usage = data.usage;

        this.logger.log(`xAI Grok API execution completed in ${latencyMs}ms using model ${modelName}`);

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
        lastError = error;
        this.logger.warn(`Grok model ${modelName} failed (${error.message}). Trying next candidate...`);
      }
    }

    this.logger.error(`xAI Grok Provider Execution Error: ${lastError?.message}`);
    return {
      content: `⚠️ [xAI Grok Provider Notice]\n${lastError?.message || 'Execution failed'}\n\n💡 Quick Fix Option:\n1. Top up $5 credits at https://console.x.ai/ OR\n2. Switch AI_PROVIDER="gemini" in .env to use free Gemini API.`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}
