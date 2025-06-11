'use server';
/**
 * @fileOverview Generates a clinical case analysis based on a summary.
 *
 * - generateClinicalAnalysis - A function that handles the clinical analysis generation.
 * - GenerateClinicalAnalysisInput - The input type for the generateClinicalAnalysis function.
 * - GenerateClinicalAnalysisOutput - The return type for the generateClinicalAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClinicalAnalysisInputSchema = z.object({
  clinicalSummary: z.string().describe('Concise summary of key clinical information for the case.'),
});
export type GenerateClinicalAnalysisInput = z.infer<typeof GenerateClinicalAnalysisInputSchema>;

const GenerateClinicalAnalysisOutputSchema = z.object({
  clinicalAnalysis: z.string().describe('A professional, clear, and comprehensive clinical case analysis in a single paragraph, suitable for hospital environments.'),
});
export type GenerateClinicalAnalysisOutput = z.infer<typeof GenerateClinicalAnalysisOutputSchema>;

export async function generateClinicalAnalysis(
  input: GenerateClinicalAnalysisInput
): Promise<GenerateClinicalAnalysisOutput> {
  return generateClinicalAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClinicalAnalysisPrompt',
  input: {schema: GenerateClinicalAnalysisInputSchema},
  output: {schema: GenerateClinicalAnalysisOutputSchema},
  prompt: `You are an expert physician. Based on the following key clinical information summary, generate a concise and professional analysis of the case in a single paragraph.
The analysis must be clear, comprehensive, and suitable for a hospital environment, as if you were presenting the case to colleagues.
Focus on the most relevant aspects, potential implications, and a structured assessment.
The output should be in Spanish.

Clinical Summary:
{{{clinicalSummary}}}

Generated Clinical Analysis (single paragraph):
`,
});

const generateClinicalAnalysisFlow = ai.defineFlow(
  {
    name: 'generateClinicalAnalysisFlow',
    inputSchema: GenerateClinicalAnalysisInputSchema,
    outputSchema: GenerateClinicalAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
