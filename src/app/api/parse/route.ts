import { NextRequest, NextResponse } from "next/server";
import { evaluateCandidates } from "@/lib/mastra/workflows/evaluateCandidatesWorkflow";
import { validateJobPostingText } from "@/lib/validation/inputGuards";
import { requireAiConfig } from "@/lib/api/preflight";

/**
 * POST /api/parse
 *
 * Accepts raw job posting text and returns a structured JobPosting object.
 *
 * Request body:
 *   { "jobPostingText": "Senior Software Engineer at Acme Corp..." }
 *
 * Response:
 *   { "success": true, "data": { ...JobPosting } }
 *   { "success": false, "error": "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { aiConfig, errorResponse } = requireAiConfig(req);
    if (errorResponse) return errorResponse;
    if (!aiConfig) throw new Error("AI config preflight failed.");

    const body = await req.json();
    const { jobPostingText } = body;

    if (!jobPostingText || typeof jobPostingText !== "string") {
      return NextResponse.json({ success: false, error: "jobPostingText is required and must be a string." }, { status: 400 });
    }

    const jobTextError = validateJobPostingText(jobPostingText);
    if (jobTextError) {
      return NextResponse.json({ success: false, error: jobTextError }, { status: 400 });
    }

    const result = await evaluateCandidates({
      operation: "parseJob",
      jobPostingText,
      aiConfig,
    });

    if (!result.jobPosting) {
      throw new Error("Workflow did not return a parsed job posting.");
    }

    return NextResponse.json({ success: true, data: result.jobPosting }, { status: 200 });
  } catch (err) {
    console.error("[parse] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[parse] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
