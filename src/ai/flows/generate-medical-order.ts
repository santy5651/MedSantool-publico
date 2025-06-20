
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
  specialtyFollowUp: z.string().optional().describe('Especialidad médica que realizará el seguimiento durante la hospitalización. Ejemplo: "Cardiología", "Medicina Interna".'),
  fallRisk: z.string().default("RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA").describe('Indicación sobre riesgo de caídas y lesiones por presión.'),
  paduaScale: z.string().describe("Puntaje en la escala de Padua. Ejemplo: '3 puntos', 'NO APLICA'."),
  surveillanceNursing: z.object({
    monitorWounds: z.boolean().describe("Vigilar heridas."),
    monitorBleeding: z.boolean().describe("Vigilar sangrado."),
    monitorPain: z.boolean().describe("Vigilar dolor."),
    vigilarDiuresis: z.boolean().describe("Vigilar diuresis."),
    cuidadosCateterVenoso: z.boolean().describe("Cuidados de catéter venoso."),
    cuidadosSondaVesical: z.boolean().describe("Cuidados de sonda vesical."),
    cuidadosDrenajesQuirurgicos: z.boolean().describe("Cuidados de drenajes quirúrgicos."),
    cuidadosTraqueostomia: z.boolean().describe("Cuidados de traqueostomía."),
    controlGlicemicoTurno: z.boolean().describe("Control glicémico por turno."),
    controlGlicemicoAyunas: z.boolean().describe("Control glicémico en ayunas."),
    thermalCurve: z.boolean().describe("Curva térmica."),
    hojaNeurologica: z.boolean().describe("Hoja neurológica."),
    realizarCuraciones: z.boolean().describe("Realizar curaciones y cuidados de heridas."),
    restriccionHidrica800: z.boolean().describe("Restricción hídrica a 800 cc/24 horas."),
    controlLiquidosAdminElim: z.boolean().describe("Control de líquidos administrados y eliminados."),
    registroBalanceHidrico24h: z.boolean().describe("Registro de balance hídrico de 24 horas."),
    calcularDiuresisHoraria: z.boolean().describe("Calcular diuresis horaria."),
    pesoDiario: z.boolean().describe("Peso diario."),
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
  generatedOrderText: z.string().describe('El texto completo de las órdenes médicas generales, formateado profesionalmente en español, con correcciones de redacción aplicadas y EN MAYÚSCULAS, incluyendo los asteriscos en los títulos principales.'),
});
export type GenerateMedicalOrderOutput = z.infer<typeof GenerateMedicalOrderOutputSchema>;

