
'use server';
/**
 * @fileOverview A medical assistant chatbot flow.
 *
 * - medicalAssistantChatFlow - A function that handles the chat interaction.
 * - MedicalAssistantChatInput - The input type for the medicalAssistantChatFlow function.
 * - MedicalAssistantChatOutput - The return type for the medicalAssistantChatFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalAssistantChatInputSchema = z.object({
  userInput: z.string().describe('The user\'s question or message to the medical assistant.'),
});
export type MedicalAssistantChatInput = z.infer<typeof MedicalAssistantChatInputSchema>;

const MedicalAssistantChatOutputSchema = z.object({
  assistantResponse: z.string().describe('The medical assistant\'s response to the user.'),
});
export type MedicalAssistantChatOutput = z.infer<typeof MedicalAssistantChatOutputSchema>;

export async function medicalAssistantChatFlow(
  input: MedicalAssistantChatInput
): Promise<MedicalAssistantChatOutput> {
  // In a real scenario, you might have more complex logic here,
  // like retrieving context from a database or calling other tools.
  const {output} = await medicalAssistantChatPrompt(input);
  return output!;
}

const medicalAssistantChatPrompt = ai.definePrompt({
  name: 'medicalAssistantChatPrompt',
  input: {schema: MedicalAssistantChatInputSchema},
  output: {schema: MedicalAssistantChatOutputSchema},
  prompt: `You are an expert AI Medical Assistant. Your primary goal is to provide accurate, evidence-based medical information.
  
User's query: {{{userInput}}}

Please respond to the user's query. 
- Base your answers strictly on verifiable clinical evidence and established medical knowledge.
- If possible, cite the source of your information (e.g., specific studies, medical guidelines). For example, "According to the FIDELIO-DKD and FIGARO-DKD studies, finerenone is recommended for..."
- If you do not have sufficient information or evidence to answer a query, state that clearly. Do not speculate or provide unverified information.
- You are not a substitute for a real doctor. Do not provide direct medical diagnoses or treatment plans. You can provide information about conditions or treatments based on evidence.
- Maintain a professional, clear, and concise tone.
- Your response should be in Spanish.
`,
});

// The flow is defined but not directly exported as the wrapper function is preferred.
const flow = ai.defineFlow(
  {
    name: 'medicalAssistantChatFlow', // This name is used for internal Genkit registration
    inputSchema: MedicalAssistantChatInputSchema,
    outputSchema: MedicalAssistantChatOutputSchema,
  },
  async (input) => {
    // This internal flow calls the prompt directly.
    // We could add more logic here if needed before or after the prompt.
    const {output} = await medicalAssistantChatPrompt(input);
    return output!;
  }
);
