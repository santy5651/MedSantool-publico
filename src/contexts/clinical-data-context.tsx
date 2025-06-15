

'use client';

import type { ChatMessage, ClinicalDataContextType, ClinicalDataContextState, PdfStructuredData, DiagnosisResult, MedicalOrderInputState, MedicalOrderOutputState, NursingSurveillanceState, TreatmentPlanInputData, TreatmentPlanOutputState, ValidatedDiagnosis, PatientAdviceInputData, PatientAdviceOutputState, MedicalJustificationInputState, MedicalJustificationOutputState, DoseCalculatorInputState, DoseCalculatorOutputState, ImageAnalysisOutputState } from '@/types';
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

const initialTreatmentPlanInput: TreatmentPlanInputData = {
  clinicalAnalysis: null,
  textSummary: null,
  validatedDiagnoses: null,
};

const initialGeneratedTreatmentPlan: TreatmentPlanOutputState = {
  suggestedPlanText: null,
};

const initialPatientAdviceInput: PatientAdviceInputData = {
  clinicalAnalysis: null,
  textSummary: null,
  validatedDiagnoses: null,
};

const initialGeneratedPatientAdvice: PatientAdviceOutputState = {
  generalRecommendations: null,
  alarmSigns: null,
};

const initialJustificationInput: MedicalJustificationInputState = {
    conceptToJustify: null,
    relevantClinicalInfo: null,
};

const initialGeneratedJustification: MedicalJustificationOutputState = {
    justificationText: null,
};

const initialDoseCalculatorInputs: DoseCalculatorInputState = {
  patientWeight: '',
  medicationName: '',
  selectedMedication: null,
  selectedUsage: null,
  useSuggestedDose: false,
  doseToUse: '',
  doseUnit: '',
  isInfusion: false,
  infusionDrugAmount: '',
  infusionDrugAmountUnit: '',
  infusionTotalVolume: '',
};

const initialDoseCalculatorOutput: DoseCalculatorOutputState = {
  calculatedBolusDose: null,
  calculatedInfusionRate: null,
  calculatedConcentration: null,
  calculationWarning: null,
  calculationError: null,
};

const initialImageAnalysisOutput: ImageAnalysisOutputState = {
  summary: null,
  radiologistReading: null,
};


const initialState: ClinicalDataContextState = {
  imageFile: null,
  imageAnalysisOutput: initialImageAnalysisOutput,
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

  treatmentPlanInput: initialTreatmentPlanInput,
  generatedTreatmentPlan: initialGeneratedTreatmentPlan,
  isGeneratingTreatmentPlan: false,
  treatmentPlanError: null,

  patientAdviceInput: initialPatientAdviceInput,
  generatedPatientAdvice: initialGeneratedPatientAdvice,
  isGeneratingPatientAdvice: false,
  patientAdviceError: null,

  justificationInput: initialJustificationInput,
  generatedJustification: initialGeneratedJustification,
  isGeneratingJustification: false,
  justificationError: null,

  chatMessages: [],
  isChatResponding: false,
  chatError: null,

  doseCalculatorInputs: initialDoseCalculatorInputs,
  doseCalculatorOutput: initialDoseCalculatorOutput,
  isCalculatingDose: false,
  doseCalculationError: null,
};

const ClinicalDataContext = createContext<ClinicalDataContextType | undefined>(undefined);

