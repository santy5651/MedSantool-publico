
'use server';
/**
 * @fileOverview Sugiere preguntas de interrogatorio dirigido basadas en un texto clínico.
 *
 * - suggestInterrogationQuestions - Función que maneja la generación de preguntas.
 * - SuggestInterrogationQuestionsInput - Tipo de entrada para la función.
 * - SuggestInterrogationQuestionsOutput - Tipo de retorno para la función.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterrogationQuestionsInputSchema = z.object({
  clinicalText: z
    .string()
    .describe(
      'El texto clínico mejorado o la historia de la enfermedad actual del paciente.'
    ),
});

const SuggestInterrogationQuestionsInputWithKeySchema =
  SuggestInterrogationQuestionsInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type SuggestInterrogationQuestionsInput = z.infer<
  typeof SuggestInterrogationQuestionsInputSchema
>;
export type SuggestInterrogationQuestionsInputWithKey = z.infer<
  typeof SuggestInterrogationQuestionsInputWithKeySchema
>;

const InterrogationQuestionSchema = z.object({
  question: z.string().describe('La pregunta específica a realizar.'),
  rationale: z
    .string()
    .describe(
      'El diagnóstico diferencial o la patología que la pregunta ayuda a explorar. (ej. TEP, SCA, Pericarditis)'
    ),
});

const SuggestInterrogationQuestionsOutputSchema = z.object({
  questions: z
    .array(InterrogationQuestionSchema)
    .describe(
      'Una lista de un máximo de 5 preguntas de alto impacto clínico sugeridas para ampliar el interrogatorio, cada una con su justificación diagnóstica.'
    ),
});
export type SuggestInterrogationQuestionsOutput = z.infer<
  typeof SuggestInterrogationQuestionsOutputSchema
>;

export async function suggestInterrogationQuestions(
  input: SuggestInterrogationQuestionsInputWithKey
): Promise<SuggestInterrogationQuestionsOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `suggestInterrogationQuestionsPrompt_${Date.now()}`,
    input: {schema: SuggestInterrogationQuestionsInputSchema},
    output: {schema: SuggestInterrogationQuestionsOutputSchema},
    prompt: `Eres un médico experto en semiología y diagnóstico diferencial. Tu tarea es analizar el siguiente texto de la enfermedad actual de un paciente y generar una lista de **un máximo de 5 preguntas** de interrogatorio dirigido.

Estas preguntas deben ser las de **mayor relevancia e impacto clínico**. Deben estar diseñadas para:
-   Obtener información adicional crucial que pueda faltar.
-   Aclarar detalles ambiguos.
-   Explorar y diferenciar diagnósticos diferenciales relevantes, con el potencial de cambiar el diagnóstico principal.

**Instrucciones de Salida:**
-   Por cada pregunta, debes proporcionar también una breve justificación o el diagnóstico diferencial que se busca explorar con dicha pregunta (campo 'rationale').
-   Evita preguntas genéricas. Enfócate en las preguntas más críticas que un médico haría para refinar su diagnóstico.
-   Las preguntas y justificaciones deben estar formuladas en español.
-   La salida debe seguir el esquema proporcionado (un array de objetos, cada uno con 'question' y 'rationale').

Texto Clínico:
{{{clinicalText}}}

Genera la lista de un máximo de 5 preguntas más importantes con su justificación:
`,
  });

  const {output} = await prompt(input);
  return output!;
}
