
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
Tu tarea es generar un documento de SALIDA estructurado.
La estructura base y la información inicial (o valores por defecto si no se proporcionó información específica del campo) se muestran a continuación.
Debes seguir esta estructura EXACTA. Además, aplica las siguientes reglas específicas al contenido de cada sección según la información ya presente en la plantilla siguiente:

1.  **Formato General:** Utiliza los encabezados exactos proporcionados (Ej: "*** FORMULA MEDICA ***").
2.  **Fórmula Médica:** Si la plantilla muestra medicamentos en esta sección, revisa y corrige errores ortográficos. Reorganiza cada medicamento para que siga el formato: "NOMBRE DEL MEDICAMENTO, PRESENTACIÓN Y CONCENTRACIÓN, DOSIS/INSTRUCCIÓN, VÍA, FRECUENCIA, DURACIÓN (si aplica)". Lista cada medicamento en una nueva línea. Si la plantilla indica "NO SE FORMULA MEDICAMENTOS AL EGRESO", mantenlo así.
3.  **Conciliación Medicamentosa:** Similar a la Fórmula Médica. Si la plantilla indica "NO TIENE MEDICAMENTOS DE CONCILIACIÓN", mantenlo así.
4.  **Laboratorios de Control Ambulatorios:** Si la plantilla muestra laboratorios específicos, úsalos después de corregir ortografía. Si indica "NO SE ENVIA LABORATORIOS DE CONTROL", mantenlo.
5.  **Próximo Control Médico:** Si la plantilla muestra un control específico, úsalo corrigiendo ortografía. Si indica "CONTROL SEGÚN INDICACIONES DE SU EPS", mantenlo. Después de esta sección, SIEMPRE incluye la siguiente frase en una nueva línea: "ASISTIR A PROGRAMAS DE PROMOCION Y PREVENCION EN SU ENTIDAD DE PRIMER NIVEL EN CONSULTA EXTERNA, SEGUN PROGRAMAS DISPONIBLES Y BRINDADOS POR SU EPS."
6.  **Incapacidad:** Si la sección "*** INCAPACIDAD ***" y su contenido están presentes en la plantilla, inclúyelos. Si la sección está ausente en la plantilla (porque no se proporcionó incapacidad), no la agregues.
7.  **Signos de Alarma, Indicaciones sobre la Dieta, Cuidados Generales, Recomendaciones Generales:** Si la plantilla muestra contenido para estas secciones, úsalo. Estos deben estar en MAYÚSCULAS. Si la plantilla indica "NO SE PROPORCIONAN INDICACIONES ESPECÍFICAS." para alguna de estas secciones, mantenlo así para esa sección.
8.  **Condiciones Generales de Salida:** Si la plantilla muestra condiciones específicas, revísalas, corrige errores de ortografía y mejora ligeramente la redacción para asegurar claridad y profesionalismo. Si la plantilla indica "PACIENTE EN CONDICIONES GENERALES ESTABLES, ALERTA, CONSCIENTE, ORIENTADO, HIDRATADO, CON ADECUADA CLASE FUNCIONAL PARA EGRESO.", mantenlo.
9.  **Trámites Correspondientes:** Si la plantilla muestra "EPS CORRESPONDIENTE: [información EPS]", úsalo. Si indica "EPS CORRESPONDIENTE: PENDIENTE POR DEFINIR/NO APLICA", mantenlo así.

Asegúrate de que la salida final sea un único string para el campo 'generatedSummary', que contenga todo el resumen de egreso formateado como se describe y con las correcciones aplicadas.

**Esta es la estructura base y la información inicial para el resumen de egreso (revisa y aplica correcciones según las reglas anteriores):**

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
`,
});

const generateDischargeSummaryFlow = ai.defineFlow(
  {
    name: 'generateDischargeSummaryFlow',
    inputSchema: GenerateDischargeSummaryInputSchema,
    outputSchema: GenerateDischargeSummaryOutputSchema,
  },
  async (input) => {
    const processedInput: GenerateDischargeSummaryInput = {};
    for (const key in input) {
      const typedKey = key as keyof GenerateDischargeSummaryInput;
      if (typeof input[typedKey] === 'string') {
        const trimmedValue = (input[typedKey] as string).trim();
        if (trimmedValue === "" && typedKey !== 'laboratoriosControl') { // laboratoriosControl tiene su propio default si es vacío
          processedInput[typedKey] = undefined;
        } else if (trimmedValue === "" && typedKey === 'laboratoriosControl') {
          processedInput[typedKey] = undefined; // Para que use el default de Handlebars "NO SE ENVIA LABORATORIOS DE CONTROL"
        }
        else {
          processedInput[typedKey] = trimmedValue;
        }
      } else if (input[typedKey] !== null && input[typedKey] !== undefined) {
        processedInput[typedKey] = input[typedKey];
      }
    }
    
    // Asegurar que los campos que deben ser mayúsculas lo sean si tienen contenido
    const fieldsToUppercase: Array<keyof GenerateDischargeSummaryInput> = ['signosAlarma', 'indicacionesDieta', 'cuidadosGenerales', 'recomendacionesGenerales'];
    fieldsToUppercase.forEach(field => {
        if (processedInput[field] && typeof processedInput[field] === 'string') {
            processedInput[field] = (processedInput[field] as string).toUpperCase();
        }
    });


    const {output} = await prompt(processedInput);
    return output!;
  }
);
