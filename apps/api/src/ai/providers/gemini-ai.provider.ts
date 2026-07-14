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

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: payload.systemPrompt,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });

      // Build chat history
      const history = (payload.history || []).map((h) => ({
        role: h.role === 'USER' ? 'user' as const : 'model' as const,
        parts: [{ text: h.content }],
      }));

      const chat = model.startChat({ history });

      const result = await chat.sendMessage(payload.userPrompt);
      const response = result.response;
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
      this.logger.error(`Gemini API error: ${error.message}`);
      return {
        content: `I encountered an error processing your request. Please try again. (Error: ${error.message?.slice(0, 100)})`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
