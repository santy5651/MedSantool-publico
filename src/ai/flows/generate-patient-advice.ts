'use server';
/**
 * @fileOverview Genera recomendaciones generales y signos de alarma para el paciente.
 *
 * - generatePatientAdvice - Función que maneja la generación de consejos para el paciente.
 * - GeneratePatientAdviceInput - Tipo de entrada para generatePatientAdvice.
 * - GeneratePatientAdviceOutput - Tipo de retorno para generatePatientAdvice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatedDiagnosisSchema = z.object({
  code: z.string().describe('Código CIE-10 del diagnóstico.'),
  description: z.string().describe('Descripción del diagnóstico.'),
});

const GeneratePatientAdviceInputSchema = z.object({
  clinicalAnalysis: z.string().optional().describe('El análisis clínico del caso generado por IA (del Módulo 4).'),
  textSummary: z.string().optional().describe('El resumen de información clave (del Módulo 3).'),
  validatedDiagnoses: z.array(ValidatedDiagnosisSchema).optional().describe('Lista de diagnósticos validados por el usuario (del Módulo 5), si existen.'),
});
export type GeneratePatientAdviceInput = z.infer<typeof GeneratePatientAdviceInputSchema>;

const GeneratePatientAdviceOutputSchema = z.object({
  generalRecommendations: z.string().describe('Recomendaciones generales para el paciente, en lenguaje claro y sencillo, presentadas como una lista o párrafos.'),
  alarmSigns: z.string().describe('Signos de alarma específicos por los cuales el paciente debería buscar atención médica urgente, presentados como una lista o párrafos, en lenguaje claro y sencillo.'),
});
export type GeneratePatientAdviceOutput = z.infer<typeof GeneratePatientAdviceOutputSchema>;

export async function generatePatientAdvice(
  input: GeneratePatientAdviceInput
): Promise<GeneratePatientAdviceOutput> {
  return generatePatientAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientAdvicePrompt',
  input: {schema: GeneratePatientAdviceInputSchema},
  output: {schema: GeneratePatientAdviceOutputSchema},
  prompt: `Eres un asistente médico virtual encargado de proporcionar información clara y útil para pacientes.
Basado en la siguiente información clínica, genera:
1.  **Recomendaciones Generales:** Consejos prácticos y generales que el paciente puede seguir para su bienestar, relacionados con su(s) condición(es). Deben ser fáciles de entender.
2.  **Signos de Alarma:** Una lista de síntomas o situaciones específicas por las cuales el paciente debe buscar atención médica de inmediato. Estos deben ser muy claros y directos.

Utiliza un lenguaje sencillo, empático y directo. La información debe estar en español.

**Información Clínica Base:**
{{#if clinicalAnalysis}}
**Análisis Clínico del Caso (IA):**
{{{clinicalAnalysis}}}
{{else}}
**Análisis Clínico del Caso (IA):** No disponible.
{{/if}}

{{#if textSummary}}
**Resumen de Información Clave:**
{{{textSummary}}}
{{else}}
**Resumen de Información Clave:** No disponible.
{{/if}}

{{#if validatedDiagnoses.length}}
**Diagnósticos Validados:**
{{#each validatedDiagnoses}}
- Código: {{{this.code}}}, Descripción: {{{this.description}}}
{{/each}}
{{else}}
**Diagnósticos Validados:** Ninguno especificado.
{{/if}}

**Instrucciones para la Salida:**
-   Separa claramente las "Recomendaciones Generales" de los "Signos de Alarma".
-   Puedes usar listas con viñetas (-) o párrafos numerados para mejorar la legibilidad.
-   Asegúrate de que las recomendaciones y signos de alarma sean relevantes para la información clínica proporcionada.
-   Si la información es muy limitada, proporciona consejos muy generales y enfatiza la importancia de consultar a un médico.

**Ejemplo de Salida Esperada (estructura general):**

{
  "generalRecommendations": "- Mantenga una dieta equilibrada y baja en sal.\\n- Realice actividad física moderada según tolerancia, como caminar 30 minutos al día.\\n- Tome sus medicamentos según lo prescrito por su médico y no suspenda ningún tratamiento sin consultarlo.",
  "alarmSigns": "- Si presenta dolor de pecho opresivo que se irradia al brazo izquierdo o mandíbula.\\n- Si experimenta dificultad para respirar de aparición súbita.\\n- Si nota hinchazón nueva en sus piernas o aumento rápido de peso."
}

Genera las recomendaciones y signos de alarma:
`,
});

const generatePatientAdviceFlow = ai.defineFlow(
  {
    name: 'generatePatientAdviceFlow',
    inputSchema: GeneratePatientAdviceInputSchema,
    outputSchema: GeneratePatientAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
