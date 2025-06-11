'use client';

import type { ClinicalDataContextType, ClinicalDataContextState, PdfStructuredData, DiagnosisResult } from '@/types';
import React, { createContext, useContext, useState, useCallback } from 'react';

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

  diagnosisInputData: '',
  diagnosisResults: null,
  isDiagnosing: false,
  diagnosisError: null,
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

  const setClinicalNotesInput = useCallback((notes: string) => setState(s => ({ ...s, clinicalNotesInput: notes })), []);
  const setTextAnalysisSummary = useCallback((summary: string | null) => setState(s => ({ ...s, textAnalysisSummary: summary })), []);
  const setIsTextAnalyzing = useCallback((loading: boolean) => setState(s => ({ ...s, isTextAnalyzing: loading })), []);
  const setTextAnalysisError = useCallback((error: string | null) => setState(s => ({ ...s, textAnalysisError: error })), []);

  const setDiagnosisInputData = useCallback((data: string) => setState(s => ({ ...s, diagnosisInputData: data })), []);
  const setDiagnosisResults = useCallback((results: DiagnosisResult[] | null) => setState(s => ({ ...s, diagnosisResults: results })), []);
  const setIsDiagnosing = useCallback((loading: boolean) => setState(s => ({ ...s, isDiagnosing: loading })), []);
  const setDiagnosisError = useCallback((error: string | null) => setState(s => ({...s, diagnosisError: error})), []);

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
    setTextAnalysisError,
    setDiagnosisInputData,
    setDiagnosisResults,
    setIsDiagnosing,
    setDiagnosisError,
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearDiagnosisModule,
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