export async function generateMedicalOrder(
  input: GenerateMedicalOrderInput
): Promise<GenerateMedicalOrderOutput> {
  return generateMedicalOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMedicalOrderPrompt',
  input: {schema: PromptInputSchema}, 
  output: {schema: GenerateMedicalOrderOutputSchema},
  prompt: `Eres un asistente médico experto en la redacción de órdenes médicas hospitalarias.
Tu tarea es generar un texto de orden médica profesional, claro y completo basado en la información proporcionada.
**Importante: Revisa y corrige cualquier error de redacción o tipográfico evidente en los campos de texto libre, especialmente en la lista de medicamentos (nombres, presentaciones, dosis, vías, frecuencias) y en la conciliación medicamentosa. Asegúrate de mantener la intención original y no alterar significativamente la información médica. Por ejemplo, si se escribe "acetaifofen", corrígelo a "acetaminofén".**

Genera la orden médica utilizando la siguiente estructura exacta, incluyendo los asteriscos literales en los títulos principales (**ÓRDENES MÉDICAS GENERALES** y **CONCILIACIÓN MEDICAMENTOSA**):

**ÓRDENES MÉDICAS GENERALES**
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
{{#if isHospitalizacionOrder}}
{{#if specialtyFollowUp}}
SEGUIMIENTO POR ESPECIALIDAD: {{{specialtyFollowUp}}}
{{/if}}
{{/if}}
{{{fallRisk}}}
ESCALA DE PADUA: {{{paduaScale}}}
Vigilar signos vitales
Avisar cambios{{#if requiresSpecialNursingSurveillance}}
{{#if surveillanceNursing.thermalCurve}}\n- Curva térmica{{/if}}
{{#if surveillanceNursing.monitorPain}}\n- Vigilar dolor{{/if}}
{{#if surveillanceNursing.monitorWounds}}\n- Vigilar heridas{{/if}}
{{#if surveillanceNursing.monitorBleeding}}\n- Vigilar sangrado{{/if}}
{{#if surveillanceNursing.vigilarDiuresis}}\n- Vigilar diuresis y características de la orina{{/if}}
{{#if surveillanceNursing.cuidadosCateterVenoso}}\n- Cuidados de catéter venoso central/periférico según protocolo institucional{{/if}}
{{#if surveillanceNursing.cuidadosSondaVesical}}\n- Cuidados de sonda vesical según protocolo institucional y vigilar diuresis horaria si indicado{{/if}}
{{#if surveillanceNursing.cuidadosDrenajesQuirurgicos}}\n- Cuidados de drenajes quirúrgicos, cuantificar y describir débito{{/if}}
{{#if surveillanceNursing.cuidadosTraqueostomia}}\n- Cuidados de traqueostomía según protocolo institucional{{/if}}
{{#if surveillanceNursing.controlGlicemicoTurno}}\n- Glucometría por turno{{/if}}
{{#if surveillanceNursing.controlGlicemicoAyunas}}\n- Glucometría en ayunas{{/if}}
{{#if surveillanceNursing.hojaNeurologica}}\n- Diligenciar hoja neurológica según pauta (ej. cada hora, cada 2 horas){{/if}}
{{#if surveillanceNursing.realizarCuraciones}}\n- Realizar curaciones y cuidados de heridas según necesidad e indicación médica{{/if}}
{{#if surveillanceNursing.restriccionHidrica800}}\n- Restricción hídrica a 800 cc en 24 horas (distribuir por turno){{/if}}
{{#if surveillanceNursing.controlLiquidosAdminElim}}\n- Control estricto de líquidos administrados y eliminados por turno{{/if}}
{{#if surveillanceNursing.registroBalanceHidrico24h}}\n- Registro de balance hídrico cada 24 horas{{/if}}
{{#if surveillanceNursing.calcularDiuresisHoraria}}\n- Calcular gasto urinario horario{{/if}}
{{#if surveillanceNursing.pesoDiario}}\n- Peso diario en ayunas con báscula calibrada{{/if}}
{{/if}}
\nCONSIDERACIONES ESPECIALES:
{{#if specialConsiderations}}{{{specialConsiderations}}}{{else}}NO HAY CONSIDERACIONES ESPECIALES{{/if}}
\nCONDICIONES DE TRASLADO: {{{transferConditions}}}

**IMPORTANTE: TODO EL TEXTO DE SALIDA DEBE ESTAR EN LETRAS MAYÚSCULAS.**
`,
});

const generateMedicalOrderFlow = ai.defineFlow(
  {
    name: 'generateMedicalOrderFlow',
    inputSchema: GenerateMedicalOrderInputSchema, 
    outputSchema: GenerateMedicalOrderOutputSchema,
  },
  async (input) => {
    // Create the input for the prompt, including the derived boolean flags
    const promptData: PromptInput = {
      ...input,
      isHospitalizacionOrder: input.orderType === "HOSPITALIZACIÓN",
      requiresSpecialNursingSurveillance: 
        input.surveillanceNursing.thermalCurve || 
        input.surveillanceNursing.monitorPain || 
        input.surveillanceNursing.monitorWounds || 
        input.surveillanceNursing.monitorBleeding ||
        input.surveillanceNursing.vigilarDiuresis ||
        input.surveillanceNursing.cuidadosCateterVenoso ||
        input.surveillanceNursing.cuidadosSondaVesical ||
        input.surveillanceNursing.cuidadosDrenajesQuirurgicos ||
        input.surveillanceNursing.cuidadosTraqueostomia ||
        input.surveillanceNursing.controlGlicemicoTurno ||
        input.surveillanceNursing.controlGlicemicoAyunas ||
        input.surveillanceNursing.hojaNeurologica ||
        input.surveillanceNursing.realizarCuraciones ||
        input.surveillanceNursing.restriccionHidrica800 ||
        input.surveillanceNursing.controlLiquidosAdminElim ||
        input.surveillanceNursing.registroBalanceHidrico24h ||
        input.surveillanceNursing.calcularDiuresisHoraria ||
        input.surveillanceNursing.pesoDiario,
    };
    
    const {output} = await prompt(promptData);
    return output!;
  }
);

