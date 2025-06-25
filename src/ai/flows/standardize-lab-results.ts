
'use server';
/**
 * @fileOverview Standardizes raw lab results into two formats: abbreviated and full text.
 *
 * - standardizeLabResults - A function that handles the lab result standardization.
 * - StandardizeLabResultsInput - The input type for the standardizeLabResults function.
 * - StandardizeLabResultsOutput - The return type for the standardizeLabResults function.
 */

import {getGenkitInstance} from '@/ai/genkit';
import {z} from 'genkit';

const StandardizeLabResultsInputSchema = z.object({
  rawLabText: z
    .string()
    .describe('Unstructured text containing various lab results.'),
});

const StandardizeLabResultsInputWithKeySchema =
  StandardizeLabResultsInputSchema.extend({
    apiKey: z.string().optional().describe('User provided Google AI API key.'),
  });

export type StandardizeLabResultsInput = z.infer<
  typeof StandardizeLabResultsInputSchema
>;
export type StandardizeLabResultsInputWithKey = z.infer<
  typeof StandardizeLabResultsInputWithKeySchema
>;

const StandardizeLabResultsOutputSchema = z.object({
  abbreviatedReport: z
    .string()
    .describe(
      'A standardized report using common medical abbreviations, suitable for quick handovers. Titled "PARA ENTREGA DE TURNO".'
    ),
  fullReport: z
    .string()
    .describe(
      'A standardized report with full test names, suitable for official system records. Titled "PARA REPORTE EN SISTEMA".'
    ),
});
export type StandardizeLabResultsOutput = z.infer<
  typeof StandardizeLabResultsOutputSchema
>;

export async function standardizeLabResults(
  input: StandardizeLabResultsInputWithKey
): Promise<StandardizeLabResultsOutput> {
  const ai = getGenkitInstance(input.apiKey);

  const prompt = ai.definePrompt({
    name: `standardizeLabResultsPrompt_${Date.now()}`,
    input: {schema: StandardizeLabResultsInputSchema},
    output: {schema: StandardizeLabResultsOutputSchema},
    prompt: `Eres un experto en terminología de laboratorio clínico. Tu tarea es analizar el siguiente texto de paraclínicos y estandarizarlo en dos formatos distintos.

**Texto de Paraclínicos sin Procesar:**
{{{rawLabText}}}

**Instrucciones:**
1.  **Formato 1: "PARA ENTREGA DE TURNO" (con abreviaturas):**
    -   Genera un resumen de los paraclínicos usando abreviaturas médicas comunes. **No incluyas las unidades, solo las abreviaturas y sus valores.**
    -   Agrupa los exámenes por categoría (Ej: Hemograma, Química, Perfil Hepático, etc.).
    -   Si detectas anemia (hemoglobina o hematocrito bajos), asegúrate de incluir VCM, HCM y ADE/RDW junto a los resultados del hemograma.
    -   Si detectas gases arteriales, usa el formato: "- GASES ARTERIALES: pH, PCO2, PO2, HCO3, LACT, PAFI".
    -   Si encuentras paraclínicos que no encajan en las categorías comunes del ejemplo, agrégalos al final del reporte, usando su nombre completo y valor, sin unidades. Por ejemplo, si el texto de entrada contiene "CREATININA EN ORINA PARCIAL 189.7", debes agregar al reporte "- CREATININA EN ORINA PARCIAL 189.7".
    -   El resultado debe ser un texto continuo, claro y conciso, ideal para una entrega de turno rápida.
    -   **Ejemplo de formato de salida para "PARA ENTREGA DE TURNO":**
        "Hemograma: Hb, Hto, Leu, Lin #, Neu #, Neu %, Plt. (Si hay anemia, se agregara, al lado de Hto los siguientes: VCM, HCM, ADE/RDW) - PCT, PCR - BUN, CREA - TGO, TGP, GGT, FA, BT, BD, BI, Alb, AMIL, LIPAS - TPT, TP, INR - NA, K, CL, CA, MG - TSH, T3, T4, T3L, T4L, CORTISOL AM, CORTISOL PM - GASES ARTERIALES: pH, PCO2, PO2, HCO3, LACT, PAFI - Uroanálisis: BACT, HB, ERI, ESTERASA, NITRITOS, MOCO, CEL EPIT."

2.  **Formato 2: "PARA REPORTE EN SISTEMA" (sin abreviaturas):**
    -   Genera un reporte de los paraclínicos con sus nombres completos y valores, agrupados por categoría.
    -   Cada categoría debe comenzar en una **nueva línea**, con el nombre de la categoría en negrita (usando asteriscos, ej: \`**Hemograma Completo**\`).
    -   Todos los resultados dentro de una misma categoría deben ir en la **misma línea** que el título de la categoría, separados por comas.
    -   Si encuentras paraclínicos que no encajan en las categorías comunes del ejemplo, agrégalos en una nueva categoría llamada \`**Otros**\`, cada uno con su nombre completo y valor. Por ejemplo: \`**Otros:** Creatinina en Orina Parcial 189.7 mg/dL\`.
    -   **Ejemplo de formato de salida para "PARA REPORTE EN SISTEMA" (asegúrate de que cada categoría empiece en una línea nueva):**
        **Hemograma Completo:** Hemoglobina 15.70, Hematocrito 47.50, Leucocitos 18.58, Linfocitos # 0.30, Neutrófilos # 17.42, Neutrófilos % 93.8, Plaquetas 283.00, Volumen Corpuscular Medio 80.30, Hemoglobina Corpuscular Media 26.70, Ancho de Distribución Eritrocitaria 13.90
        **Química Sanguínea:** Glicemia 111, Nitrógeno Ureico: 8.0, Creatinina en Suero: 0.70
        **Electrolitos:** Sodio 127, Potasio: 2.6, Cloro: 86, Calcio: 9.4

Genera ambos reportes según el esquema de salida proporcionado.
`,
  });

  const {output} = await prompt(input);
  return output!;
}
