

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FileInput } from '@/components/common/file-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { readFileAsDataURL, getFileSummary, getTextSummary } from '@/lib/utils';
import { analyzeMedicalImage, type AnalyzeMedicalImageOutput } from '@/ai/flows/analyze-medical-image';
import { useToast } from '@/hooks/use-toast';
import { ScanSearch, Eraser, Send, Save, Copy, FileJson, ClipboardPaste } from 'lucide-react';
import type { ImageAnalysisOutputState } from '@/types';

interface ImageAnalysisModuleProps {
  id?: string;
}

export function ImageAnalysisModule({ id }: ImageAnalysisModuleProps) {
  const { 
    imageFile, setImageFile, 
    imageAnalysisOutput, setImageAnalysisOutput,
    isImageAnalyzing, setIsImageAnalyzing,
    imageAnalysisError, setImageAnalysisError,
    setClinicalNotesInput, 
    clearImageModule
  } = useClinicalData();
  
  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [imageFile]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (isImageAnalyzing) return;
    setImageFile(file);
    setImageAnalysisOutput({ summary: null, radiologistReading: null }); 
    setImageAnalysisError(null);
  }, [isImageAnalyzing, setImageFile, setImageAnalysisOutput, setImageAnalysisError]);

  useEffect(() => {
    const currentModuleRef = moduleRef.current;
    
    const handlePasteEvent = (event: ClipboardEvent) => {
      if (isImageAnalyzing) return;
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                  event.preventDefault();
                  handleFileSelect(file);
                  toast({ title: "Imagen Pegada", description: "Se ha cargado la imagen desde el portapapeles." });
                  break; 
              }
          }
      }
    };
    
    if (currentModuleRef) {
        currentModuleRef.addEventListener('paste', handlePasteEvent);
        return () => {
            currentModuleRef.removeEventListener('paste', handlePasteEvent);
        };
    }
  }, [isImageAnalyzing, handleFileSelect, toast]);


  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast({ title: "Sin Imagen", description: "Por favor, seleccione una imagen para analizar.", variant: "destructive" });
      return;
    }

    setIsImageAnalyzing(true);
    setImageAnalysisError(null);
    let aiOutput: AnalyzeMedicalImageOutput | null = null;
    let dataUri = '';

    try {
      dataUri = await readFileAsDataURL(imageFile);
      aiOutput = await analyzeMedicalImage({ photoDataUri: dataUri });
      setImageAnalysisOutput({
        summary: aiOutput.summary,
        radiologistReading: aiOutput.radiologistReading
      });
      toast({ title: "Análisis Completado", description: "La imagen ha sido analizada exitosamente." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'ImageAnalysis',
          inputType: imageFile.type,
          inputSummary: getFileSummary(imageFile),
          outputSummary: `Resumen: ${getTextSummary(aiOutput.summary, 50)}. Lectura: ${getTextSummary(aiOutput.radiologistReading, 50)}`,
          fullInput: `Data URI for ${imageFile.name}`, 
          fullOutput: aiOutput as ImageAnalysisOutputState,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setImageAnalysisError(errorMessage);
      setImageAnalysisOutput({ summary: null, radiologistReading: null });
      toast({ title: "Error de Análisis", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'ImageAnalysis',
          inputType: imageFile.type,
          inputSummary: getFileSummary(imageFile),
          outputSummary: 'Error en el análisis',
          fullInput: `Data URI for ${imageFile.name}`,
          fullOutput: { error: errorMessage } as any, // Cast for error case
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsImageAnalyzing(false);
    }
  };

  const handleClearSelection = () => {
    clearImageModule();
    setPreviewUrl(null); 
    toast({ title: "Selección Limpiada", description: "Se ha limpiado la selección de imagen." });
  };

  const handleSendSummaryToText = () => {
    if (imageAnalysisOutput.summary) {
      setClinicalNotesInput(prev => 
        `${prev ? prev + '\n\n' : ''}[Resumen de Imagen - ${getFileSummary(imageFile)}]:\n${imageAnalysisOutput.summary}`
      );
      toast({ title: "Resumen Enviado", description: "El resumen de la imagen se ha añadido a las notas clínicas." });
      const textModule = document.getElementById('text-analysis-module');
      textModule?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendReadingToText = () => {
    if (imageAnalysisOutput.radiologistReading) {
      setClinicalNotesInput(prev => 
        `${prev ? prev + '\n\n' : ''}[Lectura Detallada de Imagen - ${getFileSummary(imageFile)}]:\n${imageAnalysisOutput.radiologistReading}`
      );
      toast({ title: "Lectura Enviada", description: "La lectura detallada se ha añadido a las notas clínicas." });
      const textModule = document.getElementById('text-analysis-module');
      textModule?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyToClipboard = (text: string | null, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: `${type} copiado(a)`, description: `El contenido ha sido copiado.` }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: `Nada que Copiar`, description: `No hay ${type.toLowerCase()} para copiar.` });
    }
  };
  
  const handleSaveManually = async () => {
    if (!imageFile || (!imageAnalysisOutput.summary && !imageAnalysisOutput.radiologistReading && !imageAnalysisError)) {
      toast({ title: "Nada que Guardar", description: "Analice una imagen primero.", variant: "default" });
      return;
    }
    
    const status = imageAnalysisError ? 'error' : 'completed';
    const outputToSave = imageAnalysisError ? { error: imageAnalysisError } : imageAnalysisOutput;
    const outputSum = imageAnalysisError 
        ? 'Error en el análisis' 
        : `Resumen: ${getTextSummary(imageAnalysisOutput.summary, 50)}. Lectura: ${getTextSummary(imageAnalysisOutput.radiologistReading, 50)}`;

    await addHistoryEntry({
      module: 'ImageAnalysis',
      inputType: imageFile.type,
      inputSummary: getFileSummary(imageFile),
      outputSummary: outputSum,
      fullInput: `Data URI for ${imageFile.name}`,
      fullOutput: outputToSave as ImageAnalysisOutputState, // Cast as it will be ImageAnalysisOutputState or {error: string}
      status: status,
      errorDetails: imageAnalysisError || undefined,
    });
  };


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Análisis Avanzado de Radiografías"
      description="Cargue o pegue radiografías para análisis por IA. Obtenga un resumen de hallazgos y una lectura radiológica detallada."
      icon={ScanSearch}
      isLoading={isImageAnalyzing}
    >
      <div className="space-y-4">
        <FileInput 
          onFileSelect={handleFileSelect} 
          accept="image/*" 
          currentFile={imageFile}
          disabled={isImageAnalyzing}
        />

        {previewUrl ? (
          <div className="mt-4 border rounded-md p-2 bg-muted/50 max-h-60 overflow-hidden flex justify-center">
            <Image 
              src={previewUrl} 
              alt="Previsualización de imagen" 
              width={200} 
              height={200} 
              className="object-contain rounded-md" 
              data-ai-hint="medical scan"
            />
          </div>
        ) : (
            <div className="mt-4 border-2 border-dashed rounded-md p-6 bg-muted/30 text-center text-muted-foreground">
                <ClipboardPaste className="mx-auto h-10 w-10 mb-2" />
                <p className="text-sm">Puede pegar una imagen aquí (Ctrl+V)</p>
                <p className="text-xs">o usar el botón "Seleccionar archivo".</p>
            </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={handleAnalyzeImage} disabled={!imageFile || isImageAnalyzing} className="flex-1">
            <ScanSearch className="mr-2 h-4 w-4" />
            Analizar Radiografía
          </Button>
          <Button onClick={handleClearSelection} variant="outline" disabled={isImageAnalyzing} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Selección
          </Button>
        </div>

        {imageAnalysisOutput.summary && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Hallazgos:</h3>
            <Textarea
              value={imageAnalysisOutput.summary || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={() => handleCopyToClipboard(imageAnalysisOutput.summary, 'Resumen')} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Resumen
              </Button>
              <Button onClick={handleSendSummaryToText} variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Usar Resumen en Comprensión de Texto
              </Button>
            </div>
          </div>
        )}

        {imageAnalysisOutput.radiologistReading && (
          <div className="space-y-2 mt-4">
            <h3 className="text-md font-semibold font-headline flex items-center">
              <FileJson className="mr-2 h-5 w-5 text-primary" />
              Lectura Radiológica Detallada:
            </h3>
            <Textarea
              value={imageAnalysisOutput.radiologistReading || ''}
              readOnly
              rows={10}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={() => handleCopyToClipboard(imageAnalysisOutput.radiologistReading, 'Lectura Detallada')} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Lectura
              </Button>
               <Button onClick={handleSendReadingToText} variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Usar Lectura en Comprensión de Texto
              </Button>
            </div>
          </div>
        )}

        {imageAnalysisError && (
          <p className="text-sm text-destructive">Error: {imageAnalysisError}</p>
        )}
        
        {!isAutoSaveEnabled && (imageAnalysisOutput.summary || imageAnalysisOutput.radiologistReading || imageAnalysisError) && (
          <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
