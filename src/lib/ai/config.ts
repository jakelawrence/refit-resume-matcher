import type { MastraModelConfig } from "@mastra/core/agent";
import type { RequestContext } from "@mastra/core/request-context";
import { z } from "zod";

export const AI_REQUEST_CONTEXT_KEY = "aiConfig";

export const AiProviderSchema = z.enum(["anthropic", "openai", "google"]);

export type AiProvider = z.infer<typeof AiProviderSchema>;

export const ResolvedAiConfigSchema = z.object({
  provider: AiProviderSchema,
  model: z.string().trim().min(1),
});

export type ResolvedAiConfig = z.infer<typeof ResolvedAiConfigSchema>;

export const DEFAULT_MODEL_BY_PROVIDER: Record<AiProvider, string> = {
  anthropic: "anthropic/claude-sonnet-4-5-20250929",
  openai: "openai/gpt-5-mini",
  google: "google/gemini-2.5-flash",
};

export const ENV_KEY_BY_PROVIDER: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

const AiRequestConfigSchema = z.object({
  provider: AiProviderSchema,
  model: z.string().trim().min(1).optional(),
});

export type AiRequestConfig = z.infer<typeof AiRequestConfigSchema>;

export function normalizeAiConfig(input: AiRequestConfig): ResolvedAiConfig {
  const model = input.model ?? DEFAULT_MODEL_BY_PROVIDER[input.provider];

  if (!model.startsWith(`${input.provider}/`)) {
    throw new Error(
      `Invalid model "${model}" for provider "${input.provider}". Expected a model id beginning with "${input.provider}/".`,
    );
  }

  return {
    provider: input.provider,
    model,
  };
}

export function parseAiConfig(input: unknown): ResolvedAiConfig | null {
  const parsed = AiRequestConfigSchema.safeParse(input);
  if (!parsed.success) return null;

  try {
    return normalizeAiConfig(parsed.data);
  } catch {
    return null;
  }
}

export function hasApiKey(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasEnvApiKey(provider: AiProvider) {
  return hasApiKey(process.env[ENV_KEY_BY_PROVIDER[provider]]);
}

export function getAiConfigFromRequestContext(requestContext?: RequestContext): ResolvedAiConfig | null {
  if (!requestContext) return null;

  const rawConfig = requestContext.get(AI_REQUEST_CONTEXT_KEY);
  return parseAiConfig(rawConfig);
}

export function toMastraModelConfig(config: ResolvedAiConfig): MastraModelConfig {
  return config.model;
}
