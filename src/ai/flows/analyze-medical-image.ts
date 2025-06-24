
'use server';

/**
 * @fileOverview Analyzes medical radiographs to identify potential anomalies, generate a summary of findings, and provide a detailed reading in Spanish.
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
      "A medical radiograph as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMedicalImageInput = z.infer<typeof AnalyzeMedicalImageInputSchema>;

const AnalyzeMedicalImageOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key findings in Spanish.'),
  radiologistReading: z.string().describe('A detailed reading of the radiograph in Spanish, similar to a formal radiological report.'),
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
  prompt: `Eres un radiólogo experto. Tu tarea es analizar la radiografía proporcionada.

Tu análisis debe incluir dos partes:
1.  Un **resumen conciso de los hallazgos clave** en español.
2.  Una **lectura detallada** de la imagen, similar a un informe radiológico formal, también en español.

Imagen: {{media url=photoDataUri}}

Por favor, estructura tu respuesta según el esquema de salida, asegurándote de completar ambos campos: 'summary' y 'radiologistReading'.
`,
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
