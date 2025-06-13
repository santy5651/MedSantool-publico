
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateMedicalJustification, type GenerateMedicalJustificationOutput, type GenerateMedicalJustificationInput } from '@/ai/flows/generate-medical-justification';
import { useToast } from '@/hooks/use-toast';
import { FileSignature, Eraser, Save, Copy, MessageCircleMore } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import type { MedicalJustificationInputState } from '@/types';

export function MedicalJustificationModule() {
  const {
    justificationInput, setJustificationInput,
    generatedJustification, setGeneratedJustification,
    isGeneratingJustification, setIsGeneratingJustification,
    justificationError, setJustificationError,
    clearMedicalJustificationModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof MedicalJustificationInputState, value: string | null) => {
    setJustificationInput(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateJustification = async () => {
    const concept = String(justificationInput.conceptToJustify || '').trim();
    if (!concept) {
      toast({ title: "Concepto Requerido", description: "Por favor, ingrese el concepto que desea justificar.", variant: "destructive" });
      return;
    }

    setIsGeneratingJustification(true);
    setJustificationError(null);
    let aiOutput: GenerateMedicalJustificationOutput | null = null;

    const inputForAI: GenerateMedicalJustificationInput = {
      conceptToJustify: concept,
      relevantClinicalInfo: String(justificationInput.relevantClinicalInfo || '').trim() || undefined,
    };

    try {
      aiOutput = await generateMedicalJustification(inputForAI);
      setGeneratedJustification({ justificationText: aiOutput.justificationText });
      toast({ title: "Justificación Generada", description: "La justificación médica ha sido generada por la IA." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'MedicalJustification',
          inputType: 'application/json',
          inputSummary: `Concepto: ${getTextSummary(inputForAI.conceptToJustify, 50)}`,
          outputSummary: getTextSummary(aiOutput.justificationText, 100),
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any)
    {
      console.error("Error generating medical justification:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setJustificationError(errorMessage);
      setGeneratedJustification({ justificationText: null });
      toast({ title: "Error al Generar Justificación", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'MedicalJustification',
          inputType: 'application/json',
          inputSummary: `Concepto: ${getTextSummary(inputForAI.conceptToJustify, 50)}`,
          outputSummary: 'Error en la generación',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingJustification(false);
    }
  };

  const handleClearModule = () => {
    clearMedicalJustificationModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado los campos de justificación médica." });
  };
  
  const handleOutputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedJustification({ justificationText: event.target.value });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = generatedJustification.justificationText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Justificación Copiada", description: "La justificación médica ha sido copiada." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: "No hay justificación generada para copiar." });
    }
  };
  
  const handleSaveManually = async () => {
    if (!generatedJustification.justificationText && !justificationError) {
      toast({ title: "Nada que Guardar", description: "Genere una justificación primero.", variant: "default" });
      return;
    }
    
    const status = justificationError ? 'error' : 'completed';
    const output = justificationError ? { error: justificationError } : generatedJustification;
    const outputSum = justificationError ? 'Error en la generación' : getTextSummary(generatedJustification.justificationText, 100);
    
    const inputForHistory: GenerateMedicalJustificationInput = {
        conceptToJustify: String(justificationInput.conceptToJustify || '').trim(),
        relevantClinicalInfo: String(justificationInput.relevantClinicalInfo || '').trim() || undefined,
    };
    
    await addHistoryEntry({
      module: 'MedicalJustification',
      inputType: 'application/json',
      inputSummary: `Concepto: ${getTextSummary(inputForHistory.conceptToJustify, 50)}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: justificationError || undefined,
    });
  };

  const canGenerate = String(justificationInput.conceptToJustify || '').trim() !== '';

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Justificaciones Médicas Asistidas por IA"
      description="Ingrese el concepto a justificar y (opcionalmente) información clínica. La IA generará una justificación profesional."
      icon={FileSignature}
      isLoading={isGeneratingJustification}
      id="medical-justification-module"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="conceptToJustify" className="block text-sm font-medium mb-1">
            Concepto a Justificar (Ej: Uso de oxígeno domiciliario, necesidad de paraclínico específico):
          </label>
          <Textarea
            id="conceptToJustify"
            placeholder="Describa brevemente lo que necesita justificar..."
            value={justificationInput.conceptToJustify || ''}
            onChange={(e) => handleInputChange('conceptToJustify', e.target.value)}
            rows={3}
            disabled={isGeneratingJustification}
          />
        </div>

        <div>
          <label htmlFor="relevantClinicalInfo" className="block text-sm font-medium mb-1">
            Información Clínica Relevante del Paciente (Opcional, pero recomendada):
          </label>
          <Textarea
            id="relevantClinicalInfo"
            placeholder="Añada diagnósticos, evolución, tratamientos previos, etc., para enriquecer la justificación..."
            value={justificationInput.relevantClinicalInfo || ''}
            onChange={(e) => handleInputChange('relevantClinicalInfo', e.target.value)}
            rows={5}
            disabled={isGeneratingJustification}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleGenerateJustification} disabled={!canGenerate || isGeneratingJustification} className="flex-1">
            <MessageCircleMore className="mr-2 h-4 w-4" />
            Generar Justificación
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingJustification} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Campos
          </Button>
        </div>

        {generatedJustification.justificationText !== null && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Justificación Médica Generada:</h3>
            <Textarea
              value={generatedJustification.justificationText || ''}
              onChange={handleOutputChange}
              rows={10}
              className="bg-muted/30"
              disabled={isGeneratingJustification}
              placeholder="La justificación generada aparecerá aquí..."
            />
            <div className="flex space-x-2">
               <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={isGeneratingJustification || !generatedJustification.justificationText}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Justificación
              </Button>
            </div>
          </div>
        )}
        {justificationError && (
          <p className="text-sm text-destructive">Error: {justificationError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedJustification.justificationText !== null || justificationError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingJustification}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
