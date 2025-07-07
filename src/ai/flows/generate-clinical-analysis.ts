
'use server';
/**
 * @fileOverview Generates a clinical case analysis based on a summary.
 *
 * - generateClinicalAnalysis - A function that handles the clinical analysis generation.
 * - GenerateClinicalAnalysisInput - The input type for the generateClinicalAnalysis function.
 * - GenerateClinicalAnalysisOutput - The return type for the generateClinicalAnalysis function.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClinicalAnalysisInputSchema = z.object({
  clinicalSummary: z
    .string()
    .describe('Concise summary of key clinical information for the case.'),
});

const GenerateClinicalAnalysisInputWithKeySchema =
  GenerateClinicalAnalysisInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type GenerateClinicalAnalysisInput = z.infer<
  typeof GenerateClinicalAnalysisInputSchema
>;
export type GenerateClinicalAnalysisInputWithKey = z.infer<
  typeof GenerateClinicalAnalysisInputWithKeySchema
>;

const GenerateClinicalAnalysisOutputSchema = z.object({
  comprehensiveAnalysis: z
    .string()
    .describe(
      'Clinical analysis of the case: professional, clear, and complete, in one or two paragraphs, suitable for hospital settings, in spanish.'
    ),
  focusedAnalysis: z
    .string()
    .describe(
      'A very brief and focused summary (maximum 2–3 lines) highlighting the most critical findings, main problem list, or primary diagnostic impression, in spanish.'
    ),
});
export type GenerateClinicalAnalysisOutput = z.infer<
  typeof GenerateClinicalAnalysisOutputSchema
>;

export async function generateClinicalAnalysis(
  input: GenerateClinicalAnalysisInputWithKey
): Promise<GenerateClinicalAnalysisOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `generateClinicalAnalysisPrompt_${Date.now()}`,
    input: {schema: GenerateClinicalAnalysisInputSchema},
    output: {schema: GenerateClinicalAnalysisOutputSchema},
    prompt: `You are an expert physician. Based on the following summary of key information, your task is twofold:

1.  **Generate a Complete Clinical Analysis**: Write a case analysis that is professional, clear, and comprehensive, in one or two paragraphs. It should be suitable for a hospital setting, as if you were presenting the case to colleagues. Focus on the most relevant aspects, potential implications, and a structured assessment.
2.  **Generate a Focused Analysis**: Write a very brief and direct summary (maximum 2–3 lines) that synthesizes the most critical findings, the problem list, or the primary diagnostic impression.

The output must be in Spanish and follow the provided output format.

Clinical Summary:
{{{clinicalSummary}}}

Generate both analyses:
`,
  });

  const {output} = await prompt(input);
  return output!;
}
