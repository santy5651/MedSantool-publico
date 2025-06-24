'use server';
/**
 * @fileOverview Sugiere hallazgos patológicos para un examen físico dirigido.
 *
 * - generatePhysicalExam - Función que maneja la generación del examen físico.
 * - GeneratePhysicalExamInput - Tipo de entrada para la función.
 * - GeneratePhysicalExamOutput - Tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhysicalExamInputSchema = z.object({
  diagnoses: z.array(z.object({
    code: z.string().describe('Código CIE-10 del diagnóstico.'),
    description: z.string().describe('Descripción del diagnóstico.'),
  })).describe('Lista de diagnósticos validados por el médico.'),
});
export type GeneratePhysicalExamInput = z.infer<typeof GeneratePhysicalExamInputSchema>;

const GeneratePhysicalExamOutputSchema = z.object({
    physicalExamText: z.string().describe('Un texto corto que describe únicamente los hallazgos patológicos probables en un examen físico, basado en los diagnósticos proporcionados. Cada hallazgo debe estar en una nueva línea y seguir el formato "SISTEMA: HALLAZGO".'),
});
export type GeneratePhysicalExamOutput = z.infer<typeof GeneratePhysicalExamOutputSchema>;

export async function generatePhysicalExam(
  input: GeneratePhysicalExamInput
): Promise<GeneratePhysicalExamOutput> {
  return generatePhysicalExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhysicalExamPrompt',
  input: {schema: GeneratePhysicalExamInputSchema},
  output: {schema: GeneratePhysicalExamOutputSchema},
  prompt: `Eres un médico experto en semiología. Tu tarea es analizar la siguiente lista de diagnósticos validados y generar una lista de **hallazgos patológicos probables** para un examen físico dirigido.

**Instrucciones de Salida:**
-   Solo incluye hallazgos **anormales o patológicos**. No incluyas hallazgos normales (ej. "consciente, orientado", "ruidos cardíacos rítmicos sin soplos").
-   Basa tus sugerencias estrictamente en los diagnósticos proporcionados.
-   Formatea cada hallazgo en una nueva línea, siguiendo la estructura "SISTEMA: HALLAZGO".
-   El examen físico debe ser corto y enfocado.

**Ejemplo de Salida:**
PIEL: PALIDEZ MUCOCUTÁNEA MARCADA.
RESPIRATORIO: CRÉPITOS BIBASALES.
ABDOMEN: DOLOR A LA PALPACIÓN PROFUNDA EN HIPOCONDRIO DERECHO, SIGNO DE MURPHY POSITIVO.
EXTREMIDADES: EDEMA GRADO II EN MIEMBROS INFERIORES CON FÓVEA.

Diagnósticos Validados:
{{#each diagnoses}}
- {{{this.description}}} ({{{this.code}}})
{{/each}}

Genera la lista de hallazgos patológicos para el examen físico:
`,
});

const generatePhysicalExamFlow = ai.defineFlow(
  {
    name: 'generatePhysicalExamFlow',
    inputSchema: GeneratePhysicalExamInputSchema,
    outputSchema: GeneratePhysicalExamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
