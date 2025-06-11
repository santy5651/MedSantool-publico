
export type ModuleType = 'ImageAnalysis' | 'PdfExtraction' | 'TextAnalysis' | 'DiagnosisSupport' | 'MedicalOrders';

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  module: ModuleType;
  inputType: string;
  inputSummary: string;
  outputSummary: string;
  fullInput?: string | Record<string, any>;
  fullOutput?: string | Record<string, any> | DiagnosisResult[] | MedicalOrderOutputState;
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
  noMedicationReconciliation: boolean; // Nuevo campo
  medicationReconciliationInput: string;
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

  setDiagnosisInputData: (data: string | ((prev: string) => string)) => void;
  setDiagnosisResults: (results: DiagnosisResult[] | null) => void;
  setIsDiagnosing: (loading: boolean) => void;
  setDiagnosisError: (error: string | null) => void;

  // Medical Orders Actions
  setMedicalOrderInputs: (inputs: MedicalOrderInputState | ((prevState: MedicalOrderInputState) => MedicalOrderInputState)) => void;
  setMedicalOrderOutput: (output: MedicalOrderOutputState) => void;
  setIsGeneratingMedicalOrder: (loading: boolean) => void;
  setMedicalOrderError: (error: string | null) => void;
  clearMedicalOrdersModule: () => void;

  clearImageModule: () => void;
  clearPdfModule: () => void;
  clearTextModule: () => void;
  clearDiagnosisModule: () => void;
}

export type ClinicalDataContextType = ClinicalDataContextState & ClinicalDataContextActions;
