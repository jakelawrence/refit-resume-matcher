import { NextResponse } from "next/server";

export const MISSING_API_KEY_CODE = "MISSING_API_KEY";

function hasApiKey(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getMissingApiKeyResponse() {
  return NextResponse.json(
    {
      success: false,
      code: MISSING_API_KEY_CODE,
      error:
        "Missing ANTHROPIC_API_KEY. Add ANTHROPIC_API_KEY=<your_key> to .env.local, then restart the dev server (`npm run dev`).",
    },
    { status: 503 },
  );
}

export function requireAnthropicApiKey() {
  if (!hasApiKey(process.env.ANTHROPIC_API_KEY)) {
    return getMissingApiKeyResponse();
  }

  return null;
}
