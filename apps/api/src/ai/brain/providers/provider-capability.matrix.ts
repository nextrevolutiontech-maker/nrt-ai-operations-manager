export interface ProviderCapabilities {
  toolCalling: boolean;
  structuredOutput: boolean;
  vision: boolean;
  thinking: boolean;
  streaming: boolean;
  maxContextTokens: number;
}

export const PROVIDER_CAPABILITY_MATRIX: Record<string, ProviderCapabilities> = {
  gemini: {
    toolCalling: true,
    structuredOutput: true,
    vision: true,
    thinking: false,
    streaming: true,
    maxContextTokens: 1000000,
  },
  openai: {
    toolCalling: true,
    structuredOutput: true,
    vision: true,
    thinking: false,
    streaming: true,
    maxContextTokens: 128000,
  },
  claude: {
    toolCalling: true,
    structuredOutput: true,
    vision: true,
    thinking: true,
    streaming: true,
    maxContextTokens: 200000,
  },
  local: {
    toolCalling: false,
    structuredOutput: false,
    vision: false,
    thinking: false,
    streaming: true,
    maxContextTokens: 32000,
  },
};

export function getProviderCapabilities(providerName: string): ProviderCapabilities {
  return (
    PROVIDER_CAPABILITY_MATRIX[providerName.toLowerCase()] ||
    PROVIDER_CAPABILITY_MATRIX['local']
  );
}
