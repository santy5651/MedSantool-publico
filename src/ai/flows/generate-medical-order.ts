
'use server';
/**
 * @fileOverview Generates general medical orders based on structured input.
 *
 * - generateMedicalOrder - A function that handles the medical order generation process.
 * - GenerateMedicalOrderInput - The input type for the generateMedicalOrder function.
 * - GenerateMedicalOrderOutput - The return type for the generateMedicalOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMedicalOrderInputSchema = z.object({
  orderType: z.enum(['OBSERVACIÓN', 'HOSPITALIZACIÓN', 'EGRESO']).describe('Tipo de orden médica.'),
  oxygen: z.string().default("NO REQUIERE OXÍGENO").describe('Requerimientos de oxígeno. Ejemplo: "Oxígeno por cánula nasal a 2 L/min" o "NO REQUIERE OXÍGENO".'),
  isolation: z.string().default("NO REQUIERE AISLAMIENTO").describe('Tipo de aislamiento. Ejemplo: "Aislamiento de contacto" o "NO REQUIERE AISLAMIENTO".'),
  diet: z.string().optional().describe('Dieta del paciente. Aplicable solo si orderType es HOSPITALIZACIÓN. Ejemplo: "Dieta absoluta", "Dieta líquida".'),
  medicationsInput: z.string().describe("Lista de medicamentos, uno por línea. Formato esperado: Nombre del medicamento, presentación y concentración, dosis, vía, frecuencia, duración opcional. Ejemplo: Acetaminofén, tabletas de 500 mg, administrar 1 gramo, vía oral, cada 8 horas."),
  medicationReconciliationInput: z.string().describe("Detalles de conciliación medicamentosa. Ejemplo: Losartán, tabletas de 50 mg, administrar 50 mg, via oral, cada día. Si no tiene, ingresar 'NO TIENE CONCILIACIÓN MEDICAMENTOSA'."),
  fallRisk: z.string().default("RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA").describe('Indicación sobre riesgo de caídas y lesiones por presión.'),
  paduaScale: z.string().describe("Puntaje en la escala de Padua. Ejemplo: '3 puntos', 'NO APLICA'."),
  surveillanceNursing: z.object({
    thermalCurve: z.boolean().describe("Vigilar curva térmica."),
    monitorPain: z.boolean().describe("Vigilar dolor."),
    monitorWounds: z.boolean().describe("Vigilar heridas."),
    monitorBleeding: z.boolean().describe("Vigilar sangrado."),
  }).describe('Indicaciones de vigilancia por enfermería.'),
  transferConditions: z.enum(['Grupo 1: Camillero o auxiliar', 'Grupo 2: Médico general', 'Grupo 3: Médico general por paciente intubado', 'NO APLICA']).describe('Condiciones de traslado del paciente.'),
  specialConsiderations: z.string().optional().describe("Notas o consideraciones especiales adicionales."),
});
export type GenerateMedicalOrderInput = z.infer<typeof GenerateMedicalOrderInputSchema>;

// Define a new type for the prompt's input, including the derived boolean flags
const PromptInputSchema = GenerateMedicalOrderInputSchema.extend({
  isHospitalizacionOrder: z.boolean(),
  requiresSpecialNursingSurveillance: z.boolean()
});
type PromptInput = z.infer<typeof PromptInputSchema>;


const GenerateMedicalOrderOutputSchema = z.object({
  generatedOrderText: z.string().describe('El texto completo de las órdenes médicas generales, formateado profesionalmente en español.'),
});
export type GenerateMedicalOrderOutput = z.infer<typeof GenerateMedicalOrderOutputSchema>;

export async function generateMedicalOrder(
  input: GenerateMedicalOrderInput
): Promise<GenerateMedicalOrderOutput> {
  return generateMedicalOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMedicalOrderPrompt',
  input: {schema: PromptInputSchema}, // Use the extended schema for the prompt
  output: {schema: GenerateMedicalOrderOutputSchema},
  prompt: `**ÓRDENES MÉDICAS GENERALES**
{{{orderType}}}
{{{oxygen}}}
{{{isolation}}}
{{#if isHospitalizacionOrder}}
{{#if diet}}{{{diet}}}{{else}}Dieta por definir{{/if}}
{{/if}}
{{#if medicationsInput}}
{{{medicationsInput}}}
{{else}}
NO REQUIERE MEDICAMENTOS
{{/if}}
**CONCILIACIÓN MEDICAMENTOSA**
{{#if medicationReconciliationInput}}
{{{medicationReconciliationInput}}}
{{else}}
NO TIENE CONCILIACIÓN MEDICAMENTOSA
{{/if}}
{{{fallRisk}}}
ESCALA DE PADUA: {{{paduaScale}}}
Vigilar signos vitales
Avisar cambios
{{#if surveillanceNursing.thermalCurve}}- Curva térmica{{/if}}
{{#if surveillanceNursing.monitorPain}}- Vigilar dolor{{/if}}
{{#if surveillanceNursing.monitorWounds}}- Vigilar heridas{{/if}}
{{#if surveillanceNursing.monitorBleeding}}- Vigilar sangrado{{/if}}
{{#unless requiresSpecialNursingSurveillance}}NO REQUIERE VIGILANCIA ESPECIAL POR ENFERMERÍA{{/unless}}
CONDICIONES DE TRASLADO: {{{transferConditions}}}
CONSIDERACIONES ESPECIALES:
{{#if specialConsiderations}}{{{specialConsiderations}}}{{else}}NO HAY CONSIDERACIONES ESPECIALES{{/if}}
`,
});

const generateMedicalOrderFlow = ai.defineFlow(
  {
    name: 'generateMedicalOrderFlow',
    inputSchema: GenerateMedicalOrderInputSchema, // External flow input remains the same
    outputSchema: GenerateMedicalOrderOutputSchema,
  },
  async (input) => {
    // Create the input for the prompt, including the derived boolean flags
    const promptData: PromptInput = {
      ...input,
      isHospitalizacionOrder: input.orderType === "HOSPITALIZACIÓN",
      requiresSpecialNursingSurveillance: input.surveillanceNursing.thermalCurve || 
                                          input.surveillanceNursing.monitorPain || 
                                          input.surveillanceNursing.monitorWounds || 
                                          input.surveillanceNursing.monitorBleeding,
    };
    
    const {output} = await prompt(promptData);
    return output!;
  }
);

