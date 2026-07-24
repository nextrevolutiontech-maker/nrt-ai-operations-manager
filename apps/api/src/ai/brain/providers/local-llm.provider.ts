import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class LocalLlmProvider implements IAiProvider {
  readonly providerName = 'local';
  private readonly logger = new Logger(LocalLlmProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const baseUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.LOCAL_LLM_MODEL || 'llama3',
          messages: [
            { role: 'system', content: payload.systemPrompt },
            ...(payload.history || []).map((h) => ({
              role: h.role === 'USER' ? 'user' : 'assistant',
              content: h.content,
            })),
            { role: 'user', content: payload.userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return {
        content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        raw: data,
      };
    } catch (error: any) {
      this.logger.warn(`Local LLM Provider offline (${error.message}). Returning offline cognitive output.`);
      return {
        content: `⚠️ [Local AI Engine - Offline Mode]\n${payload.userPrompt}`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
