import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { StructuredResumeSchema } from "@/types/structuredResume";

export const resumeStructurerAgent = new Agent({
  id: "resume-structurer-agent",
  name: "Resume Structurer Agent",
  model: anthropic("claude-sonnet-4-5-20250929"),
  instructions: `
You are an expert resume analyst.

Your job is to convert raw resume text into the provided structured schema.
Use only information present in the resume text.

## Extraction Rules
- Be precise and avoid hallucinations.
- If data is missing, use null or "unspecified" as appropriate for the field.
- Infer employmentType and experienceLevel from the strongest evidence in the resume.
- Populate skills as comprehensively as possible from resume content.
- requiredSkills should represent clearly demonstrated core skills.
- niceToHaveSkills should represent secondary, optional, or less-emphasized skills.
- roleSummary should be a neutral 2-4 sentence synthesis of the candidate profile.
- responsibilities should be concise action-focused statements derived from experience bullets.
- Salary fields should only be set when explicitly present in the resume.

Return only structured JSON.
  `.trim(),
});

export async function parseResumeToStructured(resumeText: string) {
  const result = await resumeStructurerAgent.generate([{ role: "user", content: resumeText }], {
    structuredOutput: {
      schema: StructuredResumeSchema,
    },
  });

  return result.object;
}
