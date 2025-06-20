
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
  clinicalAnalysis: z.string().optional().describe('El análisis clínico del caso generado por IA (del Módulo 4). (Opcional, se priorizan diagnósticos validados)'),
  textSummary: z.string().optional().describe('El resumen de información clave (del Módulo 3). (Opcional, se priorizan diagnósticos validados)'),
  validatedDiagnoses: z.array(ValidatedDiagnosisSchema).optional().describe('Lista de diagnósticos validados por el usuario (del Módulo 5), si existen. Esta es la fuente principal de información.'),
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
Basado EXCLUSIVAMENTE en los siguientes diagnósticos validados, genera:
1.  **Recomendaciones Generales:** Consejos prácticos y generales que el paciente puede seguir para su bienestar, relacionados con su(s) condición(es). Deben ser fáciles de entender. El texto generado para esta sección DEBE comenzar exactamente con "***RECOMENDACIONES GENERALES***" seguido de un salto de línea. TODO EL CONTENIDO DE ESTA SECCIÓN DEBE ESTAR EN MAYÚSCULAS.
2.  **Signos de Alarma:** Una lista de síntomas o situaciones específicas por las cuales el paciente debe buscar atención médica de inmediato. Estos deben ser muy claros y directos. El texto generado para esta sección DEBE comenzar exactamente con "***SIGNOS DE ALARMA***" seguido de un salto de línea. TODO EL CONTENIDO DE ESTA SECCIÓN DEBE ESTAR EN MAYÚSCULAS.

Si no se proporcionan diagnósticos validados, indica que no se puede generar consejo específico sin diagnósticos y recomienda consultar a un profesional médico para una evaluación.

Utiliza un lenguaje sencillo, empático y directo. La información debe estar en español.

**Diagnósticos Validados (Fuente Única de Información):**
{{#if validatedDiagnoses.length}}
{{#each validatedDiagnoses}}
- Código: {{{this.code}}}, Descripción: {{{this.description}}}
{{/each}}
{{else}}
No se proporcionaron diagnósticos validados.
{{/if}}

**Instrucciones para la Salida:**
-   Si no hay diagnósticos validados, la salida de "generalRecommendations" y "alarmSigns" debe reflejar la incapacidad de dar consejos específicos y la recomendación de consulta médica. Por ejemplo:
    "generalRecommendations": "***RECOMENDACIONES GENERALES***\\nNO SE HAN PROPORCIONADO DIAGNÓSTICOS ESPECÍFICOS. ES FUNDAMENTAL CONSULTAR CON SU MÉDICO PARA RECIBIR INDICACIONES PERSONALIZADAS.",
    "alarmSigns": "***SIGNOS DE ALARMA***\\nCONSULTE CON SU MÉDICO ANTE CUALQUIER SÍNTOMA NUEVO O EMPEORAMIENTO DE SU CONDICIÓN ACTUAL."
-   Asegúrate de que la sección de recomendaciones comience con "***RECOMENDACIONES GENERALES***\\n" y la de signos de alarma con "***SIGNOS DE ALARMA***\\n".
-   TODO EL TEXTO DE RECOMENDACIONES Y SIGNOS DE ALARMA DEBE ESTAR EN MAYÚSCULAS.
-   Puedes usar listas con viñetas (-) o párrafos numerados para mejorar la legibilidad después de los títulos.
-   Asegúrate de que las recomendaciones y signos de alarma sean relevantes para los diagnósticos proporcionados.

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

