

export type ModuleType = 'ImageAnalysis' | 'PdfExtraction' | 'TextAnalysis' | 'ClinicalAnalysis' | 'DiagnosisSupport' | 'MedicalOrders' | 'TreatmentPlanSuggestion' | 'PatientAdvice' | 'MedicalJustification' | 'MedicalAssistantChat' | 'DoseCalculator';

export type ActiveView = 'analysis' | 'other' | 'all';
export type FontSize = 'small' | 'normal' | 'large';

// --- Medication Info for Dose Calculator ---
export interface MedicationUsage {
  protocol: string;
  doseRange: string;
  doseNumerical?: { min?: number; max?: number; value?: number }; // Parsed numerical dose for easier use
  unit: string;
  type: 'bolus' | 'infusion';
  notes?: string;
}

export interface MedicationConcentration {
  value: number; // e.g., 4 for 4mg/ml or 16 for 16mcg/ml
  unit: 'mg/ml' | 'mcg/ml'; // Concentration unit
  totalDrugAmount?: number; // e.g. 4 (for 4mg)
  totalDrugAmountUnit?: 'mg' | 'mcg'; // Unit of the drug amount
  totalVolume?: number; // e.g. 250 (for 250ml)
  totalVolumeUnit?: 'ml';
}


export interface MedicationInfo {
  id: string;
  name: string;
  categories: string[]; // For filtering: e.g., ["vasopresor", "UCI", "reanimacion", "SIR_protocol"]
  keywords?: string[]; // Additional keywords for searching
  usages: MedicationUsage[];
  defaultConcentration?: MedicationConcentration; // Common preparation for infusions
}

// --- Dose Calculator Module Specific Types ---
export type DoseUnit = 
  | 'mcg' | 'mg' | 'g' | 'UI' 
  | 'mcg/kg' | 'mg/kg' | 'g/kg'
  | 'mcg/min' | 'mg/min' 
  | 'mcg/kg/min' | 'mg/kg/min'
  | 'mcg/kg/hora' | 'mg/kg/hora'
  | 'ml/hora' // For infusion rate output
  | 'mEq';

export interface DoseCalculatorInputState {
  patientWeight: string; // Using string to allow empty input, convert to number for calcs
  medicationName: string; // Manual input or selected medication name
  selectedMedication: MedicationInfo | null;
  selectedUsage: MedicationUsage | null;
  useSuggestedDose: boolean;
  doseToUse: string; // Using string for input field
  doseUnit: DoseUnit | '';
  
  // For infusions
  isInfusion: boolean;
  infusionDrugAmount: string;
  infusionDrugAmountUnit: 'mg' | 'mcg' | '';
  infusionTotalVolume: string; // in ml
}

export interface DoseCalculatorOutputState {
  calculatedBolusDose: string | null; // e.g., "150 mcg"
  calculatedInfusionRate: string | null; // e.g., "10 ml/hr"
  calculatedConcentration: string | null; // e.g., "16 mcg/ml"
  calculationWarning: string | null;
  calculationError: string | null;
}
// --- End Dose Calculator Module Specific Types ---

export interface ImageAnalysisOutputState {
  summary: string | null;
  radiologistReading: string | null;
}

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  module: ModuleType;
  inputType: string;
  inputSummary: string;
  outputSummary: string;
  fullInput?: string | Record<string, any> | DoseCalculatorInputState | PatientAdviceInputData;
  fullOutput?: string | Record<string, any> | ImageAnalysisOutputState | DiagnosisResult[] | MedicalOrderOutputState | { clinicalAnalysis: string } | { summary: string } | TreatmentPlanOutputState | PatientAdviceOutputState | MedicalJustificationOutputState | { messages: Array<{sender: 'user' | 'ai', text: string, error?: boolean}>, error?: string } | DoseCalculatorOutputState;
  status: 'pending' | 'completed' | 'error';
  errorDetails?: string;
}

export interface DiagnosisResult {
  code: string;
  description: string;
  confidence: number;
  isValidated?: boolean;
  isPrincipal?: boolean;
}

export interface PdfStructuredData {
  key: string;
  value: string;
}

// --- Medical Orders Module Specific Types ---
export type MedicalOrderType = "OBSERVACIÓN" | "HOSPITALIZACIÓN" | "EGRESO";
export type TransferConditionType = "Grupo 1: Camillero o auxiliar" | "Grupo 2: Médico general" | "Grupo 3: Médico general por paciente intubado" | "NO APLICA";

export interface NursingSurveillanceState {
  // Vigilancia Clínica
  monitorWounds: boolean; // Vigilar heridas
  monitorBleeding: boolean; // Vigilar sangrado
  monitorPain: boolean; // Vigilar dolor
  vigilarDiuresis: boolean; // Vigilar diuresis
  
