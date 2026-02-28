import { z } from "zod";

export const CandidateExperienceLevelSchema = z.enum(["entry", "mid", "senior", "lead", "executive", "unspecified"]);

export const CandidateEducationLevelSchema = z.enum(["high_school", "associates", "bachelors", "masters", "phd", "bootcamp", "certificate", "unspecified"]);

export const CandidateSkillSchema = z.object({
  name: z.string().describe("Canonical skill name, e.g. 'TypeScript', 'React', 'AWS'"),
  category: z.enum(["technical", "soft", "domain", "tool", "language", "certification"]).describe("Broad category this skill belongs to"),
  proficiency: z.enum(["foundational", "working", "advanced", "expert", "unspecified"]).describe("Proficiency inferred from evidence in the resume"),
  yearsExperience: z.number().nullable().describe("Estimated years of experience with this skill, null if not inferable"),
});

export const WorkExperienceEntrySchema = z.object({
  company: z.string().nullable().describe("Employer or client name, null if not found"),
  title: z.string().describe("Role title as written in the resume"),
  location: z.string().nullable().describe("Role location (city/remote/etc), null if not stated"),
  startDate: z.string().nullable().describe("Start date in original format (e.g. '2021-06' or '2021'), null if unknown"),
  endDate: z.string().nullable().describe("End date in original format, or null when current/unknown"),
  isCurrent: z.boolean().describe("True when the role is marked as current/present"),
  summary: z.string().describe("1-3 sentence neutral summary of scope and impact"),
  accomplishments: z.array(z.string()).describe("Concise impact bullets with measurable outcomes when available"),
  technologies: z.array(z.string()).describe("Tools/technologies explicitly used in this role"),
});

export const ProjectEntrySchema = z.object({
  name: z.string().describe("Project name or concise label"),
  role: z.string().nullable().describe("Candidate role on the project, null if unspecified"),
  summary: z.string().describe("1-2 sentence project description"),
  technologies: z.array(z.string()).describe("Technologies used in the project"),
  outcomes: z.array(z.string()).describe("Key results, impact, or deliverables"),
});

export const EducationEntrySchema = z.object({
  institution: z.string().nullable().describe("School/university/provider name, null if not found"),
  degree: z.string().nullable().describe("Degree/certificate title, null if not found"),
  fieldOfStudy: z.string().nullable().describe("Field/major, null if not found"),
  educationLevel: CandidateEducationLevelSchema.describe("Normalized level of this credential"),
  startYear: z.number().nullable().describe("Start year if available"),
  endYear: z.number().nullable().describe("Completion year if available"),
});

export const CertificationEntrySchema = z.object({
  name: z.string().describe("Certification name"),
  issuer: z.string().nullable().describe("Issuing organization, null if not found"),
  issuedYear: z.number().nullable().describe("Issue year, null if not found"),
  expiresYear: z.number().nullable().describe("Expiration year, null if not found"),
});

export const StructuredResumeSchema = z.object({
  candidateName: z.string().nullable().describe("Candidate full name, null if not present"),
  headline: z.string().nullable().describe("Professional headline or desired role, null if not present"),
  email: z.string().nullable().describe("Email address, null if not present"),
  phone: z.string().nullable().describe("Phone number, null if not present"),
  location: z.string().nullable().describe("Candidate location or preferred location, null if not present"),
  linkedinUrl: z.string().nullable().describe("LinkedIn URL, null if not present"),
  githubUrl: z.string().nullable().describe("GitHub URL, null if not present"),
  portfolioUrl: z.string().nullable().describe("Portfolio/personal site URL, null if not present"),
  roleSummary: z.string().describe("2-4 sentence synthesis of candidate profile and strengths"),
  experienceLevel: CandidateExperienceLevelSchema.describe("Seniority inferred from experience history"),
  totalYearsExperience: z.number().nullable().describe("Estimated total years of professional experience, null if not inferable"),
  skills: z.array(CandidateSkillSchema).describe("All extracted skills with category and proficiency"),
  coreSkills: z.array(z.string()).describe("Most evidenced skills central to the candidate's profile"),
  toolsAndTechnologies: z.array(z.string()).describe("Frameworks/platforms/tools explicitly mentioned"),
  domainExpertise: z.array(z.string()).describe("Industry or domain areas with evidence in experience"),
  workExperience: z.array(WorkExperienceEntrySchema).describe("Chronological work history entries"),
  projects: z.array(ProjectEntrySchema).describe("Notable personal/professional projects"),
  education: z.array(EducationEntrySchema).describe("Education credentials"),
  certifications: z.array(CertificationEntrySchema).describe("Professional certifications"),
  achievements: z.array(z.string()).describe("Awards, publications, recognitions, or notable outcomes"),
  keywords: z.array(z.string()).describe("High-signal ATS/search keywords inferred from resume evidence"),
});

export type StructuredResume = z.infer<typeof StructuredResumeSchema>;
export type CandidateSkill = z.infer<typeof CandidateSkillSchema>;
export type WorkExperienceEntry = z.infer<typeof WorkExperienceEntrySchema>;
