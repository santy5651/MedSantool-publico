
'use server';
/**
 * @fileOverview Genera justificaciones médicas con criterio profesional.
 *
 * - generateMedicalJustification - Función que maneja la generación de la justificación.
 * - GenerateMedicalJustificationInput - Tipo de entrada para generateMedicalJustification.
 * - GenerateMedicalJustificationOutput - Tipo de retorno para generateMedicalJustification.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMedicalJustificationInputSchema = z.object({
  conceptToJustify: z
    .string()
    .describe(
      'El concepto, procedimiento o decisión médica que necesita ser justificada.'
    ),
  relevantClinicalInfo: z
    .string()
    .optional()
    .describe(
      'Información clínica relevante del paciente que ayuda a contextualizar y fundamentar la justificación. Incluir detalles como diagnósticos, evolución, tratamientos previos, etc.'
    ),
});

const GenerateMedicalJustificationInputWithKeySchema =
  GenerateMedicalJustificationInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type GenerateMedicalJustificationInput = z.infer<
  typeof GenerateMedicalJustificationInputSchema
>;
export type GenerateMedicalJustificationInputWithKey = z.infer<
  typeof GenerateMedicalJustificationInputWithKeySchema
>;

const GenerateMedicalJustificationOutputSchema = z.object({
  justificationText: z
    .string()
    .describe(
      'El texto de la justificación médica, redactado de forma profesional, clara, concisa y con criterio médico, adecuado para entornos hospitalarios.'
    ),
});
export type GenerateMedicalJustificationOutput = z.infer<
  typeof GenerateMedicalJustificationOutputSchema
>;

export async function generateMedicalJustification(
  input: GenerateMedicalJustificationInputWithKey
): Promise<GenerateMedicalJustificationOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `generateMedicalJustificationPrompt_${Date.now()}`,
    input: {schema: GenerateMedicalJustificationInputSchema},
    output: {schema: GenerateMedicalJustificationOutputSchema},
    prompt: `Eres un asistente médico experto en la redacción de justificaciones clínicas para entornos hospitalarios.
Tu tarea es generar una justificación médica profesional, clara, concisa y fundamentada para el concepto o situación proporcionada.

**Concepto a Justificar:**
{{{conceptToJustify}}}

{{#if relevantClinicalInfo}}
**Información Clínica Relevante del Paciente:**
{{{relevantClinicalInfo}}}
{{else}}
**Información Clínica Relevante del Paciente:** No proporcionada. La justificación se basará principalmente en el concepto general.
{{/if}}

**Instrucciones para la Salida:**
-   La justificación debe estar redactada en español.
-   Utiliza un lenguaje formal y técnico apropiado para un contexto médico profesional.
-   Asegúrate de que la justificación sea coherente, bien argumentada y basada en criterios médicos (si la información lo permite).
-   Debe ser concisa pero completa, cubriendo los aspectos esenciales para la justificación.
-   El formato debe ser el de un párrafo o varios párrafos bien estructurados.
-   Evita información superflua.

Genera la justificación médica:
`,
  });

  const {output} = await prompt(input);
  return output!;
}
