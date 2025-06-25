
'use server';

/**
 * @fileOverview An AI agent that suggests potential diagnoses based on clinical data.
 *
 * - suggestDiagnosis - A function that takes clinical data as input and returns a list of suggested diagnoses with confidence scores and descriptions.
 * - SuggestDiagnosisInput - The input type for the suggestDiagnosis function.
 * - SuggestDiagnosisOutput - The return type for the suggestDiagnosis function.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiagnosisInputSchema = z.object({
  clinicalData: z
    .string()
    .describe(
      'The consolidated clinical data, including summaries of medical images, PDF documents, and clinical notes.'
    ),
});

const SuggestDiagnosisInputWithKeySchema = SuggestDiagnosisInputSchema.extend({
  apiKey: z.string().optional().describe('User provided Google AI API key.'),
});

export type SuggestDiagnosisInput = z.infer<typeof SuggestDiagnosisInputSchema>;
export type SuggestDiagnosisInputWithKey = z.infer<
  typeof SuggestDiagnosisInputWithKeySchema
>;

const SuggestDiagnosisOutputSchema = z.array(
  z.object({
    code: z.string().describe('The CIE-10 code for the diagnosis.'),
    description: z
      .string()
      .describe('The description of the diagnosis in Spanish.'),
    confidence: z
      .number()
      .describe('The confidence score for the diagnosis (0-1).'),
  })
);
export type SuggestDiagnosisOutput = z.infer<typeof SuggestDiagnosisOutputSchema>;

export async function suggestDiagnosis(
  input: SuggestDiagnosisInputWithKey
): Promise<SuggestDiagnosisOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `suggestDiagnosisPrompt_${Date.now()}`,
    input: {schema: SuggestDiagnosisInputSchema},
    output: {schema: SuggestDiagnosisOutputSchema},
    prompt: `You are an AI assistant designed to suggest potential diagnoses based on the provided clinical data.
  You should provide a list of possible diagnoses with their corresponding CIE-10 codes, descriptions in Spanish, and a confidence score between 0 and 1.

  Clinical Data: {{{clinicalData}}}

  Format your output as a JSON array of objects with the following keys: code, description, confidence.
  Example:
  [
    {
      "code": "I25.1",
      "description": "Enfermedad ateroesclerótica del corazón",
      "confidence": 0.85
    },
    {
      "code": "E11.9",
      "description": "Diabetes mellitus tipo 2, sin complicaciones",
      "confidence": 0.70
    }
  ]
`,
  });

  const {output} = await prompt(input);
  return output!;
}
