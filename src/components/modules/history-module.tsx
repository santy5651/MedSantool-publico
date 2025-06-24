
'use client';

import React, { useState, useRef } from 'react';
import { useHistoryStore } from '@/hooks/use-history-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Upload, Download, FileText, Image as ImageIcon, MessageSquareText, Lightbulb, Info, AlertCircle, CheckCircle, Settings2, FileEdit, Star, Brain, ListChecks, UserCheck, FileSignature, Bot, Calculator, FileJson, Utensils, ShieldPlus, FileOutput, HelpCircle, Stethoscope } from 'lucide-react';
import type { HistoryEntry, ModuleType, DiagnosisResult, PdfStructuredData, MedicalOrderOutputState, TreatmentPlanOutputState, PatientAdviceOutputState, MedicalJustificationOutputState, ChatMessage as ChatMessageType, DoseCalculatorInputState, DoseCalculatorOutputState, ImageAnalysisOutputState, PatientAdviceInputData, DischargeSummaryInputState, DischargeSummaryOutputState, InterrogationQuestion, ClinicalAnalysisOutputState, ValidatedDiagnosis } from '@/types';
import type { GenerateMedicalOrderInput } from '@/ai/flows/generate-medical-order';
import type { ChatMessageHistoryItem } from '@/ai/flows/medical-assistant-chat-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useClinicalData } from '@/contexts/clinical-data-context'; 
import { useToast } from '@/hooks/use-toast'; 


const moduleIcons: Record<ModuleType, LucideIcon> = {
  ImageAnalysis: ImageIcon,
  PdfExtraction: FileText,
  TextAnalysis: MessageSquareText,
  InterrogationQuestions: HelpCircle,
  PhysicalExam: Stethoscope,
  ClinicalAnalysis: Brain, 
  DiagnosisSupport: Lightbulb,
  MedicalOrders: FileEdit,
  TreatmentPlanSuggestion: ListChecks,
  PatientAdvice: UserCheck,
  MedicalJustification: FileSignature,
  MedicalAssistantChat: Bot,
  DoseCalculator: Calculator,
  DischargeSummary: FileOutput,
};

const statusIcons: Record<HistoryEntry['status'], LucideIcon> = {
  completed: CheckCircle,
  error: AlertCircle,
  pending: Settings2, 
};

const statusColors: Record<HistoryEntry['status'], string> = {
  completed: 'text-green-600',
  error: 'text-red-600',
  pending: 'text-yellow-600',
};
const statusBadgeVariant: Record<HistoryEntry['status'], "default" | "secondary" | "destructive" | "outline"> = {
  completed: 'default', 
  error: 'destructive',
  pending: 'secondary',
};

const initialNursingSurveillanceState: NursingSurveillanceState = {
  thermalCurve: false,
  monitorPain: false,
  monitorWounds: false,
  monitorBleeding: false,
  vigilarDiuresis: false,
  cuidadosCateterVenoso: false,
  cuidadosSondaVesical: false,
  cuidadosDrenajesQuirurgicos: false,
  cuidadosTraqueostomia: false,
  controlGlicemicoTurno: false,
  controlGlicemicoAyunas: false,
  hojaNeurologica: false,
  realizarCuraciones: false,
  restriccionHidrica800: false,
  controlLiquidosAdminElim: false,
  registroBalanceHidrico24h: false,
  calcularDiuresisHoraria: false,
  pesoDiario: false,
};

const initialPatientAdviceInputData: PatientAdviceInputData = {
  clinicalAnalysis: null,
  textSummary: null,
  validatedDiagnoses: null,
  manualDiagnosisOrAnalysis: null,
};

