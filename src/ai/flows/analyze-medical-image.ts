'use server';

/**
 * @fileOverview Analyzes medical images to identify potential anomalies and generate a summary of findings in Spanish.
 *
 * - analyzeMedicalImage - A function that handles the medical image analysis process.
 * - AnalyzeMedicalImageInput - The input type for the analyzeMedicalImage function.
 * - AnalyzeMedicalImageOutput - The return type for the analyzeMedicalImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMedicalImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A medical image (radiograph, CT scan, MRI) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMedicalImageInput = z.infer<typeof AnalyzeMedicalImageInputSchema>;

const AnalyzeMedicalImageOutputSchema = z.object({
  summary: z.string().describe('A summary of the findings in Spanish.'),
});
export type AnalyzeMedicalImageOutput = z.infer<typeof AnalyzeMedicalImageOutputSchema>;

export async function analyzeMedicalImage(
  input: AnalyzeMedicalImageInput
): Promise<AnalyzeMedicalImageOutput> {
  return analyzeMedicalImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMedicalImagePrompt',
  input: {schema: AnalyzeMedicalImageInputSchema},
  output: {schema: AnalyzeMedicalImageOutputSchema},
  prompt: `Eres un experto radiólogo. Analiza la siguiente imagen médica e identifica posibles anomalías y genera un resumen de los hallazgos en español.

Imagen: {{media url=photoDataUri}}`,
});

const analyzeMedicalImageFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalImageFlow',
    inputSchema: AnalyzeMedicalImageInputSchema,
    outputSchema: AnalyzeMedicalImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
