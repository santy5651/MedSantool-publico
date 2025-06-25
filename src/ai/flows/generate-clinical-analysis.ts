
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
      'Análisis clínico del caso profesional, claro y completo, en uno o dos párrafos, adecuado para entornos hospitalarios.'
    ),
  focusedAnalysis: z
    .string()
    .describe(
      'Un resumen muy breve y enfocado (2-3 líneas máximo) que resuma los hallazgos más críticos, la lista de problemas principales o la impresión diagnóstica primaria.'
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
    prompt: `Eres un médico experto. Basado en el siguiente resumen de información clave, tu tarea es doble:

1.  **Generar un Análisis Clínico Completo:** Redacta un análisis del caso que sea profesional, claro y completo, en uno o dos párrafos. Debe ser adecuado para un entorno hospitalario, como si estuvieras presentando el caso a colegas. Enfócate en los aspectos más relevantes, implicaciones potenciales y una evaluación estructurada.
2.  **Generar un Análisis Enfocado:** Redacta un resumen muy breve y directo (máximo 2-3 líneas) que sintetice los hallazgos más críticos, la lista de problemas o la impresión diagnóstica principal.

La salida debe estar en español y seguir el esquema de salida proporcionado.

Resumen Clínico:
{{{clinicalSummary}}}

Genera ambos análisis:
`,
  });

  const {output} = await prompt(input);
  return output!;
}
