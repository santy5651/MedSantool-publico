export type ModuleType = 'ImageAnalysis' | 'PdfExtraction' | 'TextAnalysis' | 'DiagnosisSupport';

export interface HistoryEntry {
  id?: number;
  timestamp: number;
  module: ModuleType;
  inputType: string; 
  inputSummary: string; 
  outputSummary: string;
  fullInput?: string | Record<string, any>; 
  fullOutput?: string | Record<string, any> | DiagnosisResult[]; 
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
  clinicalNotesInput: string; // Default to empty string
  textAnalysisSummary: string | null;
  isTextAnalyzing: boolean;
  textAnalysisError: string |null;

  // Diagnosis Support
  diagnosisInputData: string; // Default to empty string
  diagnosisResults: DiagnosisResult[] | null;
  isDiagnosing: boolean;
  diagnosisError: string | null;
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

  setClinicalNotesInput: (notes: string) => void;
  setTextAnalysisSummary: (summary: string | null) => void;
  setIsTextAnalyzing: (loading: boolean) => void;
  setTextAnalysisError: (error: string | null) => void;

  setDiagnosisInputData: (data: string) => void;
  setDiagnosisResults: (results: DiagnosisResult[] | null) => void;
  setIsDiagnosing: (loading: boolean) => void;
  setDiagnosisError: (error: string | null) => void;

  clearImageModule: () => void;
  clearPdfModule: () => void;
  clearTextModule: () => void;
  clearDiagnosisModule: () => void;
}

export type ClinicalDataContextType = ClinicalDataContextState & ClinicalDataContextActions;

// AI Flow specific types (already defined in src/ai/flows, re-export or re-define for clarity if needed, but prefer direct import)
// For example, from src/ai/flows/suggest-diagnosis.ts:
// export type { SuggestDiagnosisOutput as AISuggestDiagnosisOutput } from '@/ai/flows/suggest-diagnosis';
// This can be done if there's a need to alias or slightly adapt them for frontend use.
// For now, we'll import them directly in components.
