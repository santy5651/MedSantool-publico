
'use server';
/**
 * @fileOverview Medical writing improvement AI agent.
 *
 * - improveMedicalWriting - A function that handles the improvement and expansion of clinical text.
 * - ImproveMedicalWritingInput - The input type for the improveMedicalWriting function.
 * - ImproveMedicalWritingOutput - The return type for the improveMedicalWriting function.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveMedicalWritingInputSchema = z.object({
  clinicalText: z
    .string()
    .describe('Clinical text to be improved and expanded.'),
});

const ImproveMedicalWritingInputWithKeySchema =
  ImproveMedicalWritingInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type ImproveMedicalWritingInput = z.infer<
  typeof ImproveMedicalWritingInputSchema
>;
export type ImproveMedicalWritingInputWithKey = z.infer<
  typeof ImproveMedicalWritingInputWithKeySchema
>;

const ImproveMedicalWritingOutputSchema = z.object({
  improvedText: z
    .string()
    .describe('The improved and expanded medical text in Spanish.'),
});
export type ImproveMedicalWritingOutput = z.infer<
  typeof ImproveMedicalWritingOutputSchema
>;

export async function improveMedicalWriting(
  input: ImproveMedicalWritingInputWithKey
): Promise<ImproveMedicalWritingOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `improveMedicalWritingPrompt_${Date.now()}`,
    input: {schema: ImproveMedicalWritingInputSchema},
    output: {schema: ImproveMedicalWritingOutputSchema},
    prompt: `Eres un asistente experto en redacción médica. Tu tarea es tomar el siguiente texto clínico, que puede ser una idea, una nota breve o un borrador, y mejorarlo significativamente.
  Debes ampliarlo, corregir la gramática y la ortografía, y reescribirlo para que siga un estilo de redacción médica profesional, claro y formal.
  Además, estructura el texto de una manera lógica y coherente, similar a una sección de "Enfermedad Actual" en una historia clínica, organizando la información de forma cronológica o por sistemas si es apropiado.
  La salida debe estar en español.

  Texto a mejorar: {{{clinicalText}}}
  `,
  });

  const {output} = await prompt(input);
  return output!;
}
