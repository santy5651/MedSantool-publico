
'use server';
/**
 * @fileOverview Genera recomendaciones generales, signos de alarma, indicaciones dietéticas y cuidados generales para el paciente.
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
  clinicalAnalysis: z.string().optional().describe('El análisis clínico del caso generado por IA (del Módulo 4). (Opcional, no usado directamente para generar consejos si hay diagnósticos validados o texto manual)'),
  textSummary: z.string().optional().describe('El resumen de información clave (del Módulo 3). (Opcional, no usado directamente para generar consejos si hay diagnósticos validados o texto manual)'),
  validatedDiagnoses: z.array(ValidatedDiagnosisSchema).optional().describe('Lista de diagnósticos validados por el usuario (del Módulo 5). Fuente prioritaria de información.'),
  manualDiagnosisOrAnalysis: z.string().optional().describe('Diagnóstico o breve análisis ingresado manually por el usuario. Usado si no hay diagnósticos validados.'),
});
export type GeneratePatientAdviceInput = z.infer<typeof GeneratePatientAdviceInputSchema>;

const GeneratePatientAdviceOutputSchema = z.object({
  generalRecommendations: z.string().describe('Recomendaciones generales para el paciente, EN MAYÚSCULAS, en lenguaje claro y sencillo, formateadas como una lista o párrafos, y comenzando con el título literal "***RECOMENDACIONES GENERALES***" seguido de un salto de línea.'),
  alarmSigns: z.string().describe('Signos de alarma específicos por los cuales el paciente debería buscar atención médica urgente, EN MAYÚSCULAS, presentados como una lista o párrafos, en lenguaje claro y sencillo, y comenzando con el título literal "⚠️ ***SIGNOS DE ALARMA***" seguido de un salto de línea.'),
  dietaryIndications: z.string().describe('Indicaciones sobre la dieta para el paciente, EN MAYÚSCULAS, en lenguaje claro y sencillo, y comenzando con el título literal "🍽️ ***INDICACIONES SOBRE LA DIETA***" seguido de un salto de línea.'),
  generalCare: z.string().describe('Cuidados generales para el paciente, EN MAYÚSCULAS, en lenguaje claro y sencillo, y comenzando con el título literal "⚕️ ***CUIDADOS GENERALES***" seguido de un salto de línea.'),
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
Tu tarea es generar:
1.  **Recomendaciones Generales**
2.  **Indicaciones sobre la Dieta**
3.  **Cuidados Generales**
4.  **Signos de Alarma**

**Prioridad de Información:**
1.  Si se proporcionan "Diagnósticos Validados", úsalos como la fuente principal de información.
2.  Si NO hay "Diagnósticos Validados" PERO se proporciona "Diagnóstico/Análisis Manual", usa esa información como fuente principal.
3.  Si no se proporciona ninguna de las anteriores, indica que no se puede generar consejo específico sin información diagnóstica y recomienda consultar a un profesional médico.

**Instrucciones para la Salida:**
-   Las "Recomendaciones Generales" DEBEN comenzar exactamente con "***RECOMENDACIONES GENERALES***" seguido de un salto de línea.
-   Las "Indicaciones sobre la Dieta" DEBEN comenzar exactamente con "🍽️ ***INDICACIONES SOBRE LA DIETA***" seguido de un salto de línea.
-   Los "Cuidados Generales" DEBEN comenzar exactamente con "⚕️ ***CUIDADOS GENERALES***" seguido de un salto de línea.
-   Los "Signos de Alarma" DEBEN comenzar exactamente con "⚠️ ***SIGNOS DE ALARMA***" seguido de un salto de línea.
-   TODO EL CONTENIDO DE LAS CUATRO SECCIONES DEBE ESTAR EN MAYÚSCULAS.
-   Utiliza un lenguaje sencillo, empático y directo. La información debe estar en español.
-   Puedes usar listas con viñetas (-) o párrafos numerados para mejorar la legibilidad después de los títulos.
-   Asegúrate de que las recomendaciones, indicaciones de dieta, cuidados y signos de alarma sean relevantes para la información diagnóstica proporcionada.

{{#if validatedDiagnoses.length}}
**Información Principal (Diagnósticos Validados):**
{{#each validatedDiagnoses}}
- Código: {{{this.code}}}, Descripción: {{{this.description}}}
{{/each}}
{{#if manualDiagnosisOrAnalysis}}
(También se proporcionó un texto manual, pero los diagnósticos validados tienen prioridad: {{{manualDiagnosisOrAnalysis}}})
{{/if}}
{{else if manualDiagnosisOrAnalysis}}
**Información Principal (Diagnóstico/Análisis Manual):**
{{{manualDiagnosisOrAnalysis}}}
{{else}}
**Información Principal:** No se proporcionó información diagnóstica suficiente (ni diagnósticos validados ni texto manual).
{{/if}}

**Instrucciones Específicas de Salida si no hay información diagnóstica suficiente:**
-   Si no hay diagnósticos validados ni texto manual, la salida de las cuatro secciones debe reflejar la incapacidad de dar consejos específicos, pero manteniendo los títulos con sus iconos. Ejemplo:
    "generalRecommendations": "***RECOMENDACIONES GENERALES***\\nNO SE HA PROPORCIONADO INFORMACIÓN DIAGNÓSTICA ESPECÍFICA (DIAGNÓSTICOS VALIDADOS O TEXTO MANUAL). ES FUNDAMENTAL CONSULTAR CON SU MÉDICO PARA RECIBIR INDICACIONES PERSONALIZADAS.",
    "dietaryIndications": "🍽️ ***INDICACIONES SOBRE LA DIETA***\\nNO SE PUEDEN DAR INDICACIONES DIETÉTICAS ESPECÍFICAS SIN INFORMACIÓN DIAGNÓSTICA. CONSULTE A SU MÉDICO O NUTRICIONISTA.",
    "generalCare": "⚕️ ***CUIDADOS GENERALES***\\nES IMPORTANTE SEGUIR LAS INDICACIONES GENERALES DE SU MÉDICO Y MANTENER UN ESTILO DE VIDA SALUDABLE. PARA CUIDADOS ESPECÍFICOS, CONSULTE A SU MÉDICO.",
    "alarmSigns": "⚠️ ***SIGNOS DE ALARMA***\\nCONSULTE CON SU MÉDICO ANTE CUALQUIER SÍNTOMA NUEVO O EMPEORAMIENTO DE SU CONDICIÓN ACTUAL."

Genera las recomendaciones, indicaciones de dieta, cuidados generales y signos de alarma:
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
