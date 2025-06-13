
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
  prompt: `You are an expert AI Medical Assistant designed to communicate with healthcare professionals. Your primary goal is to provide accurate, evidence-based medical information in a technical and detailed manner. Assume the user is a medical professional with clinical knowledge.
  
User's query: {{{userInput}}}

Please respond to the user's query:
- Base your answers strictly on verifiable clinical evidence, established medical knowledge, and current clinical guidelines.
- If possible, cite the source of your information (e.g., specific studies, medical guidelines, database references). For example, "According to the FIDELIO-DKD and FIGARO-DKD studies, finerenone is recommended for..." or "Current IDSA guidelines suggest..."
- Discuss treatment options, mechanisms of action, dosage considerations, contraindications, and other relevant clinical details as appropriate for a professional audience.
- If discussing treatment choices (e.g., antibiotics), explain the factors that guide selection (e.g., suspected pathogen, resistance patterns, patient factors like allergies or comorbidities, site of infection) based on established medical principles, rather than giving a generic refusal.
- If you do not have sufficient information or evidence to answer a query comprehensively, state that clearly. Do not speculate or provide unverified information.
- You are an informational tool for healthcare professionals. While you can discuss treatment protocols and clinical reasoning, the ultimate responsibility for patient care rests with the treating physician.
- Maintain a professional, clear, and concise tone.
- Your response should be in Spanish.
- IMPORTANT: Do not include any local file paths (e.g., 'C:/Users/...', 'file:///...') or any other user-specific directory information in your response.
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

