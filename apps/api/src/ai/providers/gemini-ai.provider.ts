import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  AiPromptPayload,
  AiProviderResponse,
  IAiProvider,
} from './ai-provider.interface';

@Injectable()
export class GeminiAiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set. AI responses will be limited.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    this.logger.log(`Sending prompt to Gemini: ${payload.userPrompt.slice(0, 80)}...`);

    const geminiTools = payload.tools && payload.tools.length > 0 ? [{
      functionDeclarations: payload.tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.inputSchema as any,
      }))
    }] : undefined;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction: payload.systemPrompt,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        tools: geminiTools,
      });

      // Build chat history
      const history = (payload.history || []).map((h) => ({
        role: h.role === 'USER' ? 'user' as const : 'model' as const,
        parts: [{ text: h.content }],
      }));

      const chat = model.startChat({ history });

      let result;
      let retries = 3;
      while (retries > 0) {
        try {
          result = await chat.sendMessage(payload.userPrompt);
          break;
        } catch (e: any) {
          if ((e.message?.includes('503') || e.message?.includes('500') || e.message?.includes('high demand')) && retries > 1) {
            retries--;
            this.logger.warn(`Gemini busy error, retrying... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, 2000));
          } else {
            throw e;
          }
        }
      }
      
      const response = result!.response;
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        return {
          content: response.text?.() || 'Tool calls generated.',
          toolCalls: functionCalls.map(fc => ({
            name: fc.name,
            arguments: fc.args,
          })),
          usage: {
            promptTokens: response.usageMetadata?.promptTokenCount || 0,
            completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0,
          },
        };
      }

      const text = response.text();

      return {
        content: text,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}. Attempting Fallback to OpenAI...`);
      
      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        let userMessage = `I encountered an error processing your request. Please try again. (Error: ${error.message?.slice(0, 100)})`;
        if (error.message?.includes('503 Service Unavailable') || error.message?.includes('high demand')) {
          userMessage = "Mera primary AI server (Google Gemini) abhi bohat busy hai, aur fallback server configure nahi hai. Baraye meharbani chand seconds baad dobara koshish karein.";
        }
        return {
          content: userMessage,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }

      try {
        const messages = [
          { role: 'system', content: payload.systemPrompt },
          ...(payload.history || []).map(h => ({ role: h.role === 'USER' ? 'user' : 'assistant', content: h.content })),
          { role: 'user', content: payload.userPrompt }
        ];

        const openaiTools = payload.tools && payload.tools.length > 0 ? payload.tools.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        })) : undefined;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            tools: openaiTools,
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI Fallback failed with status ${response.status}`);
        }

        const data = await response.json();
        const msg = data.choices[0].message;

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          return {
            content: msg.content || 'Tool calls generated.',
            toolCalls: msg.tool_calls.map((tc: any) => ({
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments)
            })),
            usage: {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          };
        }

        return {
          content: msg.content,
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        };
      } catch (fallbackError: any) {
        this.logger.error(`OpenAI Fallback error: ${fallbackError.message}`);
        return {
          content: "Maazrat, mere dono AI servers (Gemini aur Fallback) is waqt busy hain. Baraye meharbani thodi der baad dobara koshish karein.",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }
    }
  }
}
