
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateClinicalAnalysis, type GenerateClinicalAnalysisOutput } from '@/ai/flows/generate-clinical-analysis';
import { useToast } from '@/hooks/use-toast';
import { FileText, Brain, Eraser, Send, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

export function ClinicalAnalysisModule() {
  const {
    clinicalAnalysisInput, setClinicalAnalysisInput, // This will be populated from textAnalysisSummary
    textAnalysisSummary, // Used to auto-populate clinicalAnalysisInput
    generatedClinicalAnalysis, setGeneratedClinicalAnalysis,
    isGeneratingClinicalAnalysis, setIsGeneratingClinicalAnalysis,
    clinicalAnalysisError, setClinicalAnalysisError,
    setDiagnosisInputData, // To send output to diagnosis module
    clearClinicalAnalysisModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  // Auto-populate clinicalAnalysisInput when textAnalysisSummary changes
  useEffect(() => {
    if (textAnalysisSummary !== clinicalAnalysisInput) {
        setClinicalAnalysisInput(textAnalysisSummary);
    }
  // Only re-run if textAnalysisSummary changes. Avoid dependency on clinicalAnalysisInput to prevent loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [textAnalysisSummary, setClinicalAnalysisInput]);


  const handleGenerateAnalysis = async () => {
    const currentInput = String(clinicalAnalysisInput || '').trim();
    if (!currentInput) {
      toast({ title: "Sin Resumen Clínico", description: "Por favor, provea un resumen clínico (se obtiene del Módulo 3) para generar el análisis.", variant: "destructive" });
      return;
    }

    setIsGeneratingClinicalAnalysis(true);
    setClinicalAnalysisError(null);
    let analysisOutput: GenerateClinicalAnalysisOutput | null = null;

    try {
      analysisOutput = await generateClinicalAnalysis({ clinicalSummary: currentInput });
      const newAnalysisContent = (analysisOutput?.clinicalAnalysis || '').trim();
      setGeneratedClinicalAnalysis(newAnalysisContent || null);
      toast({ title: "Análisis Clínico Generado", description: "El caso ha sido analizado por la IA." });
      
      // Auto-transfer to diagnosis module if content exists
      if (newAnalysisContent) {
        const analysisBlockToAdd = `[Análisis Clínico del Caso por IA]:\n${newAnalysisContent}`;
        setDiagnosisInputData(prev => `${prev ? prev + '\n\n' : ''}${analysisBlockToAdd}`);
        toast({
          title: "Análisis Enviado a Diagnóstico",
          description: "El análisis clínico del caso se ha añadido automáticamente para soporte diagnóstico.",
        });
        // Scroll to diagnosis module
        setTimeout(() => {
          const diagnosisModule = document.getElementById('diagnosis-support-module');
          diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 0);
      }


      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'ClinicalAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: getTextSummary(newAnalysisContent, 100),
          fullInput: currentInput,
          fullOutput: analysisOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating clinical analysis:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setClinicalAnalysisError(errorMessage);
      toast({ title: "Error en Análisis Clínico", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'ClinicalAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: 'Error en el análisis',
          fullInput: currentInput,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingClinicalAnalysis(false);
    }
  };

  const handleClearModule = () => {
    clearClinicalAnalysisModule();
    // clinicalAnalysisInput is linked to textAnalysisSummary, so clearing it directly
    // might be overridden. It's better to clear the output.
    // setClinicalAnalysisInput(''); // Optionally clear if user should manually re-trigger population
    toast({ title: "Módulo Limpiado", description: "Se ha limpiado el análisis clínico generado." });
  };

  const handleSendToDiagnosis = () => {
    const analysisToSend = String(generatedClinicalAnalysis || '').trim();
    if (!analysisToSend) {
      toast({ title: "Sin Análisis", description: "No hay análisis clínico generado para enviar.", variant: "default" });
      return;
    }
    const analysisBlockToAdd = `[Análisis Clínico del Caso por IA]:\n${analysisToSend}`;
     setDiagnosisInputData(prev => {
        // Avoid re-adding if it's already there from auto-send
        if (prev.includes(analysisBlockToAdd)) return prev;
        return `${prev ? prev + '\n\n' : ''}${analysisBlockToAdd}`;
    });
    toast({ title: "Análisis Enviado a Diagnóstico", description: "El análisis clínico se ha añadido para soporte diagnóstico." });
     // Scroll to diagnosis module
    setTimeout(() => {
        const diagnosisModule = document.getElementById('diagnosis-support-module');
        diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  };
  
  const handleCopyToClipboard = () => {
    const textToCopy = String(generatedClinicalAnalysis || '').trim();
    if (!textToCopy) {
      toast({ title: "Sin Análisis", description: "No hay análisis para copiar.", variant: "default" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Análisis Copiado", description: "El análisis clínico ha sido copiado." }))
      .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
  };

  const handleSaveManually = async () => {
    const currentInput = String(clinicalAnalysisInput || '');
    if (!currentInput && !generatedClinicalAnalysis && !clinicalAnalysisError) {
      toast({ title: "Nada que Guardar", description: "Genere un análisis primero o provea un resumen.", variant: "default" });
      return;
    }
    
    const status = clinicalAnalysisError ? 'error' : 'completed';
    const output = clinicalAnalysisError ? { error: clinicalAnalysisError } : { clinicalAnalysis: generatedClinicalAnalysis };
    const outputSum = clinicalAnalysisError ? 'Error en el análisis' : getTextSummary(generatedClinicalAnalysis, 100);

    await addHistoryEntry({
      module: 'ClinicalAnalysis',
      inputType: 'text/plain',
      inputSummary: getTextSummary(currentInput),
      outputSummary: outputSum,
      fullInput: currentInput,
      fullOutput: output,
      status: status,
      errorDetails: clinicalAnalysisError || undefined,
    });
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Análisis Clínico Asistido por IA"
      description="Utiliza el resumen de información clave del Módulo 3 para generar un análisis del caso clínico en formato profesional."
      icon={Brain}
      isLoading={isGeneratingClinicalAnalysis}
      id="clinical-analysis-module"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="clinicalSummaryInput" className="block text-sm font-medium mb-1">
            Resumen de Información Clave (del Módulo 3):
          </label>
          <Textarea
            id="clinicalSummaryInput"
            placeholder="El resumen del Módulo 3 aparecerá aquí automáticamente. Puede editarlo si es necesario antes de generar el análisis."
            value={clinicalAnalysisInput || ''}
            onChange={(e) => setClinicalAnalysisInput(e.target.value)} // Allow editing
            rows={6}
            disabled={isGeneratingClinicalAnalysis}
            className="bg-muted/30"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleGenerateAnalysis} disabled={!String(clinicalAnalysisInput || '').trim() || isGeneratingClinicalAnalysis} className="flex-1">
            <Brain className="mr-2 h-4 w-4" />
            Generar Análisis Clínico
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingClinicalAnalysis} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Análisis
          </Button>
        </div>

        {generatedClinicalAnalysis && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Análisis Clínico Generado:</h3>
            <Textarea
              value={generatedClinicalAnalysis || ''}
              readOnly // Keep read-only or make editable based on preference
              rows={8}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
               <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Análisis
              </Button>
              <Button onClick={handleSendToDiagnosis} variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Usar Análisis en Soporte Diagnóstico
              </Button>
            </div>
          </div>
        )}
        {clinicalAnalysisError && (
          <p className="text-sm text-destructive">Error: {clinicalAnalysisError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedClinicalAnalysis || clinicalAnalysisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
