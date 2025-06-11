
'use client';

import type { ClinicalDataContextType, ClinicalDataContextState, PdfStructuredData, DiagnosisResult, MedicalOrderInputState, MedicalOrderOutputState, NursingSurveillanceState } from '@/types';
import React, { createContext, useContext, useState, useCallback } from 'react';

const initialNursingSurveillanceState: NursingSurveillanceState = {
  thermalCurve: false,
  monitorPain: false,
  monitorWounds: false,
  monitorBleeding: false,
};

const initialMedicalOrderInputs: MedicalOrderInputState = {
  orderType: '',
  oxygen: "NO REQUIERE OXÍGENO",
  isolation: "NO REQUIERE AISLAMIENTO",
  diet: "",
  medicationsInput: "",
  noMedicationReconciliation: false,
  medicationReconciliationInput: "",
  specialtyFollowUp: "",
  fallRisk: "RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA",
  paduaScale: "",
  nursingSurveillance: initialNursingSurveillanceState,
  transferConditions: '',
  specialConsiderations: "",
};

const initialMedicalOrderOutput: MedicalOrderOutputState = {
  generatedOrderText: null,
};


const initialState: ClinicalDataContextState = {
  imageFile: null,
  imageAnalysisSummary: null,
  isImageAnalyzing: false,
  imageAnalysisError: null,

  pdfFile: null,
  pdfExtractedNotes: null,
  pdfStructuredData: null,
  isPdfExtracting: false,
  pdfExtractionError: null,

  clinicalNotesInput: '',
  textAnalysisSummary: null,
  isTextAnalyzing: false,
  textAnalysisError: null,

  // Clinical Analysis (New Module)
  clinicalAnalysisInput: null, 
  generatedClinicalAnalysis: null,
  isGeneratingClinicalAnalysis: false,
  clinicalAnalysisError: null,

  diagnosisInputData: '',
  diagnosisResults: null,
  isDiagnosing: false,
  diagnosisError: null,

  medicalOrderInputs: initialMedicalOrderInputs,
  medicalOrderOutput: initialMedicalOrderOutput,
  isGeneratingMedicalOrder: false,
  medicalOrderError: null,
};

const ClinicalDataContext = createContext<ClinicalDataContextType | undefined>(undefined);

