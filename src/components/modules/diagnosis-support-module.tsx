
// src/components/modules/diagnosis-support-module.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { suggestDiagnosis } from '@/ai/flows/suggest-diagnosis';
import type { DiagnosisResult } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Eraser, Pin, Star, Save, Lightbulb, GripVertical } from 'lucide-react';
import { getTextSummary, cn } from '@/lib/utils';

export function DiagnosisSupportModule() {
  const {
    diagnosisInputData, setDiagnosisInputData,
    diagnosisResults, setDiagnosisResults,
    isDiagnosing, setIsDiagnosing,
    diagnosisError, setDiagnosisError,
    clearDiagnosisModule
  } = useClinicalData();

  const [localDiagnosisResults, setLocalDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (diagnosisResults) {
      setLocalDiagnosisResults(diagnosisResults.map(dr => ({...dr, isValidated: dr.isValidated ?? false, isPrincipal: dr.isPrincipal ?? false })));
    } else {
      setLocalDiagnosisResults([]);
    }
  }, [diagnosisResults]);
  
  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleSuggestDiagnosis = async () => {
    const currentInput = String(diagnosisInputData || '');
    if (!currentInput.trim()) {
      toast({ title: "Sin Datos Clínicos", description: "Por favor, ingrese datos clínicos para obtener sugerencias.", variant: "destructive" });
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisError(null);
    
    try {
      const aiOutput = await suggestDiagnosis({ clinicalData: currentInput });
      const initialResults: DiagnosisResult[] = aiOutput.map(d => ({ ...d, isValidated: false, isPrincipal: false }));
      setDiagnosisResults(initialResults); 
      setLocalDiagnosisResults(initialResults); 
      toast({ title: "Sugerencias de Diagnóstico Obtenidas", description: `${initialResults.length} diagnósticos sugeridos.` });

      if (isAutoSaveEnabled) {
        await saveToHistory(initialResults, null, currentInput);
      }
    } catch (error: any) {
      console.error("Error suggesting diagnosis:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setDiagnosisError(errorMessage);
      setDiagnosisResults(null);
      setLocalDiagnosisResults([]);
      toast({ title: "Error en Sugerencia de Diagnóstico", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await saveToHistory(null, errorMessage, currentInput);
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleClearData = () => {
    clearDiagnosisModule();
    setLocalDiagnosisResults([]); 
    toast({ title: "Datos Limpiados", description: "Se han limpiado los datos para diagnóstico." });
  };

  const toggleValidation = (index: number) => {
    const updatedResults = localDiagnosisResults.map((diag, i) => 
      i === index ? { ...diag, isValidated: !diag.isValidated } : diag
    );
    setLocalDiagnosisResults(updatedResults);
  };

  const setPrincipalDiagnosis = (index: number) => {
    let updatedResults = localDiagnosisResults.map((diag, i) => ({
      ...diag,
      isPrincipal: i === index ? !diag.isPrincipal : false, 
    }));
    
    const principal = updatedResults.find(diag => diag.isPrincipal);
    if (principal) {
      updatedResults = [principal, ...updatedResults.filter(diag => !diag.isPrincipal)];
    }
    setLocalDiagnosisResults(updatedResults);
  };

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" => {
    if (confidence > 0.75) return "default"; 
    if (confidence > 0.5) return "secondary";
    return "destructive"; 
  };

  const saveToHistory = async (results: DiagnosisResult[] | null, errorMsg: string | null, inputForHistory: string) => {
    const currentResultsToSave = results || localDiagnosisResults; 
    const status = errorMsg ? 'error' : 'completed';
        
    const principalDiagnosis = currentResultsToSave.find(d => d.isPrincipal);
    const validatedCount = currentResultsToSave.filter(d => d.isValidated).length;
    let outputSummary = 'Error en diagnóstico';
    if (!errorMsg) {
      outputSummary = `${currentResultsToSave.length} diagnósticos.`;
      if (principalDiagnosis) outputSummary += ` Principal: ${principalDiagnosis.code}.`;
      outputSummary += ` Validados: ${validatedCount}.`;
    }

    await addHistoryEntry({
      module: 'DiagnosisSupport',
      inputType: 'text/plain',
      inputSummary: getTextSummary(inputForHistory),
      outputSummary: outputSummary,
      fullInput: inputForHistory,
      fullOutput: errorMsg ? { error: errorMsg } : currentResultsToSave, 
      status: status,
      errorDetails: errorMsg || undefined,
    });
  };

  const handleSaveManually = () => {
    const currentInput = String(diagnosisInputData || '');
    if (!currentInput.trim() || (localDiagnosisResults.length === 0 && !diagnosisError)) {
       toast({ title: "Nada que Guardar", description: "Sugiera diagnósticos primero.", variant: "default" });
      return;
    }
    saveToHistory(localDiagnosisResults, diagnosisError, currentInput);
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (enterIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== enterIndex) {
      setDragOverIndex(enterIndex);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (dropTargetIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropTargetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newResults = [...localDiagnosisResults];
    const itemToMove = newResults[draggedIndex];
    newResults.splice(draggedIndex, 1); // Remove item from old position
    newResults.splice(dropTargetIndex, 0, itemToMove); // Insert item at new position
    
    setLocalDiagnosisResults(newResults);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Diagnóstico Inteligente Asistido por IA"
      description="Ingrese datos clínicos consolidados. La IA sugerirá diagnósticos (CIE-10) con niveles de confianza. Puede reordenarlos manualmente."
      icon={Lightbulb}
      isLoading={isDiagnosing}
      id="diagnosis-support-module"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="diagnosisData" className="block text-sm font-medium mb-1">
            Datos Clínicos Consolidados (Ej: Resumen del Módulo 3, síntomas):
          </label>
          <Textarea
            id="diagnosisData"
            placeholder="Pegue o escriba datos clínicos aquí..."
            value={String(diagnosisInputData || '')}
            onChange={(e) => setDiagnosisInputData(e.target.value)}
            rows={6}
            disabled={isDiagnosing}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSuggestDiagnosis} disabled={!String(diagnosisInputData || '').trim() || isDiagnosing} className="flex-1">
            <Stethoscope className="mr-2 h-4 w-4" />
            Sugerir Diagnósticos
          </Button>
          <Button onClick={handleClearData} variant="outline" disabled={isDiagnosing} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Datos
          </Button>
        </div>

        {localDiagnosisResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Diagnósticos Sugeridos:</h3>
            <p className="text-xs text-muted-foreground">Arrastre las filas para reordenar los diagnósticos.</p>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] p-1 text-center"></TableHead>
                    <TableHead className="w-[50px] text-center">Principal</TableHead>
                    <TableHead className="w-[80px] text-center">Validar</TableHead>
                    <TableHead className="w-[120px]">CIE-10</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[120px] text-center">Confianza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localDiagnosisResults.map((diag, index) => (
                    <TableRow
                      key={diag.code + diag.description + index + (diag.isPrincipal ? '-principal' : '')}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        diag.isPrincipal ? 'bg-primary/10' : '',
                        'border-t-2 border-transparent',
                        draggedIndex === index ? 'opacity-50 cursor-grabbing !border-transparent' : 'cursor-grab',
                        draggedIndex !== null && dragOverIndex === index && draggedIndex !== index ? '!border-t-primary transition-all duration-100 ease-in-out' : ''
                      )}
                    ><TableCell className="w-[40px] text-center p-1"><GripVertical className="h-5 w-5 text-muted-foreground inline-block" /></TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => setPrincipalDiagnosis(index)} title={diag.isPrincipal ? "Quitar como principal" : "Marcar como principal"}>{diag.isPrincipal ? <Star className="h-5 w-5 text-accent fill-accent" /> : <Pin className="h-5 w-5" />}</Button></TableCell><TableCell className="text-center"><Checkbox checked={diag.isValidated} onCheckedChange={() => toggleValidation(index)} aria-label={`Validar diagnóstico ${diag.code}`} /></TableCell><TableCell className="font-medium">{diag.code}</TableCell><TableCell>{diag.description}</TableCell><TableCell className="text-center"><Badge variant={getConfidenceBadgeVariant(diag.confidence)}>{(diag.confidence * 100).toFixed(0)}%</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {diagnosisError && (
          <p className="text-sm text-destructive">Error: {diagnosisError}</p>
        )}
         {!isAutoSaveEnabled && (localDiagnosisResults.length > 0 || diagnosisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
