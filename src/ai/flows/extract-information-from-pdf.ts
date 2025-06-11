// src/ai/flows/extract-information-from-pdf.ts
'use server';
/**
 * @fileOverview Extracts information from a PDF document using AI.
 *
 * - extractInformationFromPdf - A function that handles the PDF information extraction process.
 * - ExtractInformationFromPdfInput - The input type for the extractInformationFromPdf function.
 * - ExtractInformationFromPdfOutput - The return type for the extractInformationFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInformationFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInformationFromPdfInput = z.infer<typeof ExtractInformationFromPdfInputSchema>;

const ExtractInformationFromPdfOutputSchema = z.object({
  structuredData: z.array(
    z.object({
      key: z.string().describe('The key of the data.'),
      value: z.string().describe('The value of the data.'),
    })
  ).describe('Structured data extracted from the PDF.'),
  clinicalNotes: z.string().describe('Clinical notes extracted from the PDF.'),
});
export type ExtractInformationFromPdfOutput = z.infer<typeof ExtractInformationFromPdfOutputSchema>;

export async function extractInformationFromPdf(input: ExtractInformationFromPdfInput): Promise<ExtractInformationFromPdfOutput> {
  return extractInformationFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInformationFromPdfPrompt',
  input: {schema: ExtractInformationFromPdfInputSchema},
  output: {schema: ExtractInformationFromPdfOutputSchema},
  prompt: `You are an expert medical document analyst.

You will extract structured data and clinical notes from the provided PDF document.

Use the following PDF document as the primary source of information:

{{media url=pdfDataUri}}

Output the structured data as an array of key-value pairs.
Output the clinical notes as a single string.

Make sure the output is in Spanish.

Here is an example of what the output should look like:

{
  "structuredData": [
    {
      "key": "Patient Name",
      "value": "John Doe"
    },
    {
      "key": "Date of Birth",
      "value": "01/01/1990"
    }
  ],
  "clinicalNotes": "The patient presented with a cough and fever. A chest X-ray was performed and showed signs of pneumonia."
}
`,
});

const extractInformationFromPdfFlow = ai.defineFlow(
  {
    name: 'extractInformationFromPdfFlow',
    inputSchema: ExtractInformationFromPdfInputSchema,
    outputSchema: ExtractInformationFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