export const ClinicalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClinicalDataContextState>(initialState);

  const setImageFile = useCallback((file: File | null) => setState(s => ({ ...s, imageFile: file })), []);
  const setImageAnalysisSummary = useCallback((summary: string | null) => setState(s => ({ ...s, imageAnalysisSummary: summary })), []);
  const setIsImageAnalyzing = useCallback((loading: boolean) => setState(s => ({ ...s, isImageAnalyzing: loading })), []);
  const setImageAnalysisError = useCallback((error: string | null) => setState(s => ({ ...s, imageAnalysisError: error})), []);

  const setPdfFile = useCallback((file: File | null) => setState(s => ({ ...s, pdfFile: file })), []);
  const setPdfExtractedNotes = useCallback((notes: string | null) => setState(s => ({ ...s, pdfExtractedNotes: notes })), []);
  const setPdfStructuredData = useCallback((data: PdfStructuredData[] | null) => setState(s => ({ ...s, pdfStructuredData: data })), []);
  const setIsPdfExtracting = useCallback((loading: boolean) => setState(s => ({ ...s, isPdfExtracting: loading })), []);
  const setPdfExtractionError = useCallback((error: string | null) => setState(s => ({...s, pdfExtractionError: error})), []);

  const setClinicalNotesInput = useCallback((notes: string | ((prev: string) => string)) => {
    setState(s => ({ ...s, clinicalNotesInput: typeof notes === 'function' ? notes(s.clinicalNotesInput) : notes }));
  }, []);
  const setTextAnalysisSummary = useCallback((summary: string | null) => {
    setState(s => ({ ...s, textAnalysisSummary: summary, clinicalAnalysisInput: summary })); // Also set as input for new module
  }, []);
  const setIsTextAnalyzing = useCallback((loading: boolean) => setState(s => ({ ...s, isTextAnalyzing: loading })), []);
  const constSetTextAnalysisError = useCallback((error: string | null) => setState(s => ({ ...s, textAnalysisError: error })), []);

  // Clinical Analysis (New Module)
  const setClinicalAnalysisInput = useCallback((input: string | null) => setState(s => ({ ...s, clinicalAnalysisInput: input })), []);
  const setGeneratedClinicalAnalysis = useCallback((analysis: string | null) => setState(s => ({ ...s, generatedClinicalAnalysis: analysis })), []);
  const setIsGeneratingClinicalAnalysis = useCallback((loading: boolean) => setState(s => ({ ...s, isGeneratingClinicalAnalysis: loading })), []);
  const setClinicalAnalysisError = useCallback((error: string | null) => setState(s => ({ ...s, clinicalAnalysisError: error })), []);


  const setDiagnosisInputData = useCallback((data: string | ((prev: string) => string)) => {
    setState(s => ({ ...s, diagnosisInputData: typeof data === 'function' ? data(s.diagnosisInputData) : data }));
  }, []);
  const setDiagnosisResults = useCallback((results: DiagnosisResult[] | null) => setState(s => ({ ...s, diagnosisResults: results })), []);
  const setIsDiagnosing = useCallback((loading: boolean) => setState(s => ({ ...s, isDiagnosing: loading })), []);
  const constSetDiagnosisError = useCallback((error: string | null) => setState(s => ({...s, diagnosisError: error})), []);


  // Medical Orders
  const setMedicalOrderInputs = useCallback((inputsOrUpdater: MedicalOrderInputState | ((prevState: MedicalOrderInputState) => MedicalOrderInputState)) => {
    setState(s => ({
      ...s,
      medicalOrderInputs: typeof inputsOrUpdater === 'function'
        ? inputsOrUpdater(s.medicalOrderInputs)
        : inputsOrUpdater,
    }));
  }, []);
  const setMedicalOrderOutput = useCallback((output: MedicalOrderOutputState) => setState(s => ({ ...s, medicalOrderOutput: output })), []);
  const setIsGeneratingMedicalOrder = useCallback((loading: boolean) => setState(s => ({ ...s, isGeneratingMedicalOrder: loading })), []);
  const setMedicalOrderError = useCallback((error: string | null) => setState(s => ({ ...s, medicalOrderError: error })), []);

  const clearImageModule = useCallback(() => {
    setState(s => ({
      ...s,
      imageFile: null,
      imageAnalysisSummary: null,
      isImageAnalyzing: false,
      imageAnalysisError: null,
    }));
  }, []);

  const clearPdfModule = useCallback(() => {
    setState(s => ({
      ...s,
      pdfFile: null,
      pdfExtractedNotes: null,
      pdfStructuredData: null,
      isPdfExtracting: false,
      pdfExtractionError: null,
    }));
  }, []);

  const clearTextModule = useCallback(() => {
    setState(s => ({
      ...s,
      clinicalNotesInput: '',
      textAnalysisSummary: null,
      isTextAnalyzing: false,
      textAnalysisError: null,
      clinicalAnalysisInput: null, // Clear input for next module
    }));
  }, []);

  const clearClinicalAnalysisModule = useCallback(() => {
    setState(s => ({
      ...s,
      // clinicalAnalysisInput is typically derived, but allow clearing if needed
      // clinicalAnalysisInput: null, 
      generatedClinicalAnalysis: null,
      isGeneratingClinicalAnalysis: false,
      clinicalAnalysisError: null,
    }));
  }, []);

  const clearDiagnosisModule = useCallback(() => {
    setState(s => ({
      ...s,
      diagnosisInputData: '',
      diagnosisResults: null,
      isDiagnosing: false,
      diagnosisError: null,
    }));
  }, []);

  const clearMedicalOrdersModule = useCallback(() => {
    setState(s => ({
      ...s,
      medicalOrderInputs: initialMedicalOrderInputs,
      medicalOrderOutput: initialMedicalOrderOutput,
      isGeneratingMedicalOrder: false,
      medicalOrderError: null,
    }));
  }, []);


  const contextValue: ClinicalDataContextType = {
    ...state,
    setImageFile,
    setImageAnalysisSummary,
    setIsImageAnalyzing,
    setImageAnalysisError,
    setPdfFile,
    setPdfExtractedNotes,
    setPdfStructuredData,
    setIsPdfExtracting,
    setPdfExtractionError,
    setClinicalNotesInput,
    setTextAnalysisSummary,
    setIsTextAnalyzing,
    setTextAnalysisError: constSetTextAnalysisError,
    // Clinical Analysis (New Module)
    setClinicalAnalysisInput,
    setGeneratedClinicalAnalysis,
    setIsGeneratingClinicalAnalysis,
    setClinicalAnalysisError,
    clearClinicalAnalysisModule,
    setDiagnosisInputData,
    setDiagnosisResults,
    setIsDiagnosing,
    setDiagnosisError: constSetDiagnosisError,
    setMedicalOrderInputs,
    setMedicalOrderOutput,
    setIsGeneratingMedicalOrder,
    setMedicalOrderError,
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearDiagnosisModule,
    clearMedicalOrdersModule,
  };

  return (
    <ClinicalDataContext.Provider value={contextValue}>
      {children}
    </ClinicalDataContext.Provider>
  );
};

export const useClinicalData = (): ClinicalDataContextType => {
  const context = useContext(ClinicalDataContext);
  if (context === undefined) {
    throw new Error('useClinicalData must be used within a ClinicalDataProvider');
  }
  return context;
};