const initialGeneratedPatientAdvice: PatientAdviceOutputState = {
  generalRecommendations: null,
  alarmSigns: null,
  dietaryIndications: null,
  generalCare: null,
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

const initialClinicalAnalysisOutput: ClinicalAnalysisOutputState = {
  comprehensiveAnalysis: null,
  focusedAnalysis: null,
};

const initialDischargeSummaryInputs: DischargeSummaryInputState = {
  formulaMedica: null,
  conciliacionMedicamentosa: null,
  laboratoriosControl: null,
  proximoControl: null,
  tramites: null,
  incapacidad: null,
  signosAlarma: null,
  indicacionesDieta: null,
  cuidadosGenerales: null,
  recomendacionesGenerales: null,
  condicionesSalida: null,
};

const initialGeneratedDischargeSummary: DischargeSummaryOutputState = {
  generatedSummary: null,
};


export function HistoryModule() {
  const { 
    historyEntries, 
    isAutoSaveEnabled, 
    toggleAutoSave, 
    deleteHistoryEntry, 
    clearHistory, 
    exportHistory, 
    importHistory 
  } = useHistoryStore();

  const clinicalData = useClinicalData(); 
  const { toast } = useToast(); 

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'add'>('add');
  const [fileToImport, setFileToImport] = useState<File | null>(null);


  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToImport(file);
    }
  };
  
  const confirmImport = () => {
    if (fileToImport) {
      importHistory(fileToImport, importMode);
      setFileToImport(null); 
    }
  };

  const handleLoadEntryToModule = (entry: HistoryEntry) => {
    if (!entry) return;

    const outputData = entry.fullOutput as any; 
    const inputData = entry.fullInput as any;

    try {
      switch (entry.module) {
        case 'ImageAnalysis':
          clinicalData.setImageFile(null); 
          if (outputData && (outputData.summary !== undefined || outputData.radiologistReading !== undefined)) {
            clinicalData.setImageAnalysisOutput({
              summary: outputData.summary || null,
              radiologistReading: outputData.radiologistReading || null,
            });
          } else {
            clinicalData.setImageAnalysisOutput(initialImageAnalysisOutput);
          }
          clinicalData.setImageAnalysisError(outputData?.error || null);
          toast({ title: "Datos Cargados", description: "Resultados de análisis de imagen cargados. Seleccione un nuevo archivo para re-analizar." });
          break;
        case 'PdfExtraction':
          clinicalData.setPdfFile(null); 
          if (outputData && outputData.clinicalNotes) {
            clinicalData.setPdfExtractedNotes(outputData.clinicalNotes);
          }
          if (outputData && outputData.structuredData) {
            clinicalData.setPdfStructuredData(outputData.structuredData as PdfStructuredData[]);
          }
          clinicalData.setPdfExtractionError(outputData?.error || null);
          toast({ title: "Datos Cargados", description: "Datos de PDF cargados. Seleccione un nuevo archivo para re-analizar." });
          break;
        case 'TextAnalysis':
          clinicalData.setClinicalNotesInput(inputData as string || '');
          if (outputData && outputData.improvedText) {
            clinicalData.setTextAnalysisSummary(outputData.improvedText);
          }
          clinicalData.setTextAnalysisError(outputData?.error || null);
          break;
        case 'InterrogationQuestions':
          clinicalData.setClinicalNotesInput(inputData as string || '');
          clinicalData.setTextAnalysisSummary(inputData as string || '');
          if (outputData && outputData.questions) {
            clinicalData.setGeneratedInterrogationQuestions(outputData.questions);
          } else {
            clinicalData.setGeneratedInterrogationQuestions(null);
          }
          clinicalData.setInterrogationQuestionsError(outputData?.error || null);
          break;
        case 'PhysicalExam':
          clinicalData.setPhysicalExamInput(inputData.diagnoses as ValidatedDiagnosis[] || null);
          if (outputData && outputData.physicalExamText) {
            clinicalData.setGeneratedPhysicalExam(outputData.physicalExamText);
          }
          clinicalData.setPhysicalExamError(outputData?.error || null);
          break;
        case 'ClinicalAnalysis':
          clinicalData.setClinicalAnalysisInput(inputData as string || null);
           if (outputData && (outputData.comprehensiveAnalysis || outputData.focusedAnalysis)) {
            clinicalData.setGeneratedClinicalAnalysis(outputData as ClinicalAnalysisOutputState);
          } else {
            clinicalData.setGeneratedClinicalAnalysis(initialClinicalAnalysisOutput);
          }
          clinicalData.setClinicalAnalysisError(outputData?.error || null);
          break;
        case 'DiagnosisSupport':
          clinicalData.setDiagnosisInputData(inputData as string || '');
          if (outputData && !outputData.error) {
            clinicalData.setDiagnosisResults(outputData as DiagnosisResult[]);
          } else {
            clinicalData.setDiagnosisResults(null);
          }
          clinicalData.setDiagnosisError(outputData?.error || null);
          break;
        case 'MedicalOrders':
          if (inputData && typeof inputData === 'object') {
            const fi = inputData as GenerateMedicalOrderInput; 
            clinicalData.setMedicalOrderInputs({
                orderType: fi.orderType || '',
                oxygen: fi.oxygen || "NO REQUIERE OXÍGENO",
                isolation: fi.isolation || "NO REQUIERE AISLAMIENTO",
                diet: fi.diet || "",
                medicationsInput: fi.medicationsInput || "",
                noMedicationReconciliation: fi.medicationReconciliationInput === "NO TIENE CONCILIACIÓN MEDICAMENTOSA" || !fi.medicationReconciliationInput,
                medicationReconciliationInput: fi.medicationReconciliationInput || "",
                specialtyFollowUp: fi.specialtyFollowUp || "",
                fallRisk: fi.fallRisk || "RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA",
                paduaScale: fi.paduaScale || "",
                nursingSurveillance: fi.surveillanceNursing || initialNursingSurveillanceState,
                transferConditions: fi.transferConditions || '',
                specialConsiderations: fi.specialConsiderations || "",
            });
          }
          if (outputData && outputData.generatedOrderText) {
            clinicalData.setMedicalOrderOutput(outputData as MedicalOrderOutputState);
          } else {
             clinicalData.setMedicalOrderOutput({ generatedOrderText: null });
          }
          clinicalData.setMedicalOrderError(outputData?.error || null);
          break;
        case 'TreatmentPlanSuggestion':
          if (inputData && typeof inputData === 'object') {
             clinicalData.setTreatmentPlanInput(inputData as TreatmentPlanInputData);
          }
          if (outputData && outputData.suggestedPlanText) {
            clinicalData.setGeneratedTreatmentPlan(outputData as TreatmentPlanOutputState);
          } else {
            clinicalData.setGeneratedTreatmentPlan({ suggestedPlanText: null });
          }
          clinicalData.setTreatmentPlanError(outputData?.error || null);
          break;
        case 'PatientAdvice':
          if (inputData && typeof inputData === 'object') {
            const loadedPatientAdviceInput: PatientAdviceInputData = {
                clinicalAnalysis: (inputData as PatientAdviceInputData).clinicalAnalysis || null,
                textSummary: (inputData as PatientAdviceInputData).textSummary || null,
                validatedDiagnoses: (inputData as PatientAdviceInputData).validatedDiagnoses || null,
                manualDiagnosisOrAnalysis: (inputData as PatientAdviceInputData).manualDiagnosisOrAnalysis || null,
            };
            clinicalData.setPatientAdviceInput(loadedPatientAdviceInput);
          } else {
             clinicalData.setPatientAdviceInput(initialPatientAdviceInputData);
          }
          if (outputData && (outputData.generalRecommendations || outputData.alarmSigns || outputData.dietaryIndications || outputData.generalCare)) {
            clinicalData.setGeneratedPatientAdvice(outputData as PatientAdviceOutputState);
          } else {
            clinicalData.setGeneratedPatientAdvice(initialGeneratedPatientAdvice);
          }
          clinicalData.setPatientAdviceError(outputData?.error || null);
          break;
        case 'MedicalJustification':
          if (inputData && typeof inputData === 'object') {
            clinicalData.setJustificationInput(inputData as MedicalJustificationInputState);
          } else {
            clinicalData.setJustificationInput(initialJustificationInput);
          }
          if (outputData && outputData.justificationText) {
            clinicalData.setGeneratedJustification(outputData as MedicalJustificationOutputState);
          } else {
            clinicalData.setGeneratedJustification(initialGeneratedJustification);
          }
          clinicalData.setJustificationError(outputData?.error || null);
          break;
        case 'MedicalAssistantChat':
          if (outputData && outputData.messages && Array.isArray(outputData.messages)) {
            const loadedMessages: ChatMessageType[] = outputData.messages.map((msg: any, index: number) => ({
              id: `loaded-${Date.now()}-${index}`, 
              sender: msg.sender, 
              text: msg.text,
              timestamp: msg.timestamp || Date.now(), 
              error: msg.error,
            }));
            clinicalData.setChatMessages(loadedMessages);
          } else {
            clinicalData.setChatMessages([]);
          }
          clinicalData.setChatError(outputData?.error || null);
          break;
        case 'DoseCalculator':
          if (inputData && typeof inputData === 'object') {
            clinicalData.setDoseCalculatorInputs(inputData as DoseCalculatorInputState);
          } else {
             clinicalData.setDoseCalculatorInputs(initialDoseCalculatorInputs);
          }
          if (outputData && (outputData.calculatedBolusDose || outputData.calculatedInfusionRate || outputData.calculationError || outputData.calculationWarning)) {
            clinicalData.setDoseCalculatorOutput(outputData as DoseCalculatorOutputState);
            clinicalData.setDoseCalculationError(outputData.calculationError || null);
          } else {
            clinicalData.setDoseCalculatorOutput(initialDoseCalculatorOutput);
            clinicalData.setDoseCalculationError(null);
          }
          break;
        case 'DischargeSummary':
          if (inputData && typeof inputData === 'object') {
             clinicalData.setDischargeSummaryInputs(inputData as DischargeSummaryInputState);
          } else {
             clinicalData.setDischargeSummaryInputs(initialDischargeSummaryInputs);
          }
          if (outputData && outputData.generatedSummary) {
             clinicalData.setGeneratedDischargeSummary(outputData as DischargeSummaryOutputState);
          } else {
             clinicalData.setGeneratedDischargeSummary(initialGeneratedDischargeSummary);
          }
          clinicalData.setDischargeSummaryError(outputData?.error || null);
          break;
        default:
          toast({ variant: "destructive", title: "Módulo Desconocido", description: "No se puede cargar esta entrada." });
          return;
      }
      toast({ title: "Datos Cargados", description: `Se cargaron los datos de "${entry.module.replace(/([A-Z])/g, ' $1').trim()}" al módulo.` });
      
      const moduleId = `${entry.module.charAt(0).toLowerCase() + entry.module.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase()}-module`;
      const moduleElement = document.getElementById(moduleId);
      moduleElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error("Error loading entry to module:", error);
        toast({ variant: "destructive", title: "Error al Cargar", description: "No se pudieron cargar los datos al módulo." });
    }
  };


  const renderFullOutput = (entry: HistoryEntry) => {
    if (entry.status === 'error' && entry.errorDetails) {
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-destructive/10 rounded-md">{entry.errorDetails}</pre>;
    }
    if (!entry.fullOutput) return <p className="text-xs text-muted-foreground">No hay detalles completos de salida.</p>;

    const output = typeof entry.fullOutput === 'string' && (entry.fullOutput.startsWith('{') || entry.fullOutput.startsWith('['))
        ? JSON.parse(entry.fullOutput) 
        : entry.fullOutput;

    try {
      switch (entry.module) {
        case 'ImageAnalysis':
          if (typeof output === 'object' && output !== null && ('summary' in output || 'radiologistReading' in output)) {
            const imageOutput = output as ImageAnalysisOutputState;
            return (
              <Accordion type="single" collapsible className="w-full text-xs">
                <AccordionItem value="image-output">
                  <AccordionTrigger>Ver Detalles del Análisis de Imagen</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {imageOutput.summary && (<div><strong>Resumen de Hallazgos:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{imageOutput.summary}</pre></div>)}
                    {imageOutput.radiologistReading && (<div><strong><FileJson className="inline h-4 w-4 mr-1" />Lectura Radiológica:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{imageOutput.radiologistReading}</pre></div>)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          }
          break;
        case 'DiagnosisSupport':
          if (Array.isArray(output)) {
            const diagnoses = output as DiagnosisResult[];
            return (
              <div className="overflow-x-auto rounded-md border text-xs">
                <Table>
                  <TableHeader><TableRow><TableHead>CIE-10</TableHead><TableHead>Descripción</TableHead><TableHead>Confianza</TableHead><TableHead>Validado</TableHead><TableHead>Principal</TableHead></TableRow></TableHeader>
                  <TableBody>{diagnoses.map((diag, idx) => (<TableRow key={idx} className={diag.isPrincipal ? "bg-primary/10" : ""}><TableCell>{diag.code}</TableCell><TableCell>{diag.description}</TableCell><TableCell>{(diag.confidence * 100).toFixed(0)}%</TableCell><TableCell>{diag.isValidated ? 'Sí' : 'No'}</TableCell><TableCell>{diag.isPrincipal ? <Star className="h-4 w-4 text-accent fill-accent" /> : '-'}</TableCell></TableRow>))}</TableBody>
                </Table>
              </div>
            );
          }
          break;
        case 'PdfExtraction':
          if (typeof output === 'object' && output !== null && 'structuredData' in output) {
            const pdfOutput = output as { structuredData: PdfStructuredData[], clinicalNotes: string };
            return (
              <Accordion type="single" collapsible className="w-full text-xs">
                <AccordionItem value="pdf-output"><AccordionTrigger>Ver Detalles de Extracción PDF</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {pdfOutput.structuredData && pdfOutput.structuredData.length > 0 && (<div><strong>Datos Estructurados:</strong><ul className="list-disc pl-4">{pdfOutput.structuredData.map((item, idx) => <li key={idx}><strong>{item.key}:</strong> {item.value}</li>)}</ul></div>)}
                    {pdfOutput.clinicalNotes && (<div><strong>Notas Clínicas:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{pdfOutput.clinicalNotes}</pre></div>)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          }
          break;
        case 'MedicalOrders':
          if (typeof output === 'object' && output !== null && 'generatedOrderText' in output) { return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as MedicalOrderOutputState).generatedOrderText}</pre>; }
          break;
        case 'ClinicalAnalysis':
          if (typeof output === 'object' && output !== null && ('comprehensiveAnalysis' in output || 'focusedAnalysis' in output)) {
            const analysisOutput = output as ClinicalAnalysisOutputState;
            return (
              <div className="space-y-2 text-xs">
                {analysisOutput.comprehensiveAnalysis && (<div><strong>Análisis Completo:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{analysisOutput.comprehensiveAnalysis}</pre></div>)}
                {analysisOutput.focusedAnalysis && (<div><strong>Análisis Enfocado:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{analysisOutput.focusedAnalysis}</pre></div>)}
              </div>
            );
          }
          break;
        case 'TextAnalysis':
          if (typeof output === 'object' && output !== null && 'improvedText' in output) { return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as {improvedText: string}).improvedText}</pre>; }
          break;
        case 'InterrogationQuestions':
          if (typeof output === 'object' && output !== null && 'questions' in output) {
            const questions = output.questions as InterrogationQuestion[];
            if (questions && questions.length > 0) {
              return (
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  {questions.map((q, i) => <li key={i}>{q.question} <span className="text-muted-foreground">({q.rationale})</span></li>)}
                </ul>
              );
            }
          }
          break;
        case 'PhysicalExam':
          if (typeof output === 'object' && output !== null && 'physicalExamText' in output) {
            return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as {physicalExamText: string}).physicalExamText}</pre>;
          }
          break;
        case 'TreatmentPlanSuggestion':
          if (typeof output === 'object' && output !== null && 'suggestedPlanText' in output) { return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as TreatmentPlanOutputState).suggestedPlanText}</pre>; }
          break;
        case 'PatientAdvice':
          if (typeof output === 'object' && output !== null && ('generalRecommendations' in output || 'alarmSigns' in output)) {
            const adviceOutput = output as PatientAdviceOutputState;
            return (
              <div className="space-y-2 text-xs">
                {adviceOutput.generalRecommendations && (<div><strong><UserCheck className="inline h-4 w-4 mr-1"/>Recomendaciones Generales:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{adviceOutput.generalRecommendations}</pre></div>)}
                {adviceOutput.dietaryIndications && (<div><strong><Utensils className="inline h-4 w-4 mr-1"/>Indicaciones sobre la Dieta:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{adviceOutput.dietaryIndications}</pre></div>)}
                {adviceOutput.generalCare && (<div><strong><ShieldPlus className="inline h-4 w-4 mr-1"/>Cuidados Generales:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{adviceOutput.generalCare}</pre></div>)}
                {adviceOutput.alarmSigns && (<div><strong><AlertTriangle className="inline h-4 w-4 mr-1 text-destructive"/>Signos de Alarma:</strong><pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{adviceOutput.alarmSigns}</pre></div>)}
              </div>
            );
          }
          break;
        case 'MedicalJustification':
          if (typeof output === 'object' && output !== null && 'justificationText' in output) { return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as MedicalJustificationOutputState).justificationText}</pre>; }
          break;
        case 'MedicalAssistantChat':
          if (typeof output === 'object' && output !== null && 'messages' in output) {
            const chatOutput = output as { messages: Array<{sender: 'user' | 'ai', text: string, error?: boolean}>, error?: string };
            return (<div className="space-y-1 text-xs">{chatOutput.messages.map((msg, idx) => (<div key={idx} className={`p-1.5 rounded-md ${msg.sender === 'user' ? 'bg-primary/10 text-primary-foreground/80' : 'bg-muted/50'} ${msg.error ? 'border border-destructive text-destructive' : ''}`}><strong>{msg.sender === 'user' ? 'Usuario:' : 'Asistente:'}</strong> {msg.text}</div>))}{chatOutput.error && <p className="text-destructive mt-1">Error del Chat: {chatOutput.error}</p>}</div>);
          }
          break;
        case 'DoseCalculator':
          if (typeof output === 'object' && output !== null) {
            const doseOutput = output as DoseCalculatorOutputState;
            if (doseOutput.calculationError) return <pre className="text-xs whitespace-pre-wrap p-2 bg-destructive/10 rounded-md">{doseOutput.calculationError}</pre>;
            return (
              <div className="space-y-1 text-xs p-2 bg-muted/30 rounded-md">
                {doseOutput.calculatedBolusDose && <p><strong>Bolo:</strong> {doseOutput.calculatedBolusDose}</p>}
                {doseOutput.calculatedConcentration && <p><strong>Concentración:</strong> {doseOutput.calculatedConcentration}</p>}
                {doseOutput.calculatedInfusionRate && <p><strong>Perfusión:</strong> {doseOutput.calculatedInfusionRate}</p>}
                {doseOutput.calculationWarning && <p className="text-yellow-700 dark:text-yellow-500"><strong>Advertencia:</strong> {doseOutput.calculationWarning}</p>}
                {(!doseOutput.calculatedBolusDose && !doseOutput.calculatedInfusionRate && !doseOutput.calculationWarning) && <p>No se generaron resultados específicos.</p>}
              </div>
            );
          }
          break;
        case 'DischargeSummary':
          if (typeof output === 'object' && output !== null && 'generatedSummary' in output) {
            return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as DischargeSummaryOutputState).generatedSummary}</pre>;
          }
          break;
      }
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{typeof output === 'string' ? output : JSON.stringify(output, null, 2)}</pre>;
    } catch (e) { 
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{String(entry.fullOutput)}</pre>;
    }
  };
  
  const renderFullInput = (entry: HistoryEntry) => {
     if (!entry.fullInput) return <p className="text-xs text-muted-foreground">No hay detalles de entrada.</p>;
     
     if (typeof entry.fullInput === 'string' && (entry.fullInput.startsWith('Data URI for') || entry.fullInput === '')) {
        return <p className="text-xs text-muted-foreground">{entry.fullInput || "Entrada vacía"}</p>; 
     }

     if (typeof entry.fullInput === 'object') {
        if (entry.module === 'MedicalAssistantChat' && 'userInput' in entry.fullInput && 'chatHistory' in entry.fullInput) {
            const chatInput = entry.fullInput as {userInput: string, chatHistory: ChatMessageHistoryItem[]};
            return (
                <div className="space-y-1 text-xs">
                    {chatInput.chatHistory && chatInput.chatHistory.length > 0 && (
                         <div>
                            <strong>Historial Previo:</strong>
                            {chatInput.chatHistory.map((msg, idx) => (
                                <div key={idx} className="ml-2 p-1 rounded-sm bg-muted/20">
                                    <em>{msg.sender === 'user' ? 'Usuario:' : 'Asistente:'}</em> {msg.text}
                                </div>
                            ))}
                        </div>
                    )}
                    <div><strong>Entrada Actual:</strong> {chatInput.userInput}</div>
                </div>
            );
        }
        if (entry.module === 'DoseCalculator') {
            const doseInput = entry.fullInput as DoseCalculatorInputState;
            return (
                <div className="space-y-1 text-xs p-2 bg-muted/30 rounded-md">
                    <p><strong>Peso:</strong> {doseInput.patientWeight} kg</p>
                    <p><strong>Medicamento:</strong> {doseInput.selectedMedication?.name || doseInput.medicationName}</p>
                    {doseInput.selectedUsage && <p><strong>Uso:</strong> {doseInput.selectedUsage.protocol}</p>}
                    <p><strong>Dosis Usada:</strong> {doseInput.doseToUse} {doseInput.doseUnit}</p>
                    {doseInput.isInfusion && (
                        <>
                          <p><strong>Infusión - Cantidad Droga:</strong> {doseInput.infusionDrugAmount} {doseInput.infusionDrugAmountUnit}</p>
                          <p><strong>Infusión - Volumen Total:</strong> {doseInput.infusionTotalVolume} ml</p>
                        </>
                    )}
                </div>
            );
        }
        if (entry.module === 'PatientAdvice') {
            const adviceInput = entry.fullInput as PatientAdviceInputData;
            return (
                 <div className="space-y-1 text-xs p-2 bg-muted/30 rounded-md">
                    {adviceInput.manualDiagnosisOrAnalysis && <p><strong>Dx/Análisis Manual:</strong> {adviceInput.manualDiagnosisOrAnalysis}</p>}
                    {adviceInput.validatedDiagnoses && adviceInput.validatedDiagnoses.length > 0 && (
                        <div><strong>Dx Validados:</strong> <ul className="list-disc pl-4">{adviceInput.validatedDiagnoses.map(dx => <li key={dx.code}>{dx.code}: {dx.description}</li>)}</ul></div>
                    )}
                    {adviceInput.clinicalAnalysis && <p><strong>Análisis Clínico IA:</strong> {adviceInput.clinicalAnalysis.substring(0,50)}...</p>}
                    {adviceInput.textSummary && <p><strong>Resumen Texto:</strong> {adviceInput.textSummary.substring(0,50)}...</p>}
                 </div>
            );
        }
        if (entry.module === 'DischargeSummary') {
          const dischargeInput = entry.fullInput as DischargeSummaryInputState;
          return (
            <div className="space-y-1 text-xs p-2 bg-muted/30 rounded-md">
              {Object.entries(dischargeInput).map(([key, value]) => 
                value && <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(value).substring(0,70)}{String(value).length > 70 ? '...' : ''}</p>
              )}
            </div>
          );
        }
        if (entry.module === 'PhysicalExam' && 'diagnoses' in entry.fullInput) {
           const examInput = entry.fullInput as { diagnoses: ValidatedDiagnosis[] };
           return (
                <div className="space-y-1 text-xs p-2 bg-muted/30 rounded-md">
                    <div><strong>Dx Validados:</strong> <ul className="list-disc pl-4">{examInput.diagnoses.map(dx => <li key={dx.code}>{dx.code}: {dx.description}</li>)}</ul></div>
                </div>
           );
        }
        return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{JSON.stringify(entry.fullInput, null, 2)}</pre>;
     }
     return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{String(entry.fullInput)}</pre>;
  }

  return (
    <Card className="h-full flex flex-col shadow-lg" id="history-module">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
            <Settings2 className="mr-3 h-6 w-6 text-primary" />
            Historial de Trabajo y Configuración
        </CardTitle>
        <CardDescription>
            Registro de operaciones, gestión de guardado y opciones de importación/exportación.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="autosave-switch"
              checked={isAutoSaveEnabled}
              onCheckedChange={toggleAutoSave}
              aria-label="Activar guardado automático"
            />
            <Label htmlFor="autosave-switch" className="text-sm">Guardado Automático</Label>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Importar</Button>
            <input type="file" ref={importFileRef} onChange={handleFileImportChange} accept=".json" className="hidden" />
            <Button variant="outline" size="sm" onClick={exportHistory}><Download className="mr-2 h-4 w-4" /> Exportar</Button>
          </div>
        </div>
        
        <div className="border-t pt-4 flex-grow overflow-hidden">
          {historyEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">El historial está vacío.</p>
          ) : (
            <ScrollArea className="h-full pr-3"> 
              <ul className="space-y-3">
                {historyEntries.map((entry) => {
                  const ModuleIcon = moduleIcons[entry.module] || Info;
                  const StatusIcon = statusIcons[entry.status];
                  return (
                    <li key={entry.id} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <ModuleIcon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{entry.module.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.timestamp), "dd MMM yyyy, HH:mm:ss", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={statusBadgeVariant[entry.status]} className="text-xs capitalize">
                            <StatusIcon className={`mr-1 h-3 w-3 ${statusColors[entry.status]}`} />
                            {entry.status}
                          </Badge>
                           <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEntryToDelete(entry.id!)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left"><p>Eliminar Entrada</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <p><strong>Entrada:</strong> {entry.inputSummary}</p>
                        <p><strong>Salida:</strong> {entry.outputSummary}</p>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="xs" className="text-xs px-2 py-1 h-auto">
                                <Info className="mr-1 h-3 w-3"/> Detalles Entrada
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start" className="w-80 max-h-96 overflow-y-auto bg-popover p-2 shadow-lg rounded-md border">
                              {renderFullInput(entry)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="xs" className="text-xs px-2 py-1 h-auto">
                                <Info className="mr-1 h-3 w-3"/> Detalles Salida
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start" className="w-96 max-h-[500px] overflow-y-auto bg-popover p-2 shadow-lg rounded-md border">
                              {renderFullOutput(entry)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="xs" className="text-xs px-2 py-1 h-auto" onClick={() => handleLoadEntryToModule(entry)}>
                                  <Upload className="mr-1 h-3 w-3" /> Cargar
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right"><p>Cargar al Módulo</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>

        <div className="border-t pt-4">
            <Button variant="destructive" onClick={() => setShowClearConfirm(true)} className="w-full" disabled={historyEntries.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" /> Borrar Todo el Historial
            </Button>
        </div>

        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente todas las entradas del historial.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { clearHistory(); setShowClearConfirm(false); }}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={entryToDelete !== null} onOpenChange={() => setEntryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar esta entrada?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La entrada seleccionada se eliminará permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (entryToDelete) deleteHistoryEntry(entryToDelete); setEntryToDelete(null); }}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={fileToImport !== null} onOpenChange={() => setFileToImport(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Importar Historial</AlertDialogTitle>
              <AlertDialogDescription>
                Seleccione cómo desea importar las entradas del archivo: <strong>{fileToImport?.name}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-2">
                <Button onClick={() => { setImportMode('replace'); confirmImport(); }} className="w-full">Reemplazar Historial Actual</Button>
                <Button onClick={() => { setImportMode('add'); confirmImport(); }} className="w-full" variant="outline">Agregar al Historial Actual</Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFileToImport(null)}>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}

// Helper Button size variant if needed, or adjust styling directly
declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "xs";
  }
}
