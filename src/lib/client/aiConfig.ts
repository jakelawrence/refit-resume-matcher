import {
  AiProviderSchema,
  DEFAULT_MODEL_BY_PROVIDER,
  type AiProvider,
  type ResolvedAiConfig,
} from "@/lib/ai/config";

export type ClientAiConfig = ResolvedAiConfig;

const STORAGE_KEY = "aiConfig";

export function getDefaultClientAiConfig(): ClientAiConfig {
  return {
    provider: "anthropic",
    model: DEFAULT_MODEL_BY_PROVIDER.anthropic,
  };
}

function normalizeProvider(provider: unknown): AiProvider {
  const parsed = AiProviderSchema.safeParse(provider);
  return parsed.success ? parsed.data : "anthropic";
}

export function loadClientAiConfig(): ClientAiConfig {
  if (typeof window === "undefined") return getDefaultClientAiConfig();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultClientAiConfig();

  try {
    const parsed = JSON.parse(raw) as Partial<ClientAiConfig>;
    const provider = normalizeProvider(parsed.provider);
    const model =
      typeof parsed.model === "string" && parsed.model.startsWith(`${provider}/`)
        ? parsed.model
        : DEFAULT_MODEL_BY_PROVIDER[provider];

    return {
      provider,
      model,
    };
  } catch {
    return getDefaultClientAiConfig();
  }
}

export function saveClientAiConfig(config: ClientAiConfig) {
  if (typeof window === "undefined") return;

  const provider = normalizeProvider(config.provider);
  const normalized: ClientAiConfig = {
    provider,
    model: config.model.startsWith(`${provider}/`) ? config.model : DEFAULT_MODEL_BY_PROVIDER[provider],
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function getAiRequestHeaders(config: ClientAiConfig): Record<string, string> {
  return {
    "x-ai-provider": config.provider,
    "x-ai-model": config.model,
  };
}
