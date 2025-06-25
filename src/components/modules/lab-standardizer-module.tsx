
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { standardizeLabResults, type StandardizeLabResultsOutput } from '@/ai/flows/standardize-lab-results';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, Eraser, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import type { LabStandardizerOutputState } from '@/types';
import { useApiKey } from '@/contexts/api-key-context';

interface LabStandardizerModuleProps {
  id?: string;
}

export function LabStandardizerModule({ id }: LabStandardizerModuleProps) {
  const {
    labStandardizerInput, setLabStandardizerInput,
    labStandardizerOutput, setLabStandardizerOutput,
    isStandardizingLabs, setIsStandardizingLabs,
    labStandardizerError, setLabStandardizerError,
    clearLabStandardizerModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { apiKey, openKeyModal } = useApiKey();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleStandardize = async () => {
    if (!apiKey) {
      openKeyModal();
      return;
    }
    const rawText = String(labStandardizerInput || '').trim();
    if (!rawText) {
      toast({ title: "Sin Datos", description: "Por favor, ingrese el texto de los paraclínicos para estandarizar.", variant: "destructive" });
      return;
    }

    setIsStandardizingLabs(true);
    setLabStandardizerError(null);
    let aiOutput: StandardizeLabResultsOutput | null = null;

    try {
      aiOutput = await standardizeLabResults({ rawLabText: rawText, apiKey });
      setLabStandardizerOutput({
        abbreviatedReport: aiOutput.abbreviatedReport,
        fullReport: aiOutput.fullReport,
      });
      toast({ title: "Paraclínicos Estandarizados", description: "Se han generado los reportes estandarizados." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'LabStandardizer',
          inputType: 'text/plain',
          inputSummary: getTextSummary(rawText, 70),
          outputSummary: `Reporte Abreviado y Completo generados.`,
          fullInput: { rawLabText: rawText },
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error standardizing lab results:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setLabStandardizerError(errorMessage);
      toast({ title: "Error al Estandarizar", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'LabStandardizer',
          inputType: 'text/plain',
          inputSummary: getTextSummary(rawText, 70),
          outputSummary: 'Error en la estandarización',
          fullInput: { rawLabText: rawText },
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsStandardizingLabs(false);
    }
  };

  const handleClearModule = () => {
    clearLabStandardizerModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado los campos del estandarizador." });
  };

  const handleCopyToClipboard = (text: string | null, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: `${type} Copiado`, description: `El reporte ha sido copiado.` }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: `No hay ${type.toLowerCase()} para copiar.` });
    }
  };
  
  const handleSaveManually = async () => {
    if (!labStandardizerOutput.abbreviatedReport && !labStandardizerError) {
      toast({ title: "Nada que Guardar", description: "Genere un reporte primero.", variant: "default" });
      return;
    }
    
    const status = labStandardizerError ? 'error' : 'completed';
    const output = labStandardizerError ? { error: labStandardizerError } : labStandardizerOutput;
    const outputSum = labStandardizerError ? 'Error en la generación' : `Reporte Abreviado y Completo generados.`;
    
    await addHistoryEntry({
      module: 'LabStandardizer',
      inputType: 'text/plain',
      inputSummary: getTextSummary(String(labStandardizerInput || ''), 70),
      outputSummary: outputSum,
      fullInput: { rawLabText: String(labStandardizerInput || '') },
      fullOutput: output,
      status: status,
      errorDetails: labStandardizerError || undefined,
    });
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Estandarizador de Paraclínicos"
      description="Convierte resultados de laboratorio en texto a formatos estándar para entrega de turno y reportes."
      icon={FlaskConical}
      isLoading={isStandardizingLabs}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="rawLabText" className="block text-sm font-medium mb-1">
            Texto de Paraclínicos sin Procesar:
          </label>
          <Textarea
            id="rawLabText"
            placeholder="Pegue aquí los resultados de laboratorio en cualquier formato de texto..."
            value={labStandardizerInput || ''}
            onChange={(e) => setLabStandardizerInput(e.target.value)}
            rows={6}
            disabled={isStandardizingLabs}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleStandardize} disabled={!String(labStandardizerInput || '').trim() || isStandardizingLabs} className="flex-1">
            <FlaskConical className="mr-2 h-4 w-4" />
            Estandarizar
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isStandardizingLabs} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {labStandardizerOutput.abbreviatedReport && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Para Entrega de Turno (Abreviado):</h3>
            <Textarea
              value={labStandardizerOutput.abbreviatedReport || ''}
              readOnly
              rows={4}
              className="bg-muted/30"
            />
            <Button onClick={() => handleCopyToClipboard(labStandardizerOutput.abbreviatedReport, 'Reporte Abreviado')} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
        )}

        {labStandardizerOutput.fullReport && (
          <div className="space-y-2 mt-4">
            <h3 className="text-md font-semibold font-headline">Para Reporte en Sistema (Completo):</h3>
            <Textarea
              value={labStandardizerOutput.fullReport || ''}
              readOnly
              rows={8}
              className="bg-muted/30"
            />
            <Button onClick={() => handleCopyToClipboard(labStandardizerOutput.fullReport, 'Reporte Completo')} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
        )}

        {labStandardizerError && (
          <p className="text-sm text-destructive">Error: {labStandardizerError}</p>
        )}
        
        {!isAutoSaveEnabled && (labStandardizerOutput.abbreviatedReport || labStandardizerError) && (
          <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
