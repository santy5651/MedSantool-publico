
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
    categories: ['analgesico_opioide', 'sedante', 'UCI', 'reanimacion', 'SIR_protocol'],
    keywords: ['fentanyl', 'opioid', 'sedation', 'pain'],
    usages: [
      { protocol: 'Inducción anestésica', doseRange: '1–5 mcg/kg IV', doseNumerical: {min: 1, max: 5}, unit: 'mcg/kg', type: 'bolus', notes: 'en bolo lento' },
      { protocol: 'Sedación en UCI', doseRange: '0.7–10 mcg/kg/hora', doseNumerical: {min: 0.7, max: 10}, unit: 'mcg/kg/hora', type: 'infusion' },
      { protocol: 'Secuencia de Intubación Rápida (SIR)', doseRange: '2–5 mcg/kg IV', doseNumerical: {min: 2, max: 5}, unit: 'mcg/kg', type: 'bolus', notes: '1–3 minutos antes del relajante neuromuscular' },
    ],
    defaultConcentration: { value: 50, unit: 'mcg/ml' } // Example: 2500mcg in 50ml
  },
  {
    id: 'propofol',
    name: 'Propofol',
    categories: ['anestesico_general', 'sedante', 'UCI', 'reanimacion', 'SIR_protocol'],
    keywords: ['propofol', 'anesthesia', 'sedation'],
    usages: [
      { protocol: 'Inducción anestésica', doseRange: '1.5–2.5 mg/kg IV', doseNumerical: {min: 1.5, max: 2.5}, unit: 'mg/kg', type: 'bolus' },
      { protocol: 'Mantenimiento anestesia', doseRange: '4–12 mg/kg/hora IV', doseNumerical: {min: 4, max: 12}, unit: 'mg/kg/hora', type: 'infusion' },
      { protocol: 'Sedación en UCI', doseRange: '0.3–4 mg/kg/hora IV', doseNumerical: {min: 0.3, max: 4}, unit: 'mg/kg/hora', type: 'infusion' },
    ],
    defaultConcentration: { value: 10, unit: 'mg/ml' } // Propofol 1% (10mg/ml)
  },
  {
    id: 'noradrenaline',
    name: 'Noradrenalina (Norepinefrina)',
    categories: ['vasopresor', 'UCI', 'reanimacion', 'shock_septico_protocol'],
    keywords: ['noradrenaline', 'norepinephrine', 'vasopressor', 'shock'],
    usages: [
      { protocol: 'Shock (vasopresor)', doseRange: '0.01–3 mcg/kg/min IV', doseNumerical: {min: 0.01, max: 3}, unit: 'mcg/kg/min', type: 'infusion' },
    ],
    // Common dilution: 4mg in 250ml D5W or NS -> 16 mcg/ml.
    defaultConcentration: { value: 16, unit: 'mcg/ml', totalDrugAmount: 4, totalDrugAmountUnit: 'mg', totalVolume: 250, totalVolumeUnit: 'ml' }
  },
  {
    id: 'dexmedetomidine',
    name: 'Dexmedetomidina',
    categories: ['sedante', 'analgesico_no_opioide', 'UCI'],
    keywords: ['dexmedetomidine', 'precedex', 'sedation'],
    usages: [
      { protocol: 'Sedación en UCI (carga)', doseRange: '0.5–1 mcg/kg IV', doseNumerical: {min: 0.5, max: 1}, unit: 'mcg/kg', type: 'bolus', notes: 'administrar en 10 minutos' },
      { protocol: 'Sedación en UCI (mantenimiento)', doseRange: '0.2–1.5 mcg/kg/hora IV', doseNumerical: {min: 0.2, max: 1.5}, unit: 'mcg/kg/hora', type: 'infusion' },
    ],
    defaultConcentration: { value: 4, unit: 'mcg/ml', totalDrugAmount: 400, totalDrugAmountUnit: 'mcg', totalVolume: 100, totalVolumeUnit: 'ml' } // e.g. 400mcg in 100ml
  },
  {
    id: 'adrenaline',
    name: 'Adrenalina (Epinefrina)',
    categories: ['vasopresor', 'inotrópico', 'reanimacion', 'parada_cardiaca_protocol', 'anafilaxia_protocol'],
    keywords: ['adrenaline', 'epinephrine', 'cardiac arrest', 'anaphylaxis'],
    usages: [
      { protocol: 'Parada Cardíaca (ACLS)', doseRange: '1 mg IV/IO', doseNumerical: {value: 1}, unit: 'mg', type: 'bolus', notes: 'repetir cada 3-5 minutos' },
      { protocol: 'Anafilaxia (severa)', doseRange: '0.3–0.5 mg IM/SC', doseNumerical: {min: 0.3, max: 0.5}, unit: 'mg', type: 'bolus' },
      { protocol: 'Shock (post-parada, bradicardia)', doseRange: '0.1–0.5 mcg/kg/min IV', doseNumerical: {min: 0.1, max: 0.5}, unit: 'mcg/kg/min', type: 'infusion' },
    ],
    // Standard 1mg/1ml ampoule. For infusion, usually diluted, e.g., 1mg in 250ml -> 4mcg/ml.
    // This defaultConcentration is for the raw drug, user would specify dilution for infusion.
    defaultConcentration: { value: 1000, unit: 'mcg/ml', totalDrugAmount: 1, totalDrugAmountUnit: 'mg', totalVolume: 1, totalVolumeUnit: 'ml' }
  },
  {
    id: 'midazolam',
    name: 'Midazolam',
    categories: ['benzodiazepina', 'sedante', 'ansiolitico', 'anticonvulsivante', 'UCI', 'SIR_protocol'],
    keywords: ['midazolam', 'versed', 'sedation', 'seizure'],
    usages: [
      { protocol: 'Sedación Preoperatoria/Procedural', doseRange: '0.02–0.1 mg/kg IV', doseNumerical: {min: 0.02, max: 0.1}, unit: 'mg/kg', type: 'bolus', notes: 'lento' },
      { protocol: 'Sedación en UCI', doseRange: '0.04–0.2 mg/kg/hora IV', doseNumerical: {min: 0.04, max: 0.2}, unit: 'mg/kg/hora', type: 'infusion' },
      { protocol: 'Status Epilepticus', doseRange: '0.1–0.2 mg/kg IM o 0.1-0.3 mg/kg IV', doseNumerical: {min: 0.1, max: 0.3}, unit: 'mg/kg', type: 'bolus' },
    ],
    defaultConcentration: { value: 1, unit: 'mg/ml' } // Common concentration e.g. 5mg/5ml or 1mg/ml solution
  },
  {
    id: 'rocuronium',
    name: 'Rocuronio',
    categories: ['relajante_neuromuscular', 'SIR_protocol', 'UCI', 'anestesia'],
    keywords: ['rocuronium', 'zemuron', 'paralytic', 'nmba'],
    usages: [
        { protocol: 'Secuencia de Intubación Rápida (SIR)', doseRange: '0.6-1.2 mg/kg IV', doseNumerical: { min: 0.6, max: 1.2 }, unit: 'mg/kg', type: 'bolus' },
        { protocol: 'Mantenimiento de Relajación (UCI/Anestesia)', doseRange: '0.1-0.2 mg/kg IV', doseNumerical: { min: 0.1, max: 0.2 }, unit: 'mg/kg', type: 'bolus', notes: 'según necesidad' },
        { protocol: 'Infusión continua (UCI)', doseRange: '5-12 mcg/kg/min IV', doseNumerical: { min: 5, max: 12 }, unit: 'mcg/kg/min', type: 'infusion' },
    ],
    defaultConcentration: { value: 10, unit: 'mg/ml' } // Typically 10 mg/ml
  },
  {
    id: 'ketamine',
    name: 'Ketamina',
    categories: ['anestesico_disociativo', 'analgesico', 'sedante', 'SIR_protocol', 'UCI', 'reanimacion'],
    keywords: ['ketamine', 'ketalar', 'dissociative', 'anesthesia', 'pain'],
    usages: [
        { protocol: 'Inducción Anestésica (SIR)', doseRange: '1-2 mg/kg IV o 4-5 mg/kg IM', doseNumerical: { min: 1, max: 2 }, unit: 'mg/kg', type: 'bolus', notes: 'IV en 60 segundos' },
        { protocol: 'Analgesia Sub-Anestésica', doseRange: '0.1-0.5 mg/kg IV', doseNumerical: { min: 0.1, max: 0.5 }, unit: 'mg/kg', type: 'bolus', notes: 'lento' },
        { protocol: 'Sedación Procedural', doseRange: '0.5-1 mg/kg IV o 2-4 mg/kg IM', doseNumerical: { min: 0.5, max: 1 }, unit: 'mg/kg', type: 'bolus' },
        { protocol: 'Infusión Analgésica/Sedante (UCI)', doseRange: '0.1-2 mg/kg/hora (o 1-5 mcg/kg/min)', doseNumerical: { min: 0.1, max: 2 }, unit: 'mg/kg/hora', type: 'infusion' },
    ],
    defaultConcentration: { value: 50, unit: 'mg/ml' } // Commonly 10mg/ml, 50mg/ml, or 100mg/ml. Let's use 50mg/ml as an example.
  },
];

// Helper to get all unique categories for filtering
export const getAllMedicationCategories = (): string[] => {
  const allCategories = new Set<string>();
  initialMedicationsList.forEach(med => {
    med.categories.forEach(cat => allCategories.add(cat));
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

    