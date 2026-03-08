import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ensureResumesDir, extractPdfText, RESUMES_DIR, upsertParsedResume } from "@/lib/resumes/storage";
import { validateResumeText } from "@/lib/validation/inputGuards";
import { requireAiConfig } from "@/lib/api/preflight";
import { parseResumeToStructured } from "@/lib/mastra/agents/resumeStructurerAgent";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const runtime = "nodejs";

function safeDeleteFile(filePath: string | null) {
  if (!filePath) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function POST(req: NextRequest) {
  let savedPdfPath: string | null = null;

  try {
    const { aiConfig, errorResponse } = requireAiConfig(req);
    if (errorResponse) return errorResponse;
    if (!aiConfig) throw new Error("AI config preflight failed.");

    console.log("[upload] Received upload request");
    ensureResumesDir();

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided. Send a PDF as 'resume'." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds the 5 MB size limit." }, { status: 400 });
    }

    // Sanitize filename, forcing basename first and then a safe character set.
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");

    // If a file with the same name already exists, prefix with a timestamp
    const filename = fs.existsSync(path.join(RESUMES_DIR, safeName)) ? `${Date.now()}_${safeName}` : safeName;
    console.log(`[upload] Processing file: ${filename} (${file.size} bytes)`);
    const dest = path.join(RESUMES_DIR, filename);
    savedPdfPath = dest;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);

    const text = await extractPdfText(buffer);
    console.log(`[upload] Extracted text length: ${text.length} characters from ${filename}`);
    if (!text) {
      safeDeleteFile(savedPdfPath);
      savedPdfPath = null;
      return NextResponse.json({ success: false, error: "Could not extract text from this PDF. Please upload a text-based PDF." }, { status: 400 });
    }

    const resumeTextError = validateResumeText(text, "resume text from uploaded PDF");
    if (resumeTextError) {
      safeDeleteFile(savedPdfPath);
      savedPdfPath = null;
      return NextResponse.json({ success: false, error: resumeTextError }, { status: 400 });
    }

    const structured = await parseResumeToStructured(text, aiConfig);

    const uploadedAt = new Date().toISOString();
    const storedResume = {
      id: filename,
      filename,
      sizeBytes: file.size,
      uploadedAt,
    };

    upsertParsedResume({
      ...storedResume,
      text,
      structured,
      parsedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      resume: storedResume,
    });
  } catch (err) {
    safeDeleteFile(savedPdfPath);
    const message = err instanceof Error ? err.message : "Upload failed.";
    console.error("[upload]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
