import { Injectable, Logger } from '@nestjs/common';
import {
  AiPromptPayload,
  AiProviderResponse,
  IAiProvider,
} from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements IAiProvider {
  private readonly logger = new Logger(MockAiProvider.name);

  async generateResponse(
    payload: AiPromptPayload,
  ): Promise<AiProviderResponse> {
    this.logger.log(`Generating mock AI response for: ${payload.userPrompt}`);
    await Promise.resolve();

    // Very simple mock logic mapping inputs to tool calls
    const lowerPrompt = payload.userPrompt.toLowerCase();

    if (
      lowerPrompt.includes('search product') ||
      lowerPrompt.includes('find product')
    ) {
      return {
        content: '',
        toolCalls: [
          {
            name: 'ProductSearchTool',
            arguments: { query: payload.userPrompt },
          },
        ],
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      };
    }

    if (lowerPrompt.includes('low stock')) {
      return {
        content: '',
        toolCalls: [{ name: 'LowStockTool', arguments: {} }],
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      };
    }

    if (
      lowerPrompt.includes('draft') &&
      lowerPrompt.includes('purchase order')
    ) {
      return {
        content: '',
        toolCalls: [
          {
            name: 'DraftPurchaseOrderTool',
            arguments: { supplierId: 'mock-supplier-id', items: [] },
          },
        ],
        usage: { promptTokens: 15, completionTokens: 15, totalTokens: 30 },
      };
    }

    return {
      content: `This is a mock response to: "${payload.userPrompt}". I am your NRT AI Operations Manager assistant.`,
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }
}
