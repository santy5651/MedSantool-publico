
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateDischargeSummary, type GenerateDischargeSummaryOutput, type GenerateDischargeSummaryInput } from '@/ai/flows/generate-discharge-summary';
import type { DischargeSummaryInputState, DischargeSummaryOutputState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { FileOutput, Eraser, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import { useApiKey } from '@/contexts/api-key-context';

interface DischargeSummaryModuleProps {
  id?: string;
}

export function DischargeSummaryModule({ id }: DischargeSummaryModuleProps) {
  const {
    generatedPatientAdvice,
    dischargeSummaryInputs, setDischargeSummaryInputs,
    generatedDischargeSummary, setGeneratedDischargeSummary,
    isGeneratingDischargeSummary, setIsGeneratingDischargeSummary,
    dischargeSummaryError, setDischargeSummaryError,
    clearDischargeSummaryModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { apiKey, openKeyModal } = useApiKey();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDischargeSummaryInputs(prev => ({
      ...prev,
      signosAlarma: generatedPatientAdvice.alarmSigns || prev.signosAlarma || '',
      indicacionesDieta: generatedPatientAdvice.dietaryIndications || prev.indicacionesDieta || '',
      cuidadosGenerales: generatedPatientAdvice.generalCare || prev.cuidadosGenerales || '',
      recomendacionesGenerales: generatedPatientAdvice.generalRecommendations || prev.recomendacionesGenerales || '',
    }));
  }, [generatedPatientAdvice, setDischargeSummaryInputs]);

  const handleInputChange = (field: keyof DischargeSummaryInputState, value: string | null) => {
    setDischargeSummaryInputs(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOutputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedDischargeSummary({ generatedSummary: event.target.value });
  };

  const handleGenerateSummary = async () => {
    if (!apiKey) {
      openKeyModal();
      return;
    }
    setIsGeneratingDischargeSummary(true);
    setDischargeSummaryError(null);
    let aiOutput: GenerateDischargeSummaryOutput | null = null;

    const inputForAI: GenerateDischargeSummaryInput = {
      formulaMedica: dischargeSummaryInputs.formulaMedica || undefined,
      conciliacionMedicamentosa: dischargeSummaryInputs.conciliacionMedicamentosa || undefined,
      laboratoriosControl: dischargeSummaryInputs.laboratoriosControl || undefined,
      proximoControl: dischargeSummaryInputs.proximoControl || undefined,
      tramites: dischargeSummaryInputs.tramites || undefined,
      incapacidad: dischargeSummaryInputs.incapacidad || undefined,
      signosAlarma: dischargeSummaryInputs.signosAlarma || undefined,
      indicacionesDieta: dischargeSummaryInputs.indicacionesDieta || undefined,
      cuidadosGenerales: dischargeSummaryInputs.cuidadosGenerales || undefined,
      recomendacionesGenerales: dischargeSummaryInputs.recomendacionesGenerales || undefined,
      condicionesSalida: dischargeSummaryInputs.condicionesSalida || undefined,
    };

    try {
      aiOutput = await generateDischargeSummary({ ...inputForAI, apiKey });
      setGeneratedDischargeSummary({ generatedSummary: aiOutput.generatedSummary });
      toast({ title: "Resumen de Egreso Generado", description: "El resumen ha sido generado por la IA." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'DischargeSummary',
          inputType: 'application/json',
          inputSummary: `Fórmula: ${inputForAI.formulaMedica ? 'Sí' : 'No'}, Ctrl: ${inputForAI.proximoControl ? 'Sí' : 'No'}`,
          outputSummary: getTextSummary(aiOutput.generatedSummary, 100),
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating discharge summary:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setDischargeSummaryError(errorMessage);
      setGeneratedDischargeSummary({ generatedSummary: null });
      toast({ title: "Error al Generar Resumen", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'DischargeSummary',
          inputType: 'application/json',
           inputSummary: `Fórmula: ${inputForAI.formulaMedica ? 'Sí' : 'No'}, Ctrl: ${inputForAI.proximoControl ? 'Sí' : 'No'}`,
          outputSummary: 'Error en la generación',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingDischargeSummary(false);
    }
  };

  const handleClearModule = () => {
    clearDischargeSummaryModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado los campos del resumen de egreso." });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = generatedDischargeSummary.generatedSummary;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Resumen Copiado", description: "El resumen de egreso ha sido copiado." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: "No hay resumen generado para copiar." });
    }
  };
  
  const handleSaveManually = async () => {
    if (!generatedDischargeSummary.generatedSummary && !dischargeSummaryError) {
      toast({ title: "Nada que Guardar", description: "Genere un resumen primero.", variant: "default" });
      return;
    }
    
    const status = dischargeSummaryError ? 'error' : 'completed';
    const output = dischargeSummaryError ? { error: dischargeSummaryError } : generatedDischargeSummary;
    const outputSum = dischargeSummaryError ? 'Error en la generación' : getTextSummary(generatedDischargeSummary.generatedSummary, 100);
    
    const inputForHistory: GenerateDischargeSummaryInput = {
        formulaMedica: dischargeSummaryInputs.formulaMedica || undefined,
        conciliacionMedicamentosa: dischargeSummaryInputs.conciliacionMedicamentosa || undefined,
        laboratoriosControl: dischargeSummaryInputs.laboratoriosControl || undefined,
        proximoControl: dischargeSummaryInputs.proximoControl || undefined,
        tramites: dischargeSummaryInputs.tramites || undefined,
        incapacidad: dischargeSummaryInputs.incapacidad || undefined,
        signosAlarma: dischargeSummaryInputs.signosAlarma || undefined,
        indicacionesDieta: dischargeSummaryInputs.indicacionesDieta || undefined,
        cuidadosGenerales: dischargeSummaryInputs.cuidadosGenerales || undefined,
        recomendacionesGenerales: dischargeSummaryInputs.recomendacionesGenerales || undefined,
        condicionesSalida: dischargeSummaryInputs.condicionesSalida || undefined,
    };
    
    await addHistoryEntry({
      module: 'DischargeSummary',
      inputType: 'application/json',
      inputSummary: `Fórmula: ${inputForHistory.formulaMedica ? 'Sí' : 'No'}, Ctrl: ${inputForHistory.proximoControl ? 'Sí' : 'No'}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: dischargeSummaryError || undefined,
    });
  };
  
  const inputFields: Array<{ key: keyof DischargeSummaryInputState, label: string, placeholder: string, rows?: number, info?: string }> = [
    { key: 'formulaMedica', label: 'Fórmula Médica', placeholder: 'Ej: ACETAMINOFEN, TABLETAS DE 500 MG, TOMAR 2 TABLETAS, CADA 8 HORAS, POR 10 DIAS (un medicamento por línea)', rows: 4, info: "La IA corregirá ortografía y reorganizará según el formato estándar." },
    { key: 'conciliacionMedicamentosa', label: 'Conciliación Medicamentosa', placeholder: 'Ej: LOSARTAN, TABLETAS 50MG, 1 TABLETA VO CADA DIA (un medicamento por línea)', rows: 3, info: "La IA corregirá ortografía y reorganizará." },
    { key: 'laboratoriosControl', label: 'Se Solicita Laboratorios de Control Ambulatorios', placeholder: 'Si se deja vacío, se usará "NO SE ENVIA LABORATORIOS DE CONTROL"', rows: 2 },
    { key: 'proximoControl', label: 'Próximo Control Médico', placeholder: 'Ej: VALORACION Y SEGUIMIENTO POR CONSULTA EXTERNA CON: MEDICINA GENERAL, EN 10 DIAS', rows: 2 },
    { key: 'tramites', label: 'Trámites Correspondientes (EPS y Régimen)', placeholder: 'Ej: NUEVA EPS SUBSIDIADO', rows: 1 },
    { key: 'incapacidad', label: 'Incapacidad (Días)', placeholder: 'Ej: 15 días. (Se incluirá en la salida solo si se ingresa texto aquí)', rows: 1 },
    { key: 'condicionesSalida', label: 'Condiciones Generales de Salida', placeholder: 'Describa las condiciones generales del paciente al egreso...', rows: 3, info: "La IA corregirá errores de ortografía y mejorará la redacción." },
    { key: 'signosAlarma', label: 'Signos de Alarma (Autocompletado/Manual)', placeholder: 'Se tomarán del Módulo de Consejos al Paciente o puede ingresarlos manualmente.', rows: 3, info: "Todo en MAYÚSCULAS."},
    { key: 'indicacionesDieta', label: 'Indicaciones sobre la Dieta (Autocompletado/Manual)', placeholder: 'Se tomarán del Módulo de Consejos al Paciente o puede ingresarlas manualmente.', rows: 3, info: "Todo en MAYÚSCULAS." },
    { key: 'cuidadosGenerales', label: 'Cuidados Generales (Autocompletado/Manual)', placeholder: 'Se tomarán del Módulo de Consejos al Paciente o puede ingresarlos manualmente.', rows: 3, info: "Todo en MAYÚSCULAS." },
    { key: 'recomendacionesGenerales', label: 'Recomendaciones Generales (Autocompletado/Manual)', placeholder: 'Se tomarán del Módulo de Consejos al Paciente o puede ingresarlas manualmente.', rows: 3, info: "Todo en MAYÚSCULAS." },
  ];


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Generador de Resumen de Egreso"
      description="Complete los campos para generar un resumen de egreso estructurado. Algunos campos se autocompletan desde módulos anteriores."
      icon={FileOutput}
      isLoading={isGeneratingDischargeSummary}
    >
      <div className="space-y-4">
        {inputFields.map(field => (
          <div key={field.key}>
            <Label htmlFor={field.key} className="block text-sm font-medium mb-1">
              {field.label}:
            </Label>
            <Textarea
              id={field.key}
              placeholder={field.placeholder}
              value={dischargeSummaryInputs[field.key] || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              rows={field.rows || 2}
              disabled={isGeneratingDischargeSummary}
              className="text-sm"
            />
            {field.info && <p className="text-xs text-muted-foreground mt-1">{field.info}</p>}
          </div>
        ))}

        <div className="flex space-x-2">
          <Button onClick={handleGenerateSummary} disabled={isGeneratingDischargeSummary} className="flex-1">
            <FileOutput className="mr-2 h-4 w-4" />
            Generar Resumen de Egreso
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingDischargeSummary} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Campos
          </Button>
        </div>

        {generatedDischargeSummary.generatedSummary !== null && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Egreso Generado:</h3>
            <Textarea
              value={generatedDischargeSummary.generatedSummary || ''}
              onChange={handleOutputChange}
              rows={20}
              className="bg-muted/30 text-sm"
              disabled={isGeneratingDischargeSummary}
              placeholder="El resumen de egreso generado aparecerá aquí..."
            />
            <div className="flex space-x-2">
               <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={isGeneratingDischargeSummary || !generatedDischargeSummary.generatedSummary}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Resumen
              </Button>
            </div>
          </div>
        )}
        {dischargeSummaryError && (
          <p className="text-sm text-destructive">Error: {dischargeSummaryError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedDischargeSummary.generatedSummary !== null || dischargeSummaryError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingDischargeSummary}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
