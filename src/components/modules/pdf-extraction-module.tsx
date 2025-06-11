'use client';

import React, { useRef } from 'react';
import { FileInput } from '@/components/common/file-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { readFileAsDataURL, getFileSummary, getTextSummary } from '@/lib/utils';
import { extractInformationFromPdf, type ExtractInformationFromPdfOutput } from '@/ai/flows/extract-information-from-pdf';
import type { PdfStructuredData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eraser, Send, Save, ListTree } from 'lucide-react';

export function PdfExtractionModule() {
  const {
    pdfFile, setPdfFile,
    pdfExtractedNotes, setPdfExtractedNotes,
    pdfStructuredData, setPdfStructuredData,
    isPdfExtracting, setIsPdfExtracting,
    pdfExtractionError, setPdfExtractionError,
    setClinicalNotesInput, // For "Usar Notas para Comprensión de Texto"
    clearPdfModule
  } = useClinicalData();
  
  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File | null) => {
    setPdfFile(file);
    setPdfExtractedNotes(null);
    setPdfStructuredData(null);
    setPdfExtractionError(null);
  };

  const handleAnalyzeDocument = async () => {
    if (!pdfFile) {
      toast({ title: "Sin Documento", description: "Por favor, seleccione un documento PDF para analizar.", variant: "destructive" });
      return;
    }

    setIsPdfExtracting(true);
    setPdfExtractionError(null);
    let analysisOutput: ExtractInformationFromPdfOutput | null = null;
    let dataUri = '';

    try {
      dataUri = await readFileAsDataURL(pdfFile);
      analysisOutput = await extractInformationFromPdf({ pdfDataUri: dataUri });
      setPdfExtractedNotes(analysisOutput.clinicalNotes);
      setPdfStructuredData(analysisOutput.structuredData as PdfStructuredData[]); // Cast if Zod schema matches
      toast({ title: "Extracción Completada", description: "La información del PDF ha sido extraída." });
      
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PdfExtraction',
          inputType: pdfFile.type,
          inputSummary: getFileSummary(pdfFile),
          outputSummary: `Datos: ${analysisOutput.structuredData.length} campos. Notas: ${getTextSummary(analysisOutput.clinicalNotes, 50)}`,
          fullInput: `Data URI for ${pdfFile.name}`,
          fullOutput: analysisOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error extracting from PDF:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setPdfExtractionError(errorMessage);
      toast({ title: "Error de Extracción", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PdfExtraction',
          inputType: pdfFile.type,
          inputSummary: getFileSummary(pdfFile),
          outputSummary: 'Error en la extracción',
          fullInput: `Data URI for ${pdfFile.name}`,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsPdfExtracting(false);
    }
  };

  const handleClearSelection = () => {
    clearPdfModule();
    toast({ title: "Selección Limpiada", description: "Se ha limpiado la selección de PDF." });
  };

  const handleSendNotesToText = () => {
    if (pdfExtractedNotes) {
      setClinicalNotesInput(prev => 
        `${prev ? prev + '\n\n' : ''}[Notas Extraídas de PDF - ${getFileSummary(pdfFile)}]:\n${pdfExtractedNotes}`
      );
      toast({ title: "Notas Enviadas", description: "Las notas del PDF se han añadido a las notas clínicas." });
      const textModule = document.getElementById('text-analysis-module');
      textModule?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveManually = async () => {
    if (!pdfFile || (!pdfExtractedNotes && !pdfStructuredData && !pdfExtractionError)) {
      toast({ title: "Nada que Guardar", description: "Analice un PDF primero.", variant: "default" });
      return;
    }
    
    const status = pdfExtractionError ? 'error' : 'completed';
    const output = pdfExtractionError ? { error: pdfExtractionError } : { clinicalNotes: pdfExtractedNotes, structuredData: pdfStructuredData };
    const outputSum = pdfExtractionError ? 'Error en la extracción' : `Datos: ${pdfStructuredData?.length || 0} campos. Notas: ${getTextSummary(pdfExtractedNotes, 50)}`;

    await addHistoryEntry({
      module: 'PdfExtraction',
      inputType: pdfFile.type,
      inputSummary: getFileSummary(pdfFile),
      outputSummary: outputSum,
      fullInput: `Data URI for ${pdfFile.name}`,
      fullOutput: output,
      status: status,
      errorDetails: pdfExtractionError || undefined,
    });
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Extracción Inteligente desde Documentos (PDF)"
      description="Cargue documentos médicos PDF. La IA extraerá datos estructurados y notas clínicas."
      icon={FileText}
      isLoading={isPdfExtracting}
      id="pdf-extraction-module"
    >
      <div className="space-y-4">
        <FileInput 
          onFileSelect={handleFileSelect} 
          accept=".pdf" 
          currentFile={pdfFile}
          disabled={isPdfExtracting}
        />

        <div className="flex space-x-2">
          <Button onClick={handleAnalyzeDocument} disabled={!pdfFile || isPdfExtracting} className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Analizar Documento
          </Button>
          <Button onClick={handleClearSelection} variant="outline" disabled={isPdfExtracting} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Selección
          </Button>
        </div>

        {pdfStructuredData && pdfStructuredData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline flex items-center">
              <ListTree className="mr-2 h-5 w-5 text-primary" /> Datos Estructurados:
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="structured-data">
                <AccordionTrigger>Mostrar/Ocultar Datos ({pdfStructuredData.length} campos)</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm max-h-60 overflow-y-auto bg-muted/30 p-2 rounded-md">
                    {pdfStructuredData.map((item, index) => (
                      <li key={index}><strong>{item.key}:</strong> {item.value}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {pdfExtractedNotes && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Notas Clínicas Extraídas:</h3>
            <Textarea
              value={pdfExtractedNotes || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <Button onClick={handleSendNotesToText} variant="default" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Usar Notas para Comprensión de Texto
            </Button>
          </div>
        )}
        {pdfExtractionError && (
          <p className="text-sm text-destructive">Error: {pdfExtractionError}</p>
        )}

        {!isAutoSaveEnabled && (pdfExtractedNotes || pdfStructuredData || pdfExtractionError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
