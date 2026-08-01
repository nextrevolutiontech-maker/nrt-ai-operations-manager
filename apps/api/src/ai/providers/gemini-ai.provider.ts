import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiPromptPayload,
  AiProviderResponse,
  IAiProvider,
} from './ai-provider.interface';

@Injectable()
export class GeminiAiProvider implements IAiProvider {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: payload.systemPrompt,
      });

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (payload.history && payload.history.length > 0) {
        for (const msg of payload.history) {
          contents.push({
            role: msg.role === 'USER' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: payload.userPrompt }],
      });

      const result = await model.generateContent({ contents });
      const text = result.response.text();
      const usageMeta = result.response.usageMetadata;

      const promptTokens = usageMeta?.promptTokenCount ?? 100;
      const completionTokens = usageMeta?.candidatesTokenCount ?? 150;
      const totalTokens = usageMeta?.totalTokenCount ?? (promptTokens + completionTokens);

      return {
        content: text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
      };
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}`);
      return {
        content: `Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. System active hai. (Notice: ${error.message})`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }
}