  // Vías y Dispositivos
  cuidadosCateterVenoso: boolean; // Cuidados de catéter venoso
  cuidadosSondaVesical: boolean; // Cuidados de sonda vesical
  cuidadosDrenajesQuirurgicos: boolean; // Cuidados de drenajes quirúrgicos
  cuidadosTraqueostomia: boolean; // Cuidados de traqueostomía
  
  // Especiales
  controlGlicemicoTurno: boolean; // Control glicémico por turno
  controlGlicemicoAyunas: boolean; // Control glicémico en ayunas
  thermalCurve: boolean; // Curva térmica (existing)
  hojaNeurologica: boolean; // Hoja neurológica
  realizarCuraciones: boolean; // Realizar curaciones y cuidados de heridas
  
  // Líquidos
  restriccionHidrica800: boolean; // Restricción hídrica a 800 cc/24 horas
  controlLiquidosAdminElim: boolean; // Control de líquidos administrados y eliminados
  registroBalanceHidrico24h: boolean; // Registro de balance hídrico de 24 horas
  calcularDiuresisHoraria: boolean; // Calcular diuresis horaria
  pesoDiario: boolean; // Peso diario
}

export interface MedicalOrderInputState {
  orderType: MedicalOrderType | '';
  oxygen: string;
  isolation: string;
  diet: string;
  medicationsInput: string;
  noMedicationReconciliation: boolean;
  medicationReconciliationInput: string;
  specialtyFollowUp?: string;
  fallRisk: string;
  paduaScale: string;
  nursingSurveillance: NursingSurveillanceState;
  transferConditions: TransferConditionType | '';
  specialConsiderations: string;
}

export interface MedicalOrderOutputState {
  generatedOrderText: string | null;
}
// --- End Medical Orders Module Specific Types ---

// --- Treatment Plan Suggestion Module Specific Types ---
export interface ValidatedDiagnosis {
  code: string;
  description: string;
}

export interface TreatmentPlanInputData {
  clinicalAnalysis: string | null;
  textSummary: string | null;
  validatedDiagnoses: ValidatedDiagnosis[] | null;
}

export interface TreatmentPlanOutputState {
 suggestedPlanText: string | null;
}
// --- End Treatment Plan Suggestion Module Specific Types ---

// --- Patient Advice Module Specific Types ---
export interface PatientAdviceInputData {
  clinicalAnalysis: string | null; 
  textSummary: string | null; 
  validatedDiagnoses: ValidatedDiagnosis[] | null;
  manualDiagnosisOrAnalysis: string | null;
}

export interface PatientAdviceOutputState {
  generalRecommendations: string | null;
  alarmSigns: string | null;
  dietaryIndications: string | null;
  generalCare: string | null;
}
// --- End Patient Advice Module Specific Types ---

// --- Medical Justification Module Specific Types ---
export interface MedicalJustificationInputState {
  conceptToJustify: string | null;
  relevantClinicalInfo: string | null;
}

export interface MedicalJustificationOutputState {
  justificationText: string | null;
}
// --- End Medical Justification Module Specific Types ---

// --- Medical Assistant Chat Module Specific Types ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  error?: boolean;
}
// --- End Medical Assistant Chat Module Specific Types ---


export interface ClinicalDataContextState {
  // Image Analysis
  imageFile: File | null;
  imageAnalysisOutput: ImageAnalysisOutputState;
  isImageAnalyzing: boolean;
  imageAnalysisError: string | null;

  // PDF Extraction
  pdfFile: File | null;
  pdfExtractedNotes: string | null;
  pdfStructuredData: PdfStructuredData[] | null;
  isPdfExtracting: boolean;
  pdfExtractionError: string | null;

  // Text Analysis
  clinicalNotesInput: string;
  textAnalysisSummary: string | null;
  isTextAnalyzing: boolean;
  textAnalysisError: string |null;

  // Clinical Analysis
  clinicalAnalysisInput: string | null; 
  generatedClinicalAnalysis: string | null;
  isGeneratingClinicalAnalysis: boolean;
  clinicalAnalysisError: string | null;

  // Diagnosis Support
  diagnosisInputData: string;
  diagnosisResults: DiagnosisResult[] | null;
  isDiagnosing: boolean;
  diagnosisError: string | null;

  // Medical Orders
  medicalOrderInputs: MedicalOrderInputState;
  medicalOrderOutput: MedicalOrderOutputState;
  isGeneratingMedicalOrder: boolean;
  medicalOrderError: string | null;

  // Treatment Plan Suggestion
  treatmentPlanInput: TreatmentPlanInputData;
  generatedTreatmentPlan: TreatmentPlanOutputState;
  isGeneratingTreatmentPlan: boolean;
  treatmentPlanError: string | null;

