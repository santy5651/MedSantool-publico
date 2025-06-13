
import type { MedicationInfo } from '@/types';

export const commonDoseUnits: string[] = [
  'mcg', 'mg', 'g', 'UI',
  'mcg/kg', 'mg/kg', 'g/kg',
  'mcg/min', 'mg/min',
  'mcg/kg/min', 'mg/kg/min',
  'mcg/kg/hora', 'mg/kg/hora',
  'ml/hora',
  'mEq'
];

export const infusionDrugAmountUnits: Array<'mcg' | 'mg'> = ['mcg', 'mg'];

export const initialMedicationsList: MedicationInfo[] = [
  {
    id: 'fentanyl',
    name: 'Fentanilo',
    categories: ['analgesico_opioide', 'sedante', 'UCI', 'reanimacion', 'SIR_protocol', 'dolor_agudo'],
    keywords: ['fentanyl', 'opioid', 'sedation', 'pain'],
    usages: [
      { protocol: 'Inducción anestésica (SIR)', doseRange: '1–5 mcg/kg IV', doseNumerical: {min: 1, max: 5}, unit: 'mcg/kg', type: 'bolus', notes: 'en bolo lento, 1–3 minutos antes del relajante neuromuscular' },
      { protocol: 'Sedación y Analgesia (UCI)', doseRange: '0.7–10 mcg/kg/hora', doseNumerical: {min: 0.7, max: 10}, unit: 'mcg/kg/hora', type: 'infusion' },
      { protocol: 'Analgesia (bolo)', doseRange: '0.5-1 mcg/kg IV', doseNumerical: {min:0.5, max:1}, unit: 'mcg/kg', type: 'bolus', notes: 'lento, repetir según necesidad'}
    ],
    defaultConcentration: { value: 50, unit: 'mcg/ml' } // Example: 2500mcg in 50ml -> 50mcg/ml
  },
  {
    id: 'propofol',
    name: 'Propofol',
    categories: ['anestesico_general', 'sedante', 'UCI', 'reanimacion', 'SIR_protocol'],
    keywords: ['propofol', 'anesthesia', 'sedation', 'diprivan'],
    usages: [
      { protocol: 'Inducción anestésica (SIR)', doseRange: '1.5–2.5 mg/kg IV', doseNumerical: {min: 1.5, max: 2.5}, unit: 'mg/kg', type: 'bolus' },
      { protocol: 'Mantenimiento anestesia', doseRange: '4–12 mg/kg/hora IV', doseNumerical: {min: 4, max: 12}, unit: 'mg/kg/hora', type: 'infusion' },
      { protocol: 'Sedación en UCI', doseRange: '0.3–4 mg/kg/hora IV', doseNumerical: {min: 0.3, max: 4}, unit: 'mg/kg/hora', type: 'infusion' },
    ],
    defaultConcentration: { value: 10, unit: 'mg/ml' } // Propofol 1% (10mg/ml)
  },
  {
    id: 'noradrenaline',
    name: 'Noradrenalina (Norepinefrina)',
    categories: ['vasopresor', 'UCI', 'reanimacion', 'shock_septico_protocol', 'shock_cardiogenico_protocol'],
    keywords: ['noradrenaline', 'norepinephrine', 'vasopressor', 'shock', 'levophed'],
    usages: [
      { protocol: 'Shock (vasopresor)', doseRange: '0.01–3 mcg/kg/min IV', doseNumerical: {min: 0.01, max: 3}, unit: 'mcg/kg/min', type: 'infusion', notes: 'Titular según respuesta hemodinámica.' },
    ],
    defaultConcentration: { value: 16, unit: 'mcg/ml', totalDrugAmount: 4, totalDrugAmountUnit: 'mg', totalVolume: 250, totalVolumeUnit: 'ml' } // Common: 4mg in 250ml NS/D5W
  },
  {
    id: 'dexmedetomidine',
    name: 'Dexmedetomidina',
    categories: ['sedante', 'analgesico_no_opioide', 'UCI', 'delirium_protocol'],
    keywords: ['dexmedetomidine', 'precedex', 'sedation', 'alpha-2_agonist'],
    usages: [
      { protocol: 'Sedación en UCI (carga)', doseRange: '0.5–1 mcg/kg IV', doseNumerical: {min: 0.5, max: 1}, unit: 'mcg/kg', type: 'bolus', notes: 'administrar en 10-20 minutos' },
      { protocol: 'Sedación en UCI (mantenimiento)', doseRange: '0.2–1.5 mcg/kg/hora IV', doseNumerical: {min: 0.2, max: 1.5}, unit: 'mcg/kg/hora', type: 'infusion', notes: 'Titular según nivel de sedación deseado.' },
    ],
    defaultConcentration: { value: 4, unit: 'mcg/ml', totalDrugAmount: 400, totalDrugAmountUnit: 'mcg', totalVolume: 100, totalVolumeUnit: 'ml' } // e.g. 400mcg in 100ml NS
  },
  {
    id: 'adrenaline',
    name: 'Adrenalina (Epinefrina)',
    categories: ['vasopresor', 'inotrópico', 'reanimacion', 'parada_cardiaca_protocol', 'anafilaxia_protocol', 'broncodilatador'],
    keywords: ['adrenaline', 'epinephrine', 'cardiac arrest', 'anaphylaxis', 'asystole', 'PEA'],
    usages: [
      { protocol: 'Parada Cardíaca (ACLS)', doseRange: '1 mg IV/IO', doseNumerical: {value: 1}, unit: 'mg', type: 'bolus', notes: 'Repetir cada 3-5 minutos. Diluir 1mg en 10ml para vía periférica.' },
      { protocol: 'Anafilaxia (severa)', doseRange: '0.3–0.5 mg IM (1:1000)', doseNumerical: {min: 0.3, max: 0.5}, unit: 'mg', type: 'bolus', notes: 'Puede repetirse cada 5-15 min.' },
      { protocol: 'Shock (infusión)', doseRange: '0.01–1 mcg/kg/min IV', doseNumerical: {min: 0.01, max: 1}, unit: 'mcg/kg/min', type: 'infusion', notes: 'Titular según respuesta.' },
      { protocol: 'Bradicardia sintomática (ACLS)', doseRange: '2-10 mcg/min IV (o 0.02-0.1 mcg/kg/min)', doseNumerical: {min:2, max:10}, unit: 'mcg/min', type: 'infusion', notes: 'Como alternativa a marcapasos o dopamina.'}
    ],
    defaultConcentration: { value: 1000, unit: 'mcg/ml', totalDrugAmount: 1, totalDrugAmountUnit: 'mg', totalVolume: 1, totalVolumeUnit: 'ml' } // Standard 1mg/1ml ampoule
  },
  {
    id: 'midazolam',
    name: 'Midazolam',
    categories: ['benzodiazepina', 'sedante', 'ansiolitico', 'anticonvulsivante', 'UCI', 'SIR_protocol'],
    keywords: ['midazolam', 'versed', 'sedation', 'seizure', 'anxiolytic'],
    usages: [
      { protocol: 'Sedación Preoperatoria/Procedural', doseRange: '0.02–0.1 mg/kg IV', doseNumerical: {min: 0.02, max: 0.1}, unit: 'mg/kg', type: 'bolus', notes: 'Administrar lentamente sobre 2-5 minutos.' },
      { protocol: 'Sedación en UCI (mantenimiento)', doseRange: '0.04–0.2 mg/kg/hora IV', doseNumerical: {min: 0.04, max: 0.2}, unit: 'mg/kg/hora', type: 'infusion' },
      { protocol: 'Status Epilepticus', doseRange: '0.1–0.2 mg/kg IM o 0.1-0.3 mg/kg IV', doseNumerical: {min: 0.1, max: 0.3}, unit: 'mg/kg', type: 'bolus', notes: 'IV máx 4mg/min.' },
      { protocol: 'Inducción (SIR)', doseRange: '0.1-0.3 mg/kg IV', doseNumerical: {min:0.1, max:0.3}, unit: 'mg/kg', type: 'bolus'}
    ],
    defaultConcentration: { value: 1, unit: 'mg/ml' } // Common concentration e.g. 5mg/5ml or 1mg/ml solution
  },
  {
    id: 'rocuronium',
    name: 'Rocuronio',
    categories: ['relajante_neuromuscular', 'SIR_protocol', 'UCI', 'anestesia'],
    keywords: ['rocuronium', 'zemuron', 'paralytic', 'nmba', 'esmeron'],
    usages: [
        { protocol: 'Secuencia de Intubación Rápida (SIR)', doseRange: '0.6-1.2 mg/kg IV', doseNumerical: { min: 0.6, max: 1.2 }, unit: 'mg/kg', type: 'bolus', notes: 'Dosis más altas para inicio más rápido.' },
        { protocol: 'Mantenimiento de Relajación (Bolos)', doseRange: '0.1-0.2 mg/kg IV', doseNumerical: { min: 0.1, max: 0.2 }, unit: 'mg/kg', type: 'bolus', notes: 'según necesidad (TOF).' },
        { protocol: 'Infusión continua (UCI)', doseRange: '5-12 mcg/kg/min IV', doseNumerical: { min: 5, max: 12 }, unit: 'mcg/kg/min', type: 'infusion', notes: 'Ajustar según TOF.' },
    ],
    defaultConcentration: { value: 10, unit: 'mg/ml' } // Typically 10 mg/ml
  },
  {
    id: 'ketamine',
    name: 'Ketamina',
    categories: ['anestesico_disociativo', 'analgesico', 'sedante', 'SIR_protocol', 'UCI', 'reanimacion', 'dolor_agudo', 'broncodilatador'],
    keywords: ['ketamine', 'ketalar', 'dissociative', 'anesthesia', 'pain', 'bronchodilator'],
    usages: [
        { protocol: 'Inducción Anestésica (SIR)', doseRange: '1-2 mg/kg IV o 4-5 mg/kg IM', doseNumerical: { min: 1, max: 2 }, unit: 'mg/kg', type: 'bolus', notes: 'IV administrar en 60 segundos.' },
        { protocol: 'Analgesia Sub-Anestésica (bolo)', doseRange: '0.1-0.5 mg/kg IV', doseNumerical: { min: 0.1, max: 0.5 }, unit: 'mg/kg', type: 'bolus', notes: 'En 2-5 min. Puede repetirse.' },
        { protocol: 'Sedación Procedural', doseRange: '0.5-1 mg/kg IV o 2-4 mg/kg IM', doseNumerical: { min: 0.5, max: 1 }, unit: 'mg/kg', type: 'bolus' },
        { protocol: 'Infusión Analgésica/Sedante (UCI)', doseRange: '0.1-2 mg/kg/hora (equiv. ~1.5-30 mcg/kg/min)', doseNumerical: { min: 0.1, max: 2 }, unit: 'mg/kg/hora', type: 'infusion' },
    ],
    defaultConcentration: { value: 50, unit: 'mg/ml' } // Commonly 10mg/ml, 50mg/ml, or 100mg/ml. Example: 50mg/ml.
  },
  {
    id: 'dopamine',
    name: 'Dopamina',
    categories: ['vasopresor', 'inotrópico', 'UCI', 'reanimacion', 'shock_cardiogenico_protocol', 'bradicardia_protocol'],
    keywords: ['dopamine', 'intropin', 'vasopressor', 'inotropic'],
    usages: [
      { protocol: 'Dosis Dopaminérgica (renal/mesentérica - controversial)', doseRange: '1-3 mcg/kg/min IV', doseNumerical: { min: 1, max: 3 }, unit: 'mcg/kg/min', type: 'infusion', notes: 'Eficacia cuestionada.' },
      { protocol: 'Dosis Beta (inotrópica)', doseRange: '3-10 mcg/kg/min IV', doseNumerical: { min: 3, max: 10 }, unit: 'mcg/kg/min', type: 'infusion' },
      { protocol: 'Dosis Alfa (vasopresora)', doseRange: '>10 mcg/kg/min IV (hasta 20-50)', doseNumerical: { min: 10, max: 50 }, unit: 'mcg/kg/min', type: 'infusion' },
      { protocol: 'Bradicardia Sintomática (ACLS)', doseRange: '5-20 mcg/kg/min IV', doseNumerical: { min: 5, max: 20 }, unit: 'mcg/kg/min', type: 'infusion', notes: 'Segunda línea si atropina ineficaz.' },
    ],
    defaultConcentration: { value: 1600, unit: 'mcg/ml', totalDrugAmount: 400, totalDrugAmountUnit: 'mg', totalVolume: 250, totalVolumeUnit: 'ml' } // e.g., 400mg in 250ml D5W -> 1600 mcg/ml
  },
  {
    id: 'dobutamine',
    name: 'Dobutamina',
    categories: ['inotrópico', 'UCI', 'reanimacion', 'shock_cardiogenico_protocol', 'insuficiencia_cardiaca_protocol'],
    keywords: ['dobutamine', 'dobutrex', 'inotropic', 'heart failure'],
    usages: [
      { protocol: 'Insuficiencia Cardíaca / Shock Cardiogénico', doseRange: '2-20 mcg/kg/min IV', doseNumerical: { min: 2, max: 20 }, unit: 'mcg/kg/min', type: 'infusion', notes: 'Titular según respuesta hemodinámica.' },
    ],
    defaultConcentration: { value: 1000, unit: 'mcg/ml', totalDrugAmount: 250, totalDrugAmountUnit: 'mg', totalVolume: 250, totalVolumeUnit: 'ml' } // e.g., 250mg in 250ml D5W -> 1000 mcg/ml
  },
  // Antibióticos de ejemplo
  {
    id: 'vancomycin',
    name: 'Vancomicina',
    categories: ['antibiotico', 'glicopeptido', 'UCI', 'sepsis_protocol', 'infeccion_piel_tejidos_blandos_protocol'],
    keywords: ['vancomycin', 'vancocin', 'mrsa', 'antibiotic'],
    usages: [
      { protocol: 'Infecciones Sistémicas Graves (MRSA)', doseRange: '15-20 mg/kg IV cada 8-12 horas', doseNumerical: { min: 15, max: 20 }, unit: 'mg/kg', type: 'bolus', notes: 'Ajustar según niveles séricos y función renal. Infundir lentamente (mín 60 min por gramo).' },
      { protocol: 'Colitis por C. difficile (oral)', doseRange: '125 mg VO cada 6 horas por 10 días', doseNumerical: { value: 125 }, unit: 'mg', type: 'bolus', notes: 'Solo para vía oral en esta indicación.' },
    ],
    // Para infusión IV, se reconstituye y luego se diluye, por ejemplo, 1g en 200ml NS. No hay una "concentración" estándar de la ampolla para infusión.
  },
  {
    id: 'piperacillin_tazobactam',
    name: 'Piperacilina/Tazobactam',
    categories: ['antibiotico', 'penicilina_betalactamasa', 'UCI', 'sepsis_protocol', 'neumonia_protocol', 'infeccion_intraabdominal_protocol'],
    keywords: ['piperacillin', 'tazobactam', 'tazocin', 'zosyn', 'antibiotic', 'broad-spectrum'],
    usages: [
      { protocol: 'Infecciones Graves (Ej: Neumonía nosocomial, Sepsis)', doseRange: '4.5 g IV cada 6-8 horas', doseNumerical: { value: 4.5 }, unit: 'g', type: 'bolus', notes: 'Infusión en 30 min. Ajustar en insuficiencia renal.' },
    ],
    // Se reconstituye y diluye para infusión. Ejemplo: 4.5g en 100ml NS.
  },
];

// Helper to get all unique categories for filtering
export const getAllMedicationCategories = (): string[] => {
  const allCategories = new Set<string>();
  initialMedicationsList.forEach(med => {
    med.categories.forEach(cat => {
        // Limpiar y estandarizar un poco los nombres de categoría para la UI
        const cleanedCat = cat.toLowerCase()
                              .replace(/_/g, ' ') // Reemplazar guiones bajos por espacios
                              .replace(/_protocol$/, '') // Quitar sufijo '_protocol'
                              .replace(/\b\w/g, l => l.toUpperCase()); // Capitalizar cada palabra
        allCategories.add(cleanedCat);
    });
  });
  return Array.from(allCategories).sort();
};

// Helper to get all unique protocols for filtering (can be very numerous)
export const getAllMedicationProtocols = (): string[] => {
    const allProtocols = new Set<string>();
    initialMedicationsList.forEach(med => {
        med.usages.forEach(usage => allProtocols.add(usage.protocol));
    });
    return Array.from(allProtocols).sort();
};

    
