
export type ModuleType = 'ImageAnalysis' | 'PdfExtraction' | 'TextAnalysis' | 'ClinicalAnalysis' | 'DiagnosisSupport' | 'MedicalOrders';

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  module: ModuleType;
  inputType: string;
  inputSummary: string;
  outputSummary: string;
  fullInput?: string | Record<string, any>;
  fullOutput?: string | Record<string, any> | DiagnosisResult[] | MedicalOrderOutputState | { clinicalAnalysis: string } | { summary: string };
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

  // Clinical Analysis (New Module)
  clinicalAnalysisInput: string | null; // Will typically be textAnalysisSummary
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

  // Clinical Analysis Actions (New Module)
  setClinicalAnalysisInput: (input: string | null) => void;
  setGeneratedClinicalAnalysis: (analysis: string | null) => void;
  setIsGeneratingClinicalAnalysis: (loading: boolean) => void;
  setClinicalAnalysisError: (error: string | null) => void;
  clearClinicalAnalysisModule: () => void;

  setDiagnosisInputData: (data: string | ((prev: string) => string)) => void;
  setDiagnosisResults: (results: DiagnosisResult[] | null) => void;
  setIsDiagnosing: (loading: boolean) => void;
  setDiagnosisError: (error: string | null) => void;

  setMedicalOrderInputs: (inputs: MedicalOrderInputState | ((prevState: MedicalOrderInputState) => MedicalOrderInputState)) => void;
  setMedicalOrderOutput: (output: MedicalOrderOutputState) => void;
  setIsGeneratingMedicalOrder: (loading: boolean) => void;
  setMedicalOrderError: (error: string | null) => void;
  
  clearImageModule: () => void;
  clearPdfModule: () => void;
  clearTextModule: () => void;
  clearDiagnosisModule: () => void;
  clearMedicalOrdersModule: () => void;
}

export type ClinicalDataContextType = ClinicalDataContextState & ClinicalDataContextActions;
