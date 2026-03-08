import type { RequestContext } from "@mastra/core/request-context";
import { RequestContext as MastraRequestContext } from "@mastra/core/request-context";
import {
  AI_REQUEST_CONTEXT_KEY,
  DEFAULT_MODEL_BY_PROVIDER,
  getAiConfigFromRequestContext,
  toMastraModelConfig,
  type ResolvedAiConfig,
} from "@/lib/ai/config";

const FALLBACK_AI_CONFIG: ResolvedAiConfig = {
  provider: "anthropic",
  model: DEFAULT_MODEL_BY_PROVIDER.anthropic,
};

export function resolveRuntimeModelFromContext(requestContext?: RequestContext) {
  const resolved = getAiConfigFromRequestContext(requestContext) ?? FALLBACK_AI_CONFIG;
  return toMastraModelConfig(resolved);
}

export function createAiRequestContext(aiConfig: ResolvedAiConfig) {
  const context = new MastraRequestContext();
  context.set(AI_REQUEST_CONTEXT_KEY, aiConfig);
  return context;
}
