'use server';
/**
 * @fileOverview Sugiere preguntas de interrogatorio dirigido basadas en un texto clínico.
 *
 * - suggestInterrogationQuestions - Función que maneja la generación de preguntas.
 * - SuggestInterrogationQuestionsInput - Tipo de entrada para la función.
 * - SuggestInterrogationQuestionsOutput - Tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterrogationQuestionsInputSchema = z.object({
  clinicalText: z.string().describe('El texto clínico mejorado o la historia de la enfermedad actual del paciente.'),
});
export type SuggestInterrogationQuestionsInput = z.infer<typeof SuggestInterrogationQuestionsInputSchema>;

const SuggestInterrogationQuestionsOutputSchema = z.object({
    questions: z.array(z.string()).describe('Una lista de un máximo de 5 preguntas de alto impacto clínico sugeridas para ampliar el interrogatorio.'),
});
export type SuggestInterrogationQuestionsOutput = z.infer<typeof SuggestInterrogationQuestionsOutputSchema>;

export async function suggestInterrogationQuestions(
  input: SuggestInterrogationQuestionsInput
): Promise<SuggestInterrogationQuestionsOutput> {
  return suggestInterrogationQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInterrogationQuestionsPrompt',
  input: {schema: SuggestInterrogationQuestionsInputSchema},
  output: {schema: SuggestInterrogationQuestionsOutputSchema},
  prompt: `Eres un médico experto en semiología y diagnóstico diferencial. Tu tarea es analizar el siguiente texto de la enfermedad actual de un paciente y generar una lista de **un máximo de 5 preguntas** de interrogatorio dirigido.

Estas preguntas deben ser las de **mayor relevancia e impacto clínico**. Deben estar diseñadas para:
-   Obtener información adicional crucial que pueda faltar.
-   Aclarar detalles ambiguos.
-   Explorar y diferenciar diagnósticos diferenciales relevantes, con el potencial de cambiar el diagnóstico principal.

Evita preguntas genéricas. Enfócate en las preguntas más críticas que un médico haría para refinar su diagnóstico. Las preguntas deben estar formuladas en español.

Texto Clínico:
{{{clinicalText}}}

Genera la lista de un máximo de 5 preguntas más importantes:
`,
});

const suggestInterrogationQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestInterrogationQuestionsFlow',
    inputSchema: SuggestInterrogationQuestionsInputSchema,
    outputSchema: SuggestInterrogationQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
