export interface AiToolDef {
  name: string;
  description: string;
  inputSchema: any;
}

export interface AiPromptPayload {
  systemPrompt: string;
  userPrompt: string;
  history?: { role: 'USER' | 'AI'; content: string }[];
  tools?: AiToolDef[];
  temperature?: number;
  maxTokens?: number;
}

export interface AiProviderResponse {
  content: string;
  toolCalls?: { name: string; arguments: any }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  raw?: any;
}

export interface IAiProvider {
  readonly providerName: string;
  generateResponse(payload: AiPromptPayload): Promise<AiProviderResponse>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
