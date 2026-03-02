import { z } from "zod";
import { JobPostingSchema } from "./jobPosting";

// ─── Input schema ─────────────────────────────────────────────────────────────

export const ResumeInputSchema = z.object({
  id: z.string().describe("Unique identifier for this resume, e.g. the filename"),
  text: z.string().describe("Plain text content extracted from the resume PDF"),
});

export const ScorerInputSchema = z.object({
  jobPosting: JobPostingSchema.describe("Structured job posting output from the Job Parser Agent"),
  resumes: z.array(ResumeInputSchema).describe("Array of resumes to score against the job posting"),
  threshold: z.number().default(70).describe("Minimum composite score (0-100) a resume must reach to be considered a match"),
});

// ─── Inline score shape ───────────────────────────────────────────────────────
// Defined as a plain function so we can stamp out identical inline shapes
// for both scores[] items and bestMatch without creating a reusable $ref.

const inlineResumeScore = () =>
  z.object({
    id: z.string().describe("Matches the id field from the input ResumeInput"),

    // Skills Match (weight: 0.40)
    skillsMatchScore: z.number().describe("Skills match score between 0 and 100"),
    skillsMatchWeight: z.number().describe("Fixed weighting: 0.40"),
    skillsMatchReasoning: z.string().describe("1-2 sentence explanation of the skills match score"),

    // Experience Relevance (weight: 0.30)
    experienceRelevanceScore: z.number().describe("Experience relevance score between 0 and 100"),
    experienceRelevanceWeight: z.number().describe("Fixed weighting: 0.30"),
    experienceRelevanceReasoning: z.string().describe("1-2 sentence explanation of the experience relevance score"),

    // Education Match (weight: 0.15)
    educationMatchScore: z.number().describe("Education match score between 0 and 100"),
    educationMatchWeight: z.number().describe("Fixed weighting: 0.15"),
    educationMatchReasoning: z.string().describe("1-2 sentence explanation of the education match score"),

    // Keyword Density (weight: 0.15)
    keywordDensityScore: z.number().describe("Keyword density score between 0 and 100"),
    keywordDensityWeight: z.number().describe("Fixed weighting: 0.15"),
    keywordDensityReasoning: z.string().describe("1-2 sentence explanation of the keyword density score"),

    // Composite
    compositeScore: z.number().describe("Weighted composite score across all dimensions, rounded to one decimal place. Must be between 0 and 100."),

    // Human-readable output
    summary: z.string().describe("2-3 sentence plain-English summary of the candidate's fit for the role"),
    matchedSkills: z.array(z.string()).describe("Required skills from the posting that were found in this resume"),
    missingSkills: z.array(z.string()).describe("Required skills from the posting that were NOT found in this resume"),
    matchedKeywords: z.array(z.string()).describe("ATS keywords from the posting found in this resume"),
    recommendations: z
      .object({
        addSkills: z.array(z.string()).describe("Concrete skills to add because they are required or high-impact for this role"),
        removeSkills: z.array(z.string()).describe("Skills to remove or de-emphasize because they are irrelevant to this role"),
        addExperienceBullets: z
          .array(z.string())
          .describe("Specific bullet ideas to add that improve alignment with responsibilities, impact, or domain"),
        removeOrTrimBullets: z
          .array(z.string())
          .describe("Specific existing bullets to trim/remove because they are low-relevance or too verbose for this role"),
        summary: z.string().describe("1-2 sentence explanation tying these recommendations to the job requirements"),
      })
      .describe("Actionable resume-edit recommendations for this specific job"),

    meetsThreshold: z.boolean().describe("True if compositeScore >= the requested threshold"),
  });

// ─── Output schema ────────────────────────────────────────────────────────────
// scores[] items and bestMatch both use inlineResumeScore() — called twice so
// each produces its own independent inline object with no shared $ref.

export const ScorerOutputSchema = z.object({
  scores: z.array(inlineResumeScore()).describe("Scored results for every resume, sorted by compositeScore descending"),
  bestMatch: inlineResumeScore().describe("The resume with the highest compositeScore"),
  bestMatchMeetsThreshold: z.boolean().describe("True if the best match's compositeScore meets or exceeds the threshold"),
  threshold: z.number().describe("The threshold value that was used for this scoring run"),
});

// Lean model-output schema to reduce Anthropic grammar size; workflow computes
// bestMatch and threshold flags deterministically after scoring.
export const ScorerModelOutputSchema = z.object({
  scores: z.array(inlineResumeScore()).describe("Scored results for every resume before deterministic post-processing"),
});

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type ResumeInput = z.infer<typeof ResumeInputSchema>;
export type ScorerInput = z.infer<typeof ScorerInputSchema>;
export type ResumeScore = z.infer<ReturnType<typeof inlineResumeScore>>;
export type ScorerModelOutput = z.infer<typeof ScorerModelOutputSchema>;
export type ScorerOutput = z.infer<typeof ScorerOutputSchema>;