  // Patient Advice
  patientAdviceInput: PatientAdviceInputData;
  generatedPatientAdvice: PatientAdviceOutputState;
  isGeneratingPatientAdvice: boolean;
  patientAdviceError: string | null;

  // Medical Justification
  justificationInput: MedicalJustificationInputState;
  generatedJustification: MedicalJustificationOutputState;
  isGeneratingJustification: boolean;
  justificationError: string | null;

  // Medical Assistant Chat
  chatMessages: ChatMessage[];
  isChatResponding: boolean;
  chatError: string | null;

  // Dose Calculator
  doseCalculatorInputs: DoseCalculatorInputState;
  doseCalculatorOutput: DoseCalculatorOutputState;
  isCalculatingDose: boolean; // To manage loading state for calculations
  doseCalculationError: string | null; // For errors specific to calculation logic
}

export interface ClinicalDataContextActions {
  setImageFile: (file: File | null) => void;
  setImageAnalysisOutput: (output: ImageAnalysisOutputState) => void;
  setIsImageAnalyzing: (loading: boolean) => void;
  setImageAnalysisError: (error: string | null) => void;

  setPdfFile: (file: File | null) => void;
  setPdfExtractedNotes: (notes: string | null) => void;
  setPdfStructuredData: (data: PdfStructuredData[] | null) => void;
  setIsPdfExtracting: (loading: boolean) => void;
  setPdfExtractionError: (error: string | null) => void;

  setClinicalNotesInput: (notes: string | ((prev: string) => string)) => void;
  setTextAnalysisSummary: (summary: string | null) => void;
  setIsTextAnalyzing: (loading: boolean) => void;
  setTextAnalysisError: (error: string | null) => void;

  setClinicalAnalysisInput: (input: string | null) => void;
  setGeneratedClinicalAnalysis: (analysis: string | null) => void;
  setIsGeneratingClinicalAnalysis: (loading: boolean) => void;
  setClinicalAnalysisError: (error: string | null) => void;

  setDiagnosisInputData: (data: string | ((prev: string) => string)) => void;
  setDiagnosisResults: (results: DiagnosisResult[] | null) => void;
  setIsDiagnosing: (loading: boolean) => void;
  setDiagnosisError: (error: string | null) => void;

  setMedicalOrderInputs: (inputs: MedicalOrderInputState | ((prevState: MedicalOrderInputState) => MedicalOrderInputState)) => void;
  setMedicalOrderOutput: (output: MedicalOrderOutputState) => void;
  setIsGeneratingMedicalOrder: (loading: boolean) => void;
  setMedicalOrderError: (error: string | null) => void;
  
  setTreatmentPlanInput: (updater: TreatmentPlanInputData | ((prevState: TreatmentPlanInputData) => TreatmentPlanInputData)) => void;
  setGeneratedTreatmentPlan: (plan: TreatmentPlanOutputState) => void;
  setIsGeneratingTreatmentPlan: (loading: boolean) => void;
  setTreatmentPlanError: (error: string | null) => void;

  setPatientAdviceInput: (updater: PatientAdviceInputData | ((prevState: PatientAdviceInputData) => PatientAdviceInputData)) => void;
  setGeneratedPatientAdvice: (advice: PatientAdviceOutputState) => void;
  setIsGeneratingPatientAdvice: (loading: boolean) => void;
  setPatientAdviceError: (error: string | null) => void;

  setJustificationInput: (updater: MedicalJustificationInputState | ((prevState: MedicalJustificationInputState) => MedicalJustificationInputState)) => void;
  setGeneratedJustification: (justification: MedicalJustificationOutputState) => void;
  setIsGeneratingJustification: (loading: boolean) => void;
  setJustificationError: (error: string | null) => void;

  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setIsChatResponding: (loading: boolean) => void;
  setChatError: (error: string | null) => void;

  // Dose Calculator actions
  setDoseCalculatorInputs: (inputsOrUpdater: DoseCalculatorInputState | ((prevState: DoseCalculatorInputState) => DoseCalculatorInputState)) => void;
  setDoseCalculatorOutput: (output: DoseCalculatorOutputState) => void;
  setIsCalculatingDose: (loading: boolean) => void;
  setDoseCalculationError: (error: string | null) => void;
  
  clearImageModule: () => void;
  clearPdfModule: () => void;
  clearTextModule: () => void;
  clearClinicalAnalysisModule: () => void;
  clearDiagnosisModule: () => void;
  clearMedicalOrdersModule: () => void;
  clearTreatmentPlanModule: () => void;
  clearPatientAdviceModule: () => void;
  clearMedicalJustificationModule: () => void;
  clearChatModule: () => void;
  clearDoseCalculatorModule: () => void;
}

export type ClinicalDataContextType = ClinicalDataContextState & ClinicalDataContextActions;


export interface ViewContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  expandedModuleId: string | null;
  setExpandedModuleId: (id: string | null) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}
    
