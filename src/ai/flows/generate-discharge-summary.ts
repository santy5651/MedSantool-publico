
'use server';
/**
 * @fileOverview Generates a structured discharge summary.
 *
 * - generateDischargeSummary - A function that handles the discharge summary generation.
 * - GenerateDischargeSummaryInput - The input type for the generateDischargeSummary function.
 * - GenerateDischargeSummaryOutput - The return type for the generateDischargeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDischargeSummaryInputSchema = z.object({
  formulaMedica: z.string().optional().describe('Medications for discharge. Example: "ACETAMINOFEN, TABLETAS DE 500 MG, TOMAR 2 TABLETAS, CADA 8 HORAS, POR 10 DIAS". AI should correct typos and format.'),
  conciliacionMedicamentosa: z.string().optional().describe('Medication reconciliation. Example: "LOSARTAN, TABLETAS 50MG, 1 TABLETA VO CADA DIA". AI should correct typos and format.'),
  laboratoriosControl: z.string().optional().describe('Outpatient follow-up labs. If empty, default to "NO SE ENVIA LABORATORIOS DE CONTROL".'),
  proximoControl: z.string().optional().describe('Next medical follow-up. Example: "VALORACION Y SEGUIMIENTO POR CONSULTA EXTERNA CON: MEDICINA GENERAL, EN 10 DIAS".'),
  tramites: z.string().optional().describe('Relevant administrative procedures, typically EPS and type. Example: "NUEVA EPS SUBSIDIADO".'),
  incapacidad: z.string().optional().describe('Medical leave/disability days, if applicable.'),
  signosAlarma: z.string().optional().describe('Alarm signs for the patient. Can be auto-filled or manually entered.'),
  indicacionesDieta: z.string().optional().describe('Dietary indications. Can be auto-filled or manually entered.'),
  cuidadosGenerales: z.string().optional().describe('General care instructions. Can be auto-filled or manually entered.'),
  recomendacionesGenerales: z.string().optional().describe('General recommendations. Can be auto-filled or manually entered.'),
  condicionesSalida: z.string().optional().describe('General discharge conditions. AI should correct typos and improve wording.'),
});
export type GenerateDischargeSummaryInput = z.infer<typeof GenerateDischargeSummaryInputSchema>;

const GenerateDischargeSummaryOutputSchema = z.object({
  generatedSummary: z.string().describe('The fully formatted discharge summary text.'),
});
export type GenerateDischargeSummaryOutput = z.infer<typeof GenerateDischargeSummaryOutputSchema>;

export async function generateDischargeSummary(
  input: GenerateDischargeSummaryInput
): Promise<GenerateDischargeSummaryOutput> {
  return generateDischargeSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDischargeSummaryPrompt',
  input: {schema: GenerateDischargeSummaryInputSchema},
  output: {schema: GenerateDischargeSummaryOutputSchema},
  prompt: `Eres un asistente médico experto en la redacción de resúmenes de egreso hospitalario.
Tu tarea es generar un documento de SALIDA estructurado basado en la información proporcionada.
Aplica las siguientes reglas específicas:

1.  **Formato General:** Utiliza los encabezados exactos proporcionados (Ej: "*** FORMULA MEDICA ***").
2.  **Fórmula Médica:**
    *   Si se proporciona texto, revisa y corrige errores ortográficos.
    *   Reorganiza cada medicamento para que siga el formato: "NOMBRE DEL MEDICAMENTO, PRESENTACIÓN Y CONCENTRACIÓN, DOSIS/INSTRUCCIÓN, VÍA, FRECUENCIA, DURACIÓN (si aplica)".
    *   Lista cada medicamento en una nueva línea.
    *   Si no se proporciona, indica "NO SE FORMULA MEDICAMENTOS AL EGRESO".
3.  **Conciliación Medicamentosa:**
    *   Similar a la Fórmula Médica, revisa, corrige y formatea.
    *   Si no se proporciona, indica "NO TIENE MEDICAMENTOS DE CONCILIACIÓN".
4.  **Laboratorios de Control Ambulatorios:**
    *   Si el campo está vacío o no se proporciona, usa el texto por defecto: "NO SE ENVIA LABORATORIOS DE CONTROL".
    *   Si se proporciona texto, úsalo tal cual después de corregir ortografía.
5.  **Próximo Control Médico:**
    *   Usa el texto proporcionado, corrigiendo ortografía.
    *   Si no se proporciona, indica "CONTROL SEGÚN INDICACIONES DE SU EPS".
    *   Después de esta sección, SIEMPRE incluye la siguiente frase en una nueva línea: "ASISTIR A PROGRAMAS DE PROMOCION Y PREVENCION EN SU ENTIDAD DE PRIMER NIVEL EN CONSULTA EXTERNA, SEGUN PROGRAMAS DISPONIBLES Y BRINDADOS POR SU EPS."
6.  **Trámites Correspondientes:**
    *   Usa el texto proporcionado. Modifícalo para que siempre inicie con "EPS CORRESPONDIENTE: ". Ejemplo: "EPS CORRESPONDIENTE: NUEVA EPS SUBSIDIADO".
    *   Si no se proporciona, indica "TRÁMITES ADMINISTRATIVOS SEGÚN SU EPS".
7.  **Incapacidad:**
    *   Incluye esta sección y su contenido SOLO SI se proporciona texto en el campo 'incapacidad'. Si no hay texto, OMITE toda la sección "*** INCAPACIDAD ***".
8.  **Signos de Alarma, Indicaciones sobre la Dieta, Cuidados Generales, Recomendaciones Generales:**
    *   Usa el texto proporcionado para cada uno. Si un campo está vacío, indica "NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS." para esa sección particular. Estas secciones deben mantener el texto en MAYÚSCULAS si así viene del input.
9.  **Condiciones Generales de Salida:**
    *   Revisa y corrige errores de ortografía. Mejora ligeramente la redacción para asegurar claridad y profesionalismo.
    *   Si no se proporciona, indica "PACIENTE EN CONDICIONES GENERALES ESTABLES, ALERTA, CONSCIENTE, ORIENTADO, HIDRATADO, CON ADECUADA CLASE FUNCIONAL PARA EGRESO."

**Estructura de Salida EXACTA (incluyendo los asteriscos y saltos de línea como se muestran):**

****SALIDA****

*** FORMULA MEDICA ***
{{#if formulaMedica}}{{{formulaMedica}}}{{else}}NO SE FORMULA MEDICAMENTOS AL EGRESO{{/if}}

*** CONCILIACION MEDICAMENTOSA ***
{{#if conciliacionMedicamentosa}}{{{conciliacionMedicamentosa}}}{{else}}NO TIENE MEDICAMENTOS DE CONCILIACIÓN{{/if}}

*** SE SOLICTA LABORATORIOS DE CONTROL AMBULATORIOS ***
{{#if laboratoriosControl}}{{{laboratoriosControl}}}{{else}}NO SE ENVIA LABORATORIOS DE CONTROL{{/if}}

*** PRÓXIMO CONTROL MEDICO ***
{{#if proximoControl}}{{{proximoControl}}}{{else}}CONTROL SEGÚN INDICACIONES DE SU EPS{{/if}}
ASISTIR A PROGRAMAS DE PROMOCION Y PREVENCION EN SU ENTIDAD DE PRIMER NIVEL EN CONSULTA EXTERNA, SEGUN PROGRAMAS DISPONIBLES Y BRINDADOS POR SU EPS.

{{#if incapacidad}}
*** INCAPACIDAD ***
{{{incapacidad}}}
{{/if}}

*** SIGNOS DE ALARMA ***
{{#if signosAlarma}}{{{signosAlarma}}}{{else}}NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS.{{/if}}

*** INDICACIONES SOBRE LA DIETA ***
{{#if indicacionesDieta}}{{{indicacionesDieta}}}{{else}}NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS.{{/if}}

*** CUIDADOS GENERALES ***
{{#if cuidadosGenerales}}{{{cuidadosGenerales}}}{{else}}NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS.{{/if}}

***RECOMENDACIONES GENERALES***
{{#if recomendacionesGenerales}}{{{recomendacionesGenerales}}}{{else}}NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS.{{/if}}

*** CONDICIONES GENERALES DE SALIDA ***
{{#if condicionesSalida}}{{{condicionesSalida}}}{{else}}PACIENTE EN CONDICIONES GENERALES ESTABLES, ALERTA, CONSCIENTE, ORIENTADO, HIDRATADO, CON ADECUADA CLASE FUNCIONAL PARA EGRESO.{{/if}}

*** TRAMITES CORRESPONDIENTES ***
EPS CORRESPONDIENTE: {{#if tramites}}{{{tramites}}}{{else}}PENDIENTE POR DEFINIR/NO APLICA{{/if}}

Genera el resumen de egreso:
`,
});

const generateDischargeSummaryFlow = ai.defineFlow(
  {
    name: 'generateDischargeSummaryFlow',
    inputSchema: GenerateDischargeSummaryInputSchema,
    outputSchema: GenerateDischargeSummaryOutputSchema,
  },
  async (input) => {
    // Limpieza y preparación de datos antes de enviar al prompt
    const processedInput = { ...input };
    if (processedInput.laboratoriosControl && processedInput.laboratoriosControl.trim() === "") {
        processedInput.laboratoriosControl = undefined; // Para que el prompt use el default
    }
    // Otros pre-procesamientos si son necesarios

    const {output} = await prompt(processedInput);
    return output!;
  }
);
