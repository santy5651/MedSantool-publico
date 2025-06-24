'use server';
/**
 * @fileOverview Sugiere un examen físico completo, modificando una plantilla normal con hallazgos patológicos basados en los diagnósticos.
 *
 * - generatePhysicalExam - Función que maneja la generación del examen físico.
 * - GeneratePhysicalExamInput - Tipo de entrada para la función.
 * - GeneratePhysicalExamOutput - Tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhysicalExamInputSchema = z.object({
  diagnoses: z.array(z.object({
    code: z.string().describe('Código CIE-10 del diagnóstico.'),
    description: z.string().describe('Descripción del diagnóstico.'),
  })).describe('Lista de diagnósticos validados por el médico.'),
  additionalAnalysis: z.string().optional().describe('Un análisis clínico enfocado o resumen del caso, ingresado manualmente o autocompletado. Usarlo como contexto adicional para los hallazgos patológicos.'),
});
export type GeneratePhysicalExamInput = z.infer<typeof GeneratePhysicalExamInputSchema>;

const GeneratePhysicalExamOutputSchema = z.object({
    physicalExamText: z.string().describe('Un texto completo del examen físico, basado en una plantilla de hallazgos normales pero modificado para incluir hallazgos patológicos relevantes según los diagnósticos proporcionados.'),
});
export type GeneratePhysicalExamOutput = z.infer<typeof GeneratePhysicalExamOutputSchema>;

export async function generatePhysicalExam(
  input: GeneratePhysicalExamInput
): Promise<GeneratePhysicalExamOutput> {
  return generatePhysicalExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhysicalExamPrompt',
  input: {schema: GeneratePhysicalExamInputSchema},
  output: {schema: GeneratePhysicalExamOutputSchema},
  prompt: `Eres un médico experto redactando exámenes físicos para historias clínicas.
Tu tarea es generar un texto completo de examen físico.

**Diagnósticos Validados del Paciente:**
{{#each diagnoses}}
- {{{this.description}}} ({{{this.code}}})
{{/each}}

{{#if additionalAnalysis}}
**Análisis Clínico Adicional:**
{{{additionalAnalysis}}}
{{/if}}

**Instrucciones:**
1.  Utiliza la siguiente plantilla de examen físico normal como base.
2.  Analiza los diagnósticos validados del paciente{{#if additionalAnalysis}} y el análisis clínico adicional proporcionado{{/if}}.
3.  **Modifica la plantilla** para incluir los hallazgos patológicos que esperarías encontrar en el examen físico basándote en esa información combinada.
4.  Si un sistema no se ve afectado por los diagnósticos, mantén los hallazgos normales de la plantilla.
5.  La salida debe ser un texto único, bien estructurado y profesional, donde cada sistema está en una nueva línea.

**Plantilla de Examen Físico Normal:**
CABEZA: NORMOCÉFALO, NO SE PALPAN MASAS NI DEFORMIDADES.
OJOS: PUPILAS ISOCÓRICAS, FOTORREACTIVAS, ESCLERAS ANICTÉRICAS, MUCOSAS HÚMEDAS Y ROSADAS
OROFARINGE: MUCOSAS ROSADAS Y HUMEDAS. SIN ERITEMA NI CONGESTIÓN, SIN PLACAS O EXUDADOS.
TÓRAX: NORMOEXPANSIBLE. MURMULLO VESICULAR PRESENTE EN AMBOS CAMPOS PULMONARES, SIN SOBREAGREGADOS, CORAZÓN RÍTMICO SIN SOPLOS AUDIBLES.
ABDOMEN: BLANDO DEPRESIBLE, NO DOLOROSO A LA PALPACIÓN, SIN SIGNOS DE IRRITACIÓN PERITONEAL, NO MASAS, RUIDOS HIDROAEREOS PRESENTES.
EXTREMIDADES: SIN EDEMA
PIEL: ÍNTEGRA SIN LESIONES NI ULCERAS POR PRESION, ANICTÉRICA.
NEUROLÓGICO: ESCALA DE COMA DE GLASGOW 15/15, REACTIVO, CONSCIENTE, ORIENTADO EN LAS TRES ESFERAS, NO DÉFICIT DE PARES CRANEALES. SENSIBILIDAD CONSERVADA.

Genera el examen físico completo y modificado del paciente:
`,
});

const generatePhysicalExamFlow = ai.defineFlow(
  {
    name: 'generatePhysicalExamFlow',
    inputSchema: GeneratePhysicalExamInputSchema,
    outputSchema: GeneratePhysicalExamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
