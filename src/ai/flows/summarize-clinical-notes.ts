
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
    prompt: `You are an expert assistant in medical writing. Your task is to take the following clinical text—which may be an idea, a brief note, or a draft—and significantly improve it.
You must expand it, correct grammar and spelling, and rewrite it to follow a professional, clear, and formal medical writing style.
Additionally, structure the text in a logical and coherent manner, similar to a "History of present illness" section in a medical history, organizing the information chronologically or by systems if appropriate.
The output must be in Spanish.

  Text to improve: {{{clinicalText}}}
  `,
  });

  const {output} = await prompt(input);
  return output!;
}
