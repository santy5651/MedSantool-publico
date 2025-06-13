
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-clinical-notes.ts';
import '@/ai/flows/extract-information-from-pdf.ts';
import '@/ai/flows/suggest-diagnosis.ts';
import '@/ai/flows/analyze-medical-image.ts';
import '@/ai/flows/generate-medical-order.ts';
import '@/ai/flows/generate-clinical-analysis.ts';
import '@/ai/flows/suggest-treatment-plan.ts';
import '@/ai/flows/generate-patient-advice.ts';
import '@/ai/flows/generate-medical-justification.ts';
import '@/ai/flows/medical-assistant-chat-flow.ts'; // Added import

