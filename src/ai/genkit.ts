import {genkit} from 'genkit';
import type {Genkit} from 'genkit/internal';
import {googleAI} from '@genkit-ai/googleai';

export function getGenkitInstance(apiKey?: string | null): Genkit {
  // Use ONLY the provided API key from the client.
  // This ensures no fallback to environment variables, preventing accidental key leaks.
  const finalApiKey = apiKey;

  return genkit({
    plugins: [googleAI({apiKey: finalApiKey})],
    model: 'googleai/gemini-2.0-flash',
  });
}
