
'use server';

/**
 * @fileOverview Analyzes medical images to identify potential anomalies, generate a summary of findings, and provide a detailed radiological reading in Spanish.
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
  summary: z.string().describe('A concise summary of the key findings in Spanish.'),
  radiologistReading: z.string().describe('A detailed radiological reading of the image in Spanish, as if written by a radiologist, including description of structures, anomalies, measurements if applicable, and impressions.'),
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
  prompt: `Eres un experto radiólogo. Analiza la siguiente imagen médica. Tu tarea es doble:
1.  Identifica posibles anomalías y genera un **resumen conciso de los hallazgos clave** en español.
2.  Proporciona una **lectura radiológica detallada** de la imagen en español. Esta lectura debe ser similar a un informe radiológico formal, describiendo las estructuras visualizadas, cualquier anomalía detectada (con detalles sobre su tamaño, forma, localización si es posible), comparaciones si se mencionan implícitamente en la imagen, y una impresión diagnóstica basada en los hallazgos.

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