export const ClinicalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClinicalDataContextState>(initialState);

  const setImageFile = useCallback((file: File | null) => setState(s => ({ ...s, imageFile: file })), []);
  const setImageAnalysisOutput = useCallback((output: ImageAnalysisOutputState) => setState(s => ({ ...s, imageAnalysisOutput: output })), []);
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
    setState(s => ({ ...s, textAnalysisSummary: summary, clinicalAnalysisInput: summary }));
  }, []);
  const setIsTextAnalyzing = useCallback((loading: boolean) => setState(s => ({ ...s, isTextAnalyzing: loading })), []);
  const constSetTextAnalysisError = useCallback((error: string | null) => setState(s => ({ ...s, textAnalysisError: error })), []);

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

  const setTreatmentPlanInput = useCallback(
    (updater: TreatmentPlanInputData | ((prevState: TreatmentPlanInputData) => TreatmentPlanInputData)) => {
      setState(s => ({
        ...s,
        treatmentPlanInput: typeof updater === 'function'
          ? updater(s.treatmentPlanInput)
          : updater,
      }));
    },
    []
  );
  const setGeneratedTreatmentPlan = useCallback((plan: TreatmentPlanOutputState) => setState(s => ({ ...s, generatedTreatmentPlan: plan })), []);
  const setIsGeneratingTreatmentPlan = useCallback((loading: boolean) => setState(s => ({ ...s, isGeneratingTreatmentPlan: loading })), []);
  const setTreatmentPlanError = useCallback((error: string | null) => setState(s => ({ ...s, treatmentPlanError: error})), []);

  const setPatientAdviceInput = useCallback(
    (updater: PatientAdviceInputData | ((prevState: PatientAdviceInputData) => PatientAdviceInputData)) => {
      setState(s => ({
        ...s,
        patientAdviceInput: typeof updater === 'function'
          ? updater(s.patientAdviceInput)
          : updater,
      }));
    },
    []
  );
  const setGeneratedPatientAdvice = useCallback((advice: PatientAdviceOutputState) => setState(s => ({ ...s, generatedPatientAdvice: advice })), []);
  const setIsGeneratingPatientAdvice = useCallback((loading: boolean) => setState(s => ({ ...s, isGeneratingPatientAdvice: loading })), []);
  const setPatientAdviceError = useCallback((error: string | null) => setState(s => ({ ...s, patientAdviceError: error})), []);

  const setJustificationInput = useCallback(
    (updater: MedicalJustificationInputState | ((prevState: MedicalJustificationInputState) => MedicalJustificationInputState)) => {
      setState(s => ({
        ...s,
        justificationInput: typeof updater === 'function'
          ? updater(s.justificationInput)
          : updater,
      }));
    },
    []
  );
  const setGeneratedJustification = useCallback((justification: MedicalJustificationOutputState) => setState(s => ({ ...s, generatedJustification: justification })), []);
  const setIsGeneratingJustification = useCallback((loading: boolean) => setState(s => ({ ...s, isGeneratingJustification: loading })), []);
  const setJustificationError = useCallback((error: string | null) => setState(s => ({ ...s, justificationError: error})), []);

  const addChatMessage = useCallback((message: ChatMessage) => setState(s => ({ ...s, chatMessages: [...s.chatMessages, message] })), []);
  const setChatMessages = useCallback((messages: ChatMessage[]) => setState(s => ({ ...s, chatMessages: messages })), []);
  const setIsChatResponding = useCallback((loading: boolean) => setState(s => ({ ...s, isChatResponding: loading })), []);
  const setChatError = useCallback((error: string | null) => setState(s => ({ ...s, chatError: error })), []);

  const setDoseCalculatorInputs = useCallback((inputsOrUpdater: DoseCalculatorInputState | ((prevState: DoseCalculatorInputState) => DoseCalculatorInputState)) => {
    setState(s => ({
      ...s,
      doseCalculatorInputs: typeof inputsOrUpdater === 'function'
        ? inputsOrUpdater(s.doseCalculatorInputs)
        : inputsOrUpdater,
    }));
  }, []);
  const setDoseCalculatorOutput = useCallback((output: DoseCalculatorOutputState) => setState(s => ({ ...s, doseCalculatorOutput: output })), []);
  const setIsCalculatingDose = useCallback((loading: boolean) => setState(s => ({ ...s, isCalculatingDose: loading })), []);
  const setDoseCalculationError = useCallback((error: string | null) => setState(s => ({ ...s, doseCalculationError: error})), []);


  const clearImageModule = useCallback(() => {
    setState(s => ({
      ...s,
      imageFile: null,
      imageAnalysisOutput: initialImageAnalysisOutput,
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
      clinicalAnalysisInput: null,
    }));
  }, []);

  const clearClinicalAnalysisModule = useCallback(() => {
    setState(s => ({
      ...s,
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

  const clearTreatmentPlanModule = useCallback(() => {
    setState(s => ({
      ...s,
      treatmentPlanInput: initialTreatmentPlanInput,
      generatedTreatmentPlan: initialGeneratedTreatmentPlan,
      isGeneratingTreatmentPlan: false,
      treatmentPlanError: null,
    }));
  }, []);

  const clearPatientAdviceModule = useCallback(() => {
    setState(s => ({
      ...s,
      patientAdviceInput: initialPatientAdviceInput,
      generatedPatientAdvice: initialGeneratedPatientAdvice,
      isGeneratingPatientAdvice: false,
      patientAdviceError: null,
    }));
  }, []);

  const clearMedicalJustificationModule = useCallback(() => {
    setState(s => ({
      ...s,
      justificationInput: initialJustificationInput,
      generatedJustification: initialGeneratedJustification,
      isGeneratingJustification: false,
      justificationError: null,
    }));
  }, []);

  const clearChatModule = useCallback(() => {
    setState(s => ({
      ...s,
      chatMessages: [],
      isChatResponding: false,
      chatError: null,
    }));
  }, []);

  const clearDoseCalculatorModule = useCallback(() => {
    setState(s => ({
      ...s,
      doseCalculatorInputs: initialDoseCalculatorInputs,
      doseCalculatorOutput: initialDoseCalculatorOutput,
      isCalculatingDose: false,
      doseCalculationError: null,
    }));
  }, []);


  const contextValue: ClinicalDataContextType = {
    ...state,
    setImageFile,
    setImageAnalysisOutput,
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
    setClinicalAnalysisInput,
    setGeneratedClinicalAnalysis,
    setIsGeneratingClinicalAnalysis,
    setClinicalAnalysisError,
    setDiagnosisInputData,
    setDiagnosisResults,
    setIsDiagnosing,
    setDiagnosisError: constSetDiagnosisError,
    setMedicalOrderInputs,
    setMedicalOrderOutput,
    setIsGeneratingMedicalOrder,
    setMedicalOrderError,
    setTreatmentPlanInput,
    setGeneratedTreatmentPlan,
    setIsGeneratingTreatmentPlan,
    setTreatmentPlanError,
    setPatientAdviceInput,
    setGeneratedPatientAdvice,
    setIsGeneratingPatientAdvice,
    setPatientAdviceError,
    setJustificationInput,
    setGeneratedJustification,
    setIsGeneratingJustification,
    setJustificationError,
    addChatMessage,
    setChatMessages,
    setIsChatResponding,
    setChatError,
    setDoseCalculatorInputs,
    setDoseCalculatorOutput,
    setIsCalculatingDose,
    setDoseCalculationError,
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearClinicalAnalysisModule,
    clearDiagnosisModule,
    clearMedicalOrdersModule,
    clearTreatmentPlanModule,
    clearPatientAdviceModule,
    clearMedicalJustificationModule,
    clearChatModule,
    clearDoseCalculatorModule,
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

    
