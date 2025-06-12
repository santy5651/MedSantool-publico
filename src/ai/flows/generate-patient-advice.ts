
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
  generalRecommendations: z.string().describe('Recomendaciones generales para el paciente, EN MAYÚSCULAS, en lenguaje claro y sencillo, formateadas como una lista o párrafos, y comenzando con el título literal "***RECOMENDACIONES GENERALES***" seguido de un salto de línea.'),
  alarmSigns: z.string().describe('Signos de alarma específicos por los cuales el paciente debería buscar atención médica urgente, EN MAYÚSCULAS, presentados como una lista o párrafos, en lenguaje claro y sencillo, y comenzando con el título literal "***SIGNOS DE ALARMA***" seguido de un salto de línea.'),
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
1.  **Recomendaciones Generales:** Consejos prácticos y generales que el paciente puede seguir para su bienestar, relacionados con su(s) condición(es). Deben ser fáciles de entender. El texto generado para esta sección DEBE comenzar exactamente con "***RECOMENDACIONES GENERALES***" seguido de un salto de línea. TODO EL CONTENIDO DE ESTA SECCIÓN DEBE ESTAR EN MAYÚSCULAS.
2.  **Signos de Alarma:** Una lista de síntomas o situaciones específicas por las cuales el paciente debe buscar atención médica de inmediato. Estos deben ser muy claros y directos. El texto generado para esta sección DEBE comenzar exactamente con "***SIGNOS DE ALARMA***" seguido de un salto de línea. TODO EL CONTENIDO DE ESTA SECCIÓN DEBE ESTAR EN MAYÚSCULAS.

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
-   Asegúrate de que la sección de recomendaciones comience con "***RECOMENDACIONES GENERALES***\\n" y la de signos de alarma con "***SIGNOS DE ALARMA***\\n".
-   TODO EL TEXTO DE RECOMENDACIONES Y SIGNOS DE ALARMA DEBE ESTAR EN MAYÚSCULAS.
-   Puedes usar listas con viñetas (-) o párrafos numerados para mejorar la legibilidad después de los títulos.
-   Asegúrate de que las recomendaciones y signos de alarma sean relevantes para la información clínica proporcionada.
-   Si la información es muy limitada, proporciona consejos muy generales y enfatiza la importancia de consultar a un médico.

**Ejemplo de Salida Esperada (estructura general):**

{
  "generalRecommendations": "***RECOMENDACIONES GENERALES***\\n- MANTENGA UNA DIETA EQUILIBRADA Y BAJA EN SAL.\\n- REALICE ACTIVIDAD FÍSICA MODERADA SEGÚN TOLERANCIA, COMO CAMINAR 30 MINUTOS AL DÍA.\\n- TOME SUS MEDICAMENTOS SEGÚN LO PRESCRITO POR SU MÉDICO Y NO SUSPENDA NINGÚN TRATAMIENTO SIN CONSULTARLO.",
  "alarmSigns": "***SIGNOS DE ALARMA***\\n- SI PRESENTA DOLOR DE PECHO OPRESIVO QUE SE IRRADIA AL BRAZO IZQUIERDO O MANDÍBULA.\\n- SI EXPERIMENTA DIFICULTAD PARA RESPIRAR DE APARICIÓN SÚBITA.\\n- SI NOTA HINCHAZÓN NUEVA EN SUS PIERNAS O AUMENTO RÁPIDO DE PESO."
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

