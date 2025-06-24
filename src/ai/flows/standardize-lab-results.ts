'use server';
/**
 * @fileOverview Standardizes raw lab results into two formats: abbreviated and full text.
 *
 * - standardizeLabResults - A function that handles the lab result standardization.
 * - StandardizeLabResultsInput - The input type for the standardizeLabResults function.
 * - StandardizeLabResultsOutput - The return type for the standardizeLabResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StandardizeLabResultsInputSchema = z.object({
  rawLabText: z.string().describe('Unstructured text containing various lab results.'),
});
export type StandardizeLabResultsInput = z.infer<typeof StandardizeLabResultsInputSchema>;

const StandardizeLabResultsOutputSchema = z.object({
  abbreviatedReport: z.string().describe('A standardized report using common medical abbreviations, suitable for quick handovers. Titled "PARA ENTREGA DE TURNO".'),
  fullReport: z.string().describe('A standardized report with full test names, suitable for official system records. Titled "PARA REPORTE EN SISTEMA".'),
});
export type StandardizeLabResultsOutput = z.infer<typeof StandardizeLabResultsOutputSchema>;

export async function standardizeLabResults(
  input: StandardizeLabResultsInput
): Promise<StandardizeLabResultsOutput> {
  return standardizeLabResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'standardizeLabResultsPrompt',
  input: {schema: StandardizeLabResultsInputSchema},
  output: {schema: StandardizeLabResultsOutputSchema},
  prompt: `Eres un experto en terminología de laboratorio clínico. Tu tarea es analizar el siguiente texto de paraclínicos y estandarizarlo en dos formatos distintos.

**Texto de Paraclínicos sin Procesar:**
{{{rawLabText}}}

**Instrucciones:**
1.  **Formato 1: "PARA ENTREGA DE TURNO" (con abreviaturas):**
    -   Genera un resumen de los paraclínicos usando abreviaturas médicas comunes.
    -   Agrupa los exámenes por categoría (Ej: Hemograma, Química, Perfil Hepático, etc.).
    -   Si detectas anemia (hemoglobina o hematocrito bajos), asegúrate de incluir VCM, HCM y ADE/RDW junto a los resultados del hemograma.
    -   El resultado debe ser un texto continuo, claro y conciso, ideal para una entrega de turno rápida.
    -   **Ejemplo de formato de salida para "PARA ENTREGA DE TURNO":**
        "Hemograma: Hb, Hto, Leu, Lin #, Neu #, Neu %, Plt. (Si hay anemia, se agregara, al lado de Hto los siguientes: VCM, HCM, ADE/RDW) - BUN, CREA - TGO, TGP, GGT, FA, BT, BD, BI, Alb - TPT, TP, INR - NA, K, CL, CA, MG - TSH, T3, T4, T3L, T4L, CORTISOL AM, CORTISOL PM - Uroanálisis: BACT, HB, ERI, ESTERASA, NITRITOS, MOCO, CEL EPIT."

2.  **Formato 2: "PARA REPORTE EN SISTEMA" (sin abreviaturas):**
    -   Genera un listado de los paraclínicos con sus nombres completos.
    -   Agrupa los exámenes por categoría, usando los nombres completos de las categorías (Ej: Hemograma Completo, Función Renal, Perfil Hepático).
    -   Cada examen debe estar en una nueva línea con su nombre completo.
    -   **Ejemplo de formato de salida para "PARA REPORTE EN SISTEMA":**
        "**Hemograma Completo:**
        - Hemoglobina
        - Hematocrito
        - Leucocitos Totales
        - Conteo Absoluto de Linfocitos
        - Conteo Absoluto de Neutrófilos
        - Porcentaje de Neutrófilos
        - Plaquetas
        - Volumen Corpuscular Medio (si aplica)
        - Hemoglobina Corpuscular Media (si aplica)
        - Ancho de Distribución Eritrocitaria (si aplica)
        **Función Renal:**
        - Nitrógeno Ureico en Sangre (BUN)
        - Creatinina
        ... y así sucesivamente con todos los demás paraclínicos identificados."

Genera ambos reportes según el esquema de salida proporcionado.
`,
});

const standardizeLabResultsFlow = ai.defineFlow(
  {
    name: 'standardizeLabResultsFlow',
    inputSchema: StandardizeLabResultsInputSchema,
    outputSchema: StandardizeLabResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
