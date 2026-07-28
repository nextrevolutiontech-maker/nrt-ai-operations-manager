import { Injectable, Logger } from '@nestjs/common';
import {
  IAiProvider,
  AiPromptPayload,
  AiProviderResponse,
} from './ai-provider.interface';

@Injectable()
export class OpenRouterAiProvider implements IAiProvider {
  readonly providerName = 'openrouter';
  private readonly logger = new Logger(OpenRouterAiProvider.name);

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not configured in .env');
      return {
        content: 'Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. OPENROUTER_API_KEY configuration missing in .env.',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    const modelCandidates = [
      process.env.OPENROUTER_MODEL,
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.3-70b-instruct',
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

    // Format tools for OpenAI / OpenRouter format if provided
    let toolsFormatted: any[] | undefined = undefined;
    if (payload.tools && payload.tools.length > 0) {
      toolsFormatted = payload.tools.map((t: any) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters || { type: 'object', properties: {} },
        },
      }));
    }

    let lastError: Error | null = null;

    for (const modelName of modelCandidates) {
      try {
        const startTime = Date.now();
        const requestBody: any = {
          model: modelName,
          messages,
          temperature: payload.temperature ?? 0.2,
          max_tokens: payload.maxTokens ?? 1024,
        };

        if (toolsFormatted && toolsFormatted.length > 0) {
          requestBody.tools = toolsFormatted;
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://nrt-ai-operations-manager.local',
            'X-Title': 'NRT AI Operations Manager',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;
        const messageObj = data.choices?.[0]?.message;
        const content = messageObj?.content || '';
        const rawToolCalls = messageObj?.tool_calls;
        const usage = data.usage;

        let parsedToolCalls: Array<{ name: string; arguments: any }> | undefined = undefined;
        if (rawToolCalls && rawToolCalls.length > 0) {
          parsedToolCalls = rawToolCalls.map((tc: any) => {
            let args: any = {};
            try {
              args = typeof tc.function.arguments === 'string'
                ? JSON.parse(tc.function.arguments)
                : tc.function.arguments;
            } catch (e) {
              args = {};
            }
            return {
              name: tc.function.name,
              arguments: args,
            };
          });
        }

        this.logger.log(`OpenRouter API completed in ${latencyMs}ms using model ${modelName} | ToolCalls: ${parsedToolCalls?.length || 0}`);

        return {
          content,
          toolCalls: parsedToolCalls,
          usage: {
            promptTokens: usage?.prompt_tokens || 0,
            completionTokens: usage?.completion_tokens || 0,
            totalTokens: usage?.total_tokens || 0,
          },
          raw: data,
        };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`OpenRouter model ${modelName} failed (${error.message}). Trying next candidate...`);
      }
    }

    this.logger.error(`OpenRouter Provider Execution Error: ${lastError?.message}`);
    return {
      content: `Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. (OpenRouter Note: ${lastError?.message || 'Execution error'})`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}
