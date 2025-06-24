'use server';
/**
 * @fileOverview Medical writing improvement AI agent.
 *
 * - improveMedicalWriting - A function that handles the improvement and expansion of clinical text.
 * - ImproveMedicalWritingInput - The input type for the improveMedicalWriting function.
 * - ImproveMedicalWritingOutput - The return type for the improveMedicalWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveMedicalWritingInputSchema = z.object({
  clinicalText: z.string().describe('Clinical text to be improved and expanded.'),
});
export type ImproveMedicalWritingInput = z.infer<
  typeof ImproveMedicalWritingInputSchema
>;

const ImproveMedicalWritingOutputSchema = z.object({
  improvedText: z.string().describe('The improved and expanded medical text in Spanish.'),
});
export type ImproveMedicalWritingOutput = z.infer<
  typeof ImproveMedicalWritingOutputSchema
>;

export async function improveMedicalWriting(
  input: ImproveMedicalWritingInput
): Promise<ImproveMedicalWritingOutput> {
  return improveMedicalWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveMedicalWritingPrompt',
  input: {schema: ImproveMedicalWritingInputSchema},
  output: {schema: ImproveMedicalWritingOutputSchema},
  prompt: `Eres un asistente experto en redacción médica. Tu tarea es tomar el siguiente texto clínico, que puede ser una idea, una nota breve o un borrador, y mejorarlo significativamente.
  Debes ampliarlo, corregir la gramática y la ortografía, y reescribirlo para que siga un estilo de redacción médica profesional, claro y formal.
  Además, estructura el texto de una manera lógica y coherente, similar a una sección de "Enfermedad Actual" en una historia clínica, organizando la información de forma cronológica o por sistemas si es apropiado.
  La salida debe estar en español.

  Texto a mejorar: {{{clinicalText}}}
  `,
});

const improveMedicalWritingFlow = ai.defineFlow(
  {
    name: 'improveMedicalWritingFlow',
    inputSchema: ImproveMedicalWritingInputSchema,
    outputSchema: ImproveMedicalWritingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
