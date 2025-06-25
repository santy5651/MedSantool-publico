
'use server';
/**
 * @fileOverview A medical assistant chatbot flow.
 *
 * - medicalAssistantChatFlow - A function that handles the chat interaction.
 * - MedicalAssistantChatInput - The input type for the medicalAssistantChatFlow function.
 * - MedicalAssistantChatOutput - The return type for the medicalAssistantChatFlow function.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

// Define la estructura de un mensaje individual en el historial para el flujo
const ChatMessageHistoryItemSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
  isUser: z.boolean().optional().describe('True if the sender is the user.'),
  isAI: z.boolean().optional().describe('True if the sender is the AI assistant.'),
});
export type ChatMessageHistoryItem = z.infer<typeof ChatMessageHistoryItemSchema>;

const MedicalAssistantChatInputSchema = z.object({
  userInput: z
    .string()
    .describe("The user's current message to the medical assistant."),
  chatHistory: z
    .array(ChatMessageHistoryItemSchema)
    .optional()
    .describe(
      'The history of the conversation so far, with flags for sender type.'
    ),
});

const MedicalAssistantChatInputWithKeySchema =
  MedicalAssistantChatInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type MedicalAssistantChatInput = z.infer<
  typeof MedicalAssistantChatInputSchema
>;
export type MedicalAssistantChatInputWithKey = z.infer<
  typeof MedicalAssistantChatInputWithKeySchema
>;

const MedicalAssistantChatOutputSchema = z.object({
  assistantResponse: z
    .string()
    .describe("The medical assistant's response to the user."),
});
export type MedicalAssistantChatOutput = z.infer<
  typeof MedicalAssistantChatOutputSchema
>;

export async function medicalAssistantChatFlow(
  input: MedicalAssistantChatInputWithKey
): Promise<MedicalAssistantChatOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const medicalAssistantChatPrompt = ai.definePrompt({
    name: `medicalAssistantChatPrompt_${Date.now()}`,
    input: {schema: MedicalAssistantChatInputSchema},
    output: {schema: MedicalAssistantChatOutputSchema},
    prompt: `You are an expert AI Medical Assistant designed to communicate with healthcare professionals. Your primary goal is to provide accurate, evidence-based medical information in a technical and detailed manner. Assume the user is a medical professional with clinical knowledge.

{{#if chatHistory.length}}
This is the conversation history so far:
{{#each chatHistory}}
{{#if this.isUser}}User: {{{this.text}}}{{/if}}
{{#if this.isAI}}Assistant: {{{this.text}}}{{/if}}
{{/each}}
---
Based on the history above, respond to the following:
{{/if}}

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

  const {output} = await medicalAssistantChatPrompt(input);
  return output!;
}
