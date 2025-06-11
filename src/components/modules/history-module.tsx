
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
import { Trash2, Upload, Download, FileText, Image as ImageIcon, MessageSquareText, Lightbulb, Info, AlertCircle, CheckCircle, Settings2, FileEdit, Star, Brain, ListChecks } from 'lucide-react';
import type { HistoryEntry, ModuleType, DiagnosisResult, PdfStructuredData, MedicalOrderOutputState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const moduleIcons: Record<ModuleType, LucideIcon> = {
  ImageAnalysis: ImageIcon,
  PdfExtraction: FileText,
  TextAnalysis: MessageSquareText,
  ClinicalAnalysis: Brain, 
  DiagnosisSupport: Lightbulb,
  MedicalOrders: FileEdit,
  TreatmentPlanSuggestion: ListChecks,
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


  const renderFullOutput = (entry: HistoryEntry) => {
    if (entry.status === 'error') {
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-destructive/10 rounded-md">{entry.errorDetails || "Error desconocido"}</pre>;
    }
    if (!entry.fullOutput) return <p className="text-xs text-muted-foreground">No hay detalles completos.</p>;

    try {
      const output = typeof entry.fullOutput === 'string' 
        ? JSON.parse(entry.fullOutput) // Assume stringified JSON for older entries or simple text outputs
        : entry.fullOutput;
      
      if (entry.module === 'DiagnosisSupport' && Array.isArray(output)) {
        const diagnoses = output as DiagnosisResult[];
        return (
          <div className="overflow-x-auto rounded-md border text-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CIE-10</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Confianza</TableHead>
                  <TableHead>Validado</TableHead>
                  <TableHead>Principal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnoses.map((diag, idx) => (
                  <TableRow key={idx} className={diag.isPrincipal ? "bg-primary/10" : ""}>
                    <TableCell>{diag.code}</TableCell>
                    <TableCell>{diag.description}</TableCell>
                    <TableCell>{(diag.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>{diag.isValidated ? 'Sí' : 'No'}</TableCell>
                    <TableCell>{diag.isPrincipal ? <Star className="h-4 w-4 text-accent fill-accent" /> : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      } else if (entry.module === 'PdfExtraction' && typeof output === 'object' && output !== null && 'structuredData' in output) {
        const pdfOutput = output as { structuredData: PdfStructuredData[], clinicalNotes: string };
        return (
          <Accordion type="single" collapsible className="w-full text-xs">
            <AccordionItem value="pdf-output">
              <AccordionTrigger>Ver Detalles de Extracción PDF</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {pdfOutput.structuredData && pdfOutput.structuredData.length > 0 && (
                  <div>
                    <strong>Datos Estructurados:</strong>
                    <ul className="list-disc pl-4">
                    {pdfOutput.structuredData.map((item, idx) => <li key={idx}><strong>{item.key}:</strong> {item.value}</li>)}
                    </ul>
                  </div>
                )}
                {pdfOutput.clinicalNotes && (
                  <div>
                    <strong>Notas Clínicas:</strong>
                    <pre className="whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{pdfOutput.clinicalNotes}</pre>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      } else if (entry.module === 'MedicalOrders' && typeof output === 'object' && output !== null && 'generatedOrderText' in output) {
          const medicalOrder = output as MedicalOrderOutputState;
          return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{medicalOrder.generatedOrderText}</pre>;
      } else if (entry.module === 'ClinicalAnalysis' && typeof output === 'object' && output !== null && 'clinicalAnalysis' in output) {
        return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as {clinicalAnalysis: string}).clinicalAnalysis}</pre>;
      } else if ((entry.module === 'ImageAnalysis' || entry.module === 'TextAnalysis') && typeof output === 'object' && output !== null && ('summary' in output)) {
        return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as {summary: string}).summary}</pre>;
      } else if (entry.module === 'TreatmentPlanSuggestion' && typeof output === 'object' && output !== null && 'suggestedPlanText' in output) {
        return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{(output as {suggestedPlanText: string}).suggestedPlanText}</pre>;
      }
      // Fallback for other structures or stringified JSON
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{typeof output === 'string' ? output : JSON.stringify(output, null, 2)}</pre>;
    } catch (e) { 
      // If JSON.parse fails for a string or any other error
      return <pre className="text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded-md">{String(entry.fullOutput)}</pre>;
    }
  };
  
  const renderFullInput = (entry: HistoryEntry) => {
     if (!entry.fullInput) return <p className="text-xs text-muted-foreground">No hay detalles de entrada.</p>;
     if (typeof entry.fullInput === 'string' && entry.fullInput.startsWith('Data URI for')) {
        return <p className="text-xs text-muted-foreground">{entry.fullInput}</p>; 
     }
     if (typeof entry.fullInput === 'object') {
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
