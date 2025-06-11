'use server';
/**
 * @fileOverview Clinical text analysis AI agent.
 *
 * - summarizeClinicalNotes - A function that handles the summarization of clinical notes.
 * - SummarizeClinicalNotesInput - The input type for the summarizeClinicalNotes function.
 * - SummarizeClinicalNotesOutput - The return type for the summarizeClinicalNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClinicalNotesInputSchema = z.object({
  clinicalNotes: z.string().describe('Clinical notes and summaries to be analyzed.'),
});
export type SummarizeClinicalNotesInput = z.infer<
  typeof SummarizeClinicalNotesInputSchema
>;

const SummarizeClinicalNotesOutputSchema = z.object({
  summary: z.string().describe('Concise summary of key information in Spanish.'),
});
export type SummarizeClinicalNotesOutput = z.infer<
  typeof SummarizeClinicalNotesOutputSchema
>;

export async function summarizeClinicalNotes(
  input: SummarizeClinicalNotesInput
): Promise<SummarizeClinicalNotesOutput> {
  return summarizeClinicalNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClinicalNotesPrompt',
  input: {schema: SummarizeClinicalNotesInputSchema},
  output: {schema: SummarizeClinicalNotesOutputSchema},
  prompt: `You are an AI assistant expert in analyzing clinical notes and summaries.
  Your task is to provide a concise summary of the key information in Spanish from the provided clinical notes.

  Clinical Notes: {{{clinicalNotes}}} `,
});

const summarizeClinicalNotesFlow = ai.defineFlow(
  {
    name: 'summarizeClinicalNotesFlow',
    inputSchema: SummarizeClinicalNotesInputSchema,
    outputSchema: SummarizeClinicalNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
