
'use server';
/**
 * @fileOverview Sugiere un plan terapéutico (medicamentos y conductas) basado en análisis clínico, resumen y diagnósticos validados.
 *
 * - suggestTreatmentPlan - Función que maneja la sugerencia del plan terapéutico.
 * - SuggestTreatmentPlanInput - Tipo de entrada para suggestTreatmentPlan.
 * - SuggestTreatmentPlanOutput - Tipo de retorno para suggestTreatmentPlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTreatmentPlanInputSchema = z.object({
  clinicalAnalysis: z.string().describe('El análisis clínico del caso generado por IA (del Módulo 4).'),
  textSummary: z.string().describe('El resumen de información clave (del Módulo 3).'),
  validatedDiagnoses: z.array(
    z.object({
      code: z.string().describe('Código CIE-10 del diagnóstico.'),
      description: z.string().describe('Descripción del diagnóstico.'),
    })
  ).optional().describe('Lista de diagnósticos validados por el usuario (del Módulo 5), si existen.'),
});
export type SuggestTreatmentPlanInput = z.infer<typeof SuggestTreatmentPlanInputSchema>;

const SuggestTreatmentPlanOutputSchema = z.object({
  suggestedPlanText: z.string().describe('Texto con las sugerencias de medicamentos y conductas, formateado como se especifica.'),
});
export type SuggestTreatmentPlanOutput = z.infer<typeof SuggestTreatmentPlanOutputSchema>;

export async function suggestTreatmentPlan(
  input: SuggestTreatmentPlanInput
): Promise<SuggestTreatmentPlanOutput> {
  return suggestTreatmentPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentPlanPrompt',
  input: {schema: SuggestTreatmentPlanInputSchema},
  output: {schema: SuggestTreatmentPlanOutputSchema},
  prompt: `Eres un asistente médico experto en la creación de planes terapéuticos.
Basado en la siguiente información clínica, genera sugerencias de medicamentos y conductas/procedimientos.

**Análisis Clínico del Caso (IA):**
{{{clinicalAnalysis}}}

**Resumen de Información Clave:**
{{{textSummary}}}

{{#if validatedDiagnoses}}
**Diagnósticos Validados:**
{{#each validatedDiagnoses}}
- Código: {{{this.code}}}, Descripción: {{{this.description}}}
{{/each}}
{{else}}
**Diagnósticos Validados:** Ninguno especificado.
{{/if}}

**Instrucciones para la Salida:**
1.  Las sugerencias deben estar en español.
2.  **Medicamentos:** Listar cada medicamento sugerido en una nueva línea con el formato exacto: "NOMBRE DEL MEDICAMENTO, PRESENTACIÓN Y CONCENTRACIÓN, DOSIS, VÍA, FRECUENCIA, DURACIÓN (opcional)". Ejemplo: "AMPICILINA/SULBACTAM, AMPOLLAS DE 1G/0.5G, 3 GRAMOS, IV, CADA 8 HORAS, POR 5 DIAS".
3.  **Conductas/Procedimientos:** Listar cada conducta o procedimiento sugerido en una nueva línea. Prefijar con "SE SOLICITA " o "REALIZAR " según corresponda. Ejemplo: "SE SOLICITA RADIOGRAFIA DE TORAX", "SE SOLICITA HEMOGRAMA, BUN, CREATININA, GASES ARTERIALES".
4.  Si no hay medicamentos o conductas específicas que sugerir basado en la información, indica "No se sugieren medicamentos específicos con la información actual." o "No se sugieren conductas adicionales con la información actual." respectivamente.
5.  El resultado debe ser un texto coherente.

**Ejemplo de Salida Esperada:**
AMPICILINA/SULBACTAM, AMPOLLAS DE 1G/0.5G, 3 GRAMOS, IV, CADA 8 HORAS, POR 5 DIAS
IBUPROFENO, TABLETAS DE 400 MG, 400 MG, VÍA ORAL, CADA 8 HORAS, SI DOLOR
SE SOLICITA RADIOGRAFIA DE TORAX
SE SOLICITA HEMOGRAMA, BUN, CREATININA
CONSIDERAR INTERCONSULTA CON CARDIOLOGÍA

**Importante:** Estas son sugerencias y deben ser validadas por un profesional médico.

Genera el plan terapéutico sugerido:
`,
});

const suggestTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentPlanFlow',
    inputSchema: SuggestTreatmentPlanInputSchema,
    outputSchema: SuggestTreatmentPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
