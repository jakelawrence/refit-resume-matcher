import { JobPostingSchema, type JobPosting } from "./jobPosting";

// For now, resume structuring uses the same normalized shape as job postings.
export const StructuredResumeSchema = JobPostingSchema;

export type StructuredResume = JobPosting;
