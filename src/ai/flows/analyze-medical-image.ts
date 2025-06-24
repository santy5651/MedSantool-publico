
'use server';

/**
 * @fileOverview Analyzes medical images (including EKGs) to identify potential anomalies, generate a summary of findings, and provide a detailed reading in Spanish.
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
      "A medical image (radiograph, CT scan, MRI, EKG) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMedicalImageInput = z.infer<typeof AnalyzeMedicalImageInputSchema>;

const AnalyzeMedicalImageOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key findings in Spanish.'),
  radiologistReading: z.string().describe('A detailed reading of the image in Spanish. For radiological images, this is a formal report. For an EKG, this is a cardiologist\'s interpretation (rhythm, rate, axis, intervals, morphology, conclusion).'),
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
  prompt: `Eres un experto en diagnóstico médico por imagen. Tu rol se adapta al tipo de imagen proporcionada.
- Si la imagen es radiológica (radiografía, TAC, RMN), actuarás como un **radiólogo experto**.
- Si la imagen es un electrocardiograma (EKG), actuarás como un **cardiólogo experto**.

Tu tarea es doble:
1.  Identifica posibles anomalías y genera un **resumen conciso de los hallazgos clave** en español.
2.  Proporciona una **lectura detallada** de la imagen en español.
    -   Para imágenes radiológicas, la lectura debe ser similar a un informe radiológico formal.
    -   Para un EKG, la lectura debe ser un informe de interpretación cardiológica, analizando ritmo, frecuencia, eje, intervalos (PR, QRS, QT), morfología de ondas y segmentos (P, QRS, T, ST) y una conclusión diagnóstica.

Imagen: {{media url=photoDataUri}}

Por favor, estructura tu respuesta según el esquema de salida, asegurándote de completar ambos campos: 'summary' y 'radiologistReading'. El campo 'radiologistReading' debe contener el informe detallado, ya sea radiológico o cardiológico.
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

