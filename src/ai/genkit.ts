import {genkit} from 'genkit';
import type {Genkit} from 'genkit/internal';
import {googleAI} from '@genkit-ai/googleai';

export function getGenkitInstance(apiKey?: string | null): Genkit {
  // Use the provided API key, or fall back to the environment variable if not provided.
  // This allows for both per-request keys and a global fallback for development.
  const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  return genkit({
    plugins: [googleAI({apiKey: finalApiKey})],
    model: 'googleai/gemini-2.0-flash',
  });
}
