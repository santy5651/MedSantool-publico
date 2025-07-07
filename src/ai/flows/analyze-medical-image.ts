
'use server';

/**
 * @fileOverview Analyzes medical radiographs to identify potential anomalies, generate a summary of findings, and provide a detailed reading in Spanish.
 *
 * - analyzeMedicalImage - A function that handles the medical image analysis process.
 * - AnalyzeMedicalImageInput - The input type for the analyzeMedicalImage function.
 * - AnalyzeMedicalImageOutput - The return type for the analyzeMedicalImage function.
 */
import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMedicalImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A medical radiograph as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const AnalyzeMedicalImageInputWithKeySchema = AnalyzeMedicalImageInputSchema.extend({
  apiKey: z.string().optional().describe('User provided Google AI API key.'),
});

export type AnalyzeMedicalImageInput = z.infer<
  typeof AnalyzeMedicalImageInputSchema
>;
export type AnalyzeMedicalImageInputWithKey = z.infer<
  typeof AnalyzeMedicalImageInputWithKeySchema
>;

const AnalyzeMedicalImageOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the key findings in Spanish.'),
  radiologistReading: z
    .string()
    .describe(
      'A detailed reading of the radiograph in Spanish, similar to a formal radiological report.'
    ),
});
export type AnalyzeMedicalImageOutput = z.infer<
  typeof AnalyzeMedicalImageOutputSchema
>;

export async function analyzeMedicalImage(
  input: AnalyzeMedicalImageInputWithKey
): Promise<AnalyzeMedicalImageOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `analyzeMedicalImagePrompt_${Date.now()}`,
    input: {schema: AnalyzeMedicalImageInputSchema},
    output: {schema: AnalyzeMedicalImageOutputSchema},
    prompt: `You are an expert radiologist. Your task is to analyze the provided X-ray.

Your analysis must include two parts:
1.  A **concise summary of key findings** in Spanish.
2.  A **detailed interpretation** of the image, similar to a formal radiology report, also in Spanish.

Image: {{media url=photoDataUri}}

Please structure your response according to the output format, making sure to complete both fields: 'summary' and 'radiologistReading'.
`,
  });

  const {output} = await prompt(input);
  return output!;
}
