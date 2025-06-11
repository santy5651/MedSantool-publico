'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { ScanSearch, Eraser, Send, Save } from 'lucide-react';

export function ImageAnalysisModule() {
  const { 
    imageFile, setImageFile, 
    imageAnalysisSummary, setImageAnalysisSummary,
    isImageAnalyzing, setIsImageAnalyzing,
    imageAnalysisError, setImageAnalysisError,
    setClinicalNotesInput, // For "Usar Resumen en Comprensión de Texto"
    clearImageModule
  } = useClinicalData();
  
  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const resultsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [imageFile]);

  const handleFileSelect = (file: File | null) => {
    setImageFile(file);
    setImageAnalysisSummary(null); // Clear previous summary
    setImageAnalysisError(null);
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      toast({ title: "Sin Imagen", description: "Por favor, seleccione una imagen para analizar.", variant: "destructive" });
      return;
    }

    setIsImageAnalyzing(true);
    setImageAnalysisError(null);
    let analysisOutput: AnalyzeMedicalImageOutput | null = null;
    let dataUri = '';

    try {
      dataUri = await readFileAsDataURL(imageFile);
      analysisOutput = await analyzeMedicalImage({ photoDataUri: dataUri });
      setImageAnalysisSummary(analysisOutput.summary);
      toast({ title: "Análisis Completado", description: "La imagen ha sido analizada exitosamente." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'ImageAnalysis',
          inputType: imageFile.type,
          inputSummary: getFileSummary(imageFile),
          outputSummary: getTextSummary(analysisOutput.summary, 100),
          fullInput: `Data URI for ${imageFile.name}`, // Or consider storing a smaller identifier if URI is too large for summary
          fullOutput: analysisOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setImageAnalysisError(errorMessage);
      toast({ title: "Error de Análisis", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'ImageAnalysis',
          inputType: imageFile.type,
          inputSummary: getFileSummary(imageFile),
          outputSummary: 'Error en el análisis',
          fullInput: `Data URI for ${imageFile.name}`,
          fullOutput: { error: errorMessage },
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
    setPreviewUrl(null); // Ensure preview is also cleared
    toast({ title: "Selección Limpiada", description: "Se ha limpiado la selección de imagen." });
  };

  const handleSendSummaryToText = () => {
    if (imageAnalysisSummary) {
      setClinicalNotesInput(prev => 
        `${prev ? prev + '\n\n' : ''}[Resumen de Imagen - ${getFileSummary(imageFile)}]:\n${imageAnalysisSummary}`
      );
      toast({ title: "Resumen Enviado", description: "El resumen de la imagen se ha añadido a las notas clínicas." });
      // Optional: Scroll to Text Analysis Module
      const textModule = document.getElementById('text-analysis-module');
      textModule?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSaveManually = async () => {
    if (!imageFile || (!imageAnalysisSummary && !imageAnalysisError)) {
      toast({ title: "Nada que Guardar", description: "Analice una imagen primero.", variant: "default" });
      return;
    }
    
    const status = imageAnalysisError ? 'error' : 'completed';
    const output = imageAnalysisError ? { error: imageAnalysisError } : { summary: imageAnalysisSummary };
    const outputSum = imageAnalysisError ? 'Error en el análisis' : getTextSummary(imageAnalysisSummary, 100);

    await addHistoryEntry({
      module: 'ImageAnalysis',
      inputType: imageFile.type,
      inputSummary: getFileSummary(imageFile),
      outputSummary: outputSum,
      fullInput: `Data URI for ${imageFile.name}`,
      fullOutput: output,
      status: status,
      errorDetails: imageAnalysisError || undefined,
    });
  };


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Análisis Avanzado de Imágenes Médicas"
      description="Cargue imágenes médicas (radiografías, TAC, RMN) para análisis por IA. Obtenga un resumen de hallazgos."
      icon={ScanSearch}
      isLoading={isImageAnalyzing}
      id="image-analysis-module"
    >
      <div className="space-y-4">
        <FileInput 
          onFileSelect={handleFileSelect} 
          accept="image/*" 
          currentFile={imageFile}
          disabled={isImageAnalyzing}
        />

        {previewUrl && (
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
        )}

        <div className="flex space-x-2">
          <Button onClick={handleAnalyzeImage} disabled={!imageFile || isImageAnalyzing} className="flex-1">
            <ScanSearch className="mr-2 h-4 w-4" />
            Analizar Imagen
          </Button>
          <Button onClick={handleClearSelection} variant="outline" disabled={isImageAnalyzing} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Selección
          </Button>
        </div>

        {imageAnalysisSummary && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Hallazgos:</h3>
            <Textarea
              ref={resultsTextareaRef}
              value={imageAnalysisSummary || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <Button onClick={handleSendSummaryToText} variant="default" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Usar Resumen en Comprensión de Texto
            </Button>
          </div>
        )}
        {imageAnalysisError && (
          <p className="text-sm text-destructive">Error: {imageAnalysisError}</p>
        )}
        
        {!isAutoSaveEnabled && (imageAnalysisSummary || imageAnalysisError) && (
          <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
