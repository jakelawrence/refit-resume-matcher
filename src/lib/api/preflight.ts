import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  ENV_KEY_BY_PROVIDER,
  type AiProvider,
  type ResolvedAiConfig,
  hasEnvApiKey,
  normalizeAiConfig,
} from "@/lib/ai/config";

export const MISSING_API_KEY_CODE = "MISSING_API_KEY";

const AI_PROVIDER_HEADER = "x-ai-provider";
const AI_MODEL_HEADER = "x-ai-model";

function parseProvider(value: string | null): AiProvider {
  if (value === "openai" || value === "google" || value === "anthropic") {
    return value;
  }

  return "anthropic";
}

function parseOptionalHeader(value: string | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getMissingApiKeyResponse(config: ResolvedAiConfig) {
  const envKey = ENV_KEY_BY_PROVIDER[config.provider];

  return NextResponse.json(
    {
      success: false,
      code: MISSING_API_KEY_CODE,
      error: `Missing API key for provider "${config.provider}". Set ${envKey} in .env.local, then restart the dev server (npm run dev).`,
    },
    { status: 503 },
  );
}

export function getAiConfigFromRequest(req: NextRequest): ResolvedAiConfig {
  const provider = parseProvider(req.headers.get(AI_PROVIDER_HEADER));

  const model = parseOptionalHeader(req.headers.get(AI_MODEL_HEADER)) ?? DEFAULT_MODEL_BY_PROVIDER[provider];
  return normalizeAiConfig({ provider, model });
}

export function requireAiConfig(req: NextRequest) {
  const aiConfig = getAiConfigFromRequest(req);

  if (!hasEnvApiKey(aiConfig.provider)) {
    return {
      aiConfig: null,
      errorResponse: getMissingApiKeyResponse(aiConfig),
    };
  }

  return {
    aiConfig,
    errorResponse: null,
  };
}
