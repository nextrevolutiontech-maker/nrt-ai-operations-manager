export interface FeatureFlags {
  enablePlanner: boolean;
  enableDecisionEngine: boolean;
  enableObservability: boolean;
  enableKnowledgeInjection: boolean;
  enableSessionStateMemory: boolean;
  enableToolRegistry: boolean;
  enableMultiProviderSwitching: boolean;
  enableSiernaFormatting: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  enablePlanner: true,
  enableDecisionEngine: true,
  enableObservability: true,
  enableKnowledgeInjection: true,
  enableSessionStateMemory: true,
  enableToolRegistry: true,
  enableMultiProviderSwitching: true,
  enableSiernaFormatting: true,
};
