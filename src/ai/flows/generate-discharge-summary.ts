
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
  proximoControl: z.string().optional().describe('Next medical follow-up. Example: "VALORACION Y SEGUIMIENTO POR CONSULTA EXTERNA CON: MEDICINA GENERAL, EN 10 DIAS". AI should improve phrasing if short input like "ORTOPEDIA 30 DIAS" is given.'),
  tramites: z.string().optional().describe('Relevant administrative procedures, typically EPS and type. Example: "NUEVA EPS SUBSIDIADO".'),
  incapacidad: z.string().optional().describe('Medical leave/disability days, if applicable. This field should be ignored if "tramites" indicates a subsidized EPS.'),
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
5.  **Próximo Control Médico:** Si la plantilla muestra información para 'Próximo Control Médico', **mejora la redacción para que sea más formal y completa, siguiendo un formato como 'VALORACION Y SEGUIMIENTO POR CONSULTA EXTERNA CON: [ESPECIALIDAD], EN [TIEMPO]'**, basándote en la intención del texto proporcionado. Corrige también errores ortográficos. Si la plantilla indica 'CONTROL SEGÚN INDICACIONES DE SU EPS', mantenlo. Después de esta sección, SIEMPRE incluye la siguiente frase en una nueva línea: "ASISTIR A PROGRAMAS DE PROMOCION Y PREVENCION EN SU ENTIDAD DE PRIMER NIVEL EN CONSULTA EXTERNA, SEGUN PROGRAMAS DISPONIBLES Y BRINDADOS POR SU EPS."
6.  **Incapacidad:** Si la sección "*** INCAPACIDAD ***" y su contenido están presentes en la plantilla (porque no es EPS subsidiado y se proporcionó incapacidad), inclúyelos. Si la sección está ausente en la plantilla (porque no se proporcionó incapacidad o porque la EPS es subsidiada), no la agregues.
7.  **Signos de Alarma, Indicaciones sobre la Dieta, Cuidados Generales, Recomendaciones Generales:** Si la plantilla muestra contenido para estas secciones (que ya debe incluir un título con emoji), úsalo. TODO EL CONTENIDO DE ESTAS SECCIONES DEBE ESTAR EN MAYÚSCULAS (la IA debe asegurar esto si no lo está ya). Si la plantilla indica (en el 'else' de la lógica Handlebars que se muestra abajo) que no hay información específica, usa el texto por defecto proporcionado en ese 'else' (que ya incluye el título con emoji y la indicación).
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

{{#if signosAlarma}}
{{{signosAlarma}}}
{{else}}
⚠️ ***SIGNOS DE ALARMA***
CONSULTE CON SU MÉDICO ANTE CUALQUIER SÍNTOMA NUEVO O EMPEORAMIENTO DE SU CONDICIÓN ACTUAL.
{{/if}}

{{#if indicacionesDieta}}
{{{indicacionesDieta}}}
{{else}}
🍽️ ***INDICACIONES SOBRE LA DIETA***
NO SE PUEDEN DAR INDICACIONES DIETÉTICAS ESPECÍFICAS SIN INFORMACIÓN DIAGNÓSTICA. CONSULTE A SU MÉDICO O NUTRICIONISTA.
{{/if}}

{{#if cuidadosGenerales}}
{{{cuidadosGenerales}}}
{{else}}
⚕️ ***CUIDADOS GENERALES***
ES IMPORTANTE SEGUIR LAS INDICACIONES GENERALES DE SU MÉDICO Y MANTENER UN ESTILO DE VIDA SALUDABLE. PARA CUIDADOS ESPECÍFICOS, CONSULTE A SU MÉDICO.
{{/if}}

{{#if recomendacionesGenerales}}
{{{recomendacionesGenerales}}}
{{else}}
***RECOMENDACIONES GENERALES***
NO SE HA PROPORCIONADO INFORMACIÓN DIAGNÓSTICA ESPECÍFICA (DIAGNÓSTICOS VALIDADOS O TEXTO MANUAL). ES FUNDAMENTAL CONSULTAR CON SU MÉDICO PARA RECIBIR INDICACIONES PERSONALIZADAS.
{{/if}}

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
        if (trimmedValue === "" && typedKey !== 'laboratoriosControl') { 
          processedInput[typedKey] = undefined;
        } else if (trimmedValue === "" && typedKey === 'laboratoriosControl') {
          processedInput[typedKey] = undefined; 
        }
        else {
          processedInput[typedKey] = trimmedValue;
        }
      } else if (input[typedKey] !== null && input[typedKey] !== undefined) {
        processedInput[typedKey] = input[typedKey];
      }
    }
    
    // Lógica para incapacidad basada en EPS subsidiado
    if (processedInput.tramites && processedInput.tramites.toLowerCase().includes('subsidiado')) {
      processedInput.incapacidad = undefined; // No mostrar incapacidad si es subsidiado
    }

    // Asegurar que los campos que deben ser mayúsculas lo sean si tienen contenido
    const fieldsToUppercase: Array<keyof GenerateDischargeSummaryInput> = ['signosAlarma', 'indicacionesDieta', 'cuidadosGenerales', 'recomendacionesGenerales'];
    fieldsToUppercase.forEach(field => {
        if (processedInput[field] && typeof processedInput[field] === 'string') {
            const defaultValueForSigns = "⚠️ ***SIGNOS DE ALARMA***\nCONSULTE CON SU MÉDICO ANTE CUALQUIER SÍNTOMA NUEVO O EMPEORAMIENTO DE SU CONDICIÓN ACTUAL.";
            const defaultValueForDiet = "🍽️ ***INDICACIONES SOBRE LA DIETA***\nNO SE PUEDEN DAR INDICACIONES DIETÉTICAS ESPECÍFICAS SIN INFORMACIÓN DIAGNÓSTICA. CONSULTE A SU MÉDICO O NUTRICIONISTA.";
            const defaultValueForCare = "⚕️ ***CUIDADOS GENERALES***\nES IMPORTANTE SEGUIR LAS INDICACIONES GENERALES DE SU MÉDICO Y MANTENER UN ESTILO DE VIDA SALUDABLE. PARA CUIDADOS ESPECÍFICOS, CONSULTE A SU MÉDICO.";
            const defaultValueForRecs = "***RECOMENDACIONES GENERALES***\nNO SE HA PROPORCIONADO INFORMACIÓN DIAGNÓSTICA ESPECÍFICA (DIAGNÓSTICOS VALIDADOS O TEXTO MANUAL). ES FUNDAMENTAL CONSULTAR CON SU MÉDICO PARA RECIBIR INDICACIONES PERSONALIZADAS.";

            let isDefaultText = false;
            if (field === 'signosAlarma' && processedInput[field]?.toUpperCase() === defaultValueForSigns) isDefaultText = true;
            if (field === 'indicacionesDieta' && processedInput[field]?.toUpperCase() === defaultValueForDiet) isDefaultText = true;
            if (field === 'cuidadosGenerales' && processedInput[field]?.toUpperCase() === defaultValueForCare) isDefaultText = true;
            if (field === 'recomendacionesGenerales' && processedInput[field]?.toUpperCase() === defaultValueForRecs) isDefaultText = true;
            
            if (!isDefaultText) {
                 processedInput[field] = (processedInput[field] as string).toUpperCase();
            }
        }
    });


    const {output} = await prompt(processedInput);
    return output!;
  }
);

