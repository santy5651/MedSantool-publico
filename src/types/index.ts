
export type ModuleType = 'ImageAnalysis' | 'PdfExtraction' | 'TextAnalysis' | 'ClinicalAnalysis' | 'DiagnosisSupport' | 'MedicalOrders' | 'TreatmentPlanSuggestion' | 'PatientAdvice' | 'MedicalJustification';

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  module: ModuleType;
  inputType: string;
  inputSummary: string;
  outputSummary: string;
  fullInput?: string | Record<string, any>;
  fullOutput?: string | Record<string, any> | DiagnosisResult[] | MedicalOrderOutputState | { clinicalAnalysis: string } | { summary: string } | TreatmentPlanOutputState | PatientAdviceOutputState | MedicalJustificationOutputState;
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
  thermalCurve: boolean;
  monitorPain: boolean;
  monitorWounds: boolean;
  monitorBleeding: boolean;
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
}

export interface PatientAdviceOutputState {
  generalRecommendations: string | null;
  alarmSigns: string | null;
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


export interface ClinicalDataContextState {
  // Image Analysis
  imageFile: File | null;
  imageAnalysisSummary: string | null;
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
}

export interface ClinicalDataContextActions {
  setImageFile: (file: File | null) => void;
  setImageAnalysisSummary: (summary: string | null) => void;
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
  
  setTreatmentPlanInput: (input: TreatmentPlanInputData) => void;
  setGeneratedTreatmentPlan: (plan: TreatmentPlanOutputState) => void;
  setIsGeneratingTreatmentPlan: (loading: boolean) => void;
  setTreatmentPlanError: (error: string | null) => void;

  setPatientAdviceInput: (input: PatientAdviceInputData) => void;
  setGeneratedPatientAdvice: (advice: PatientAdviceOutputState) => void;
  setIsGeneratingPatientAdvice: (loading: boolean) => void;
  setPatientAdviceError: (error: string | null) => void;

  setJustificationInput: (input: MedicalJustificationInputState) => void;
  setGeneratedJustification: (justification: MedicalJustificationOutputState) => void;
  setIsGeneratingJustification: (loading: boolean) => void;
  setJustificationError: (error: string | null) => void;
  
  clearImageModule: () => void;
  clearPdfModule: () => void;
  clearTextModule: () => void;
  clearClinicalAnalysisModule: () => void;
  clearDiagnosisModule: () => void;
  clearMedicalOrdersModule: () => void;
  clearTreatmentPlanModule: () => void;
  clearPatientAdviceModule: () => void;
  clearMedicalJustificationModule: () => void;
}

export type ClinicalDataContextType = ClinicalDataContextState & ClinicalDataContextActions;
