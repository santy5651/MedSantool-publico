
// src/components/modules/medical-orders-module.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateMedicalOrder, type GenerateMedicalOrderInput, type GenerateMedicalOrderOutput } from '@/ai/flows/generate-medical-order';
import { useToast } from '@/hooks/use-toast';
import { FileEdit, Eraser, Save, ClipboardCopy, WrapText, Baseline, ALargeSmall, Calculator } from 'lucide-react';
import type { MedicalOrderType, TransferConditionType, MedicalOrderInputState, NursingSurveillanceState } from '@/types';
import { getTextSummary } from '@/lib/utils';
import { useApiKey } from '@/contexts/api-key-context';

interface MedicalOrdersModuleProps {
  id?: string;
}

interface PaduaItem {
  text: string;
  points: number;
  checked: boolean;
}

const initialPaduaItems: Record<string, PaduaItem> = {
  mobility: { text: 'Movilidad reducida (Reposo en cama con/sin asistencia al baño ≥3 días)', points: 3, checked: false },
  cancer: { text: 'Cáncer activo (Presente o diagnosticado en los últimos 6 meses, excluyendo cáncer de piel no melanoma)', points: 3, checked: false },
  thrombophilia: { text: 'Trombofilia conocida (Antecedente personal o familiar, o positividad para factor V Leiden, protrombina 20210A, deficiencia de antitrombina, proteína C o S)', points: 3, checked: false },
  traumaSurgery: { text: 'Trauma o cirugía reciente (<1 mes)', points: 2, checked: false },
  age: { text: 'Edad >70 años', points: 1, checked: false },
  heartFailure: { text: 'Insuficiencia cardíaca o respiratoria', points: 1, checked: false },
  miStroke: { text: 'Infarto agudo de miocardio o ACV isquémico', points: 1, checked: false },
  infectionRheum: { text: 'Infección aguda y/o enfermedad reumatológica', points: 1, checked: false },
  obesity: { text: 'Obesidad (IMC >30 kg/m²)', points: 1, checked: false },
  hormoneTx: { text: 'Tratamiento hormonal en curso', points: 1, checked: false },
};

const surveillanceCategories: Array<{
  title: string;
  items: Array<{ key: keyof NursingSurveillanceState; label: string }>;
}> = [
  {
    title: "Vigilancia Clínica",
    items: [
      { key: 'monitorWounds', label: 'Vigilar heridas' },
      { key: 'monitorBleeding', label: 'Vigilar sangrado' },
      { key: 'monitorPain', label: 'Vigilar dolor' },
      { key: 'vigilarDiuresis', label: 'Vigilar diuresis' },
    ],
  },
  {
    title: "Vías y Dispositivos",
    items: [
      { key: 'cuidadosCateterVenoso', label: 'Cuidados de catéter venoso' },
      { key: 'cuidadosSondaVesical', label: 'Cuidados de sonda vesical' },
      { key: 'cuidadosDrenajesQuirurgicos', label: 'Cuidados de drenajes quirúrgicos' },
      { key: 'cuidadosTraqueostomia', label: 'Cuidados de traqueostomía' },
    ],
  },
  {
    title: "Especiales",
    items: [
      { key: 'controlGlicemicoTurno', label: 'Control glicémico por turno' },
      { key: 'controlGlicemicoAyunas', label: 'Control glicémico en ayunas' },
      { key: 'thermalCurve', label: 'Curva térmica' },
      { key: 'hojaNeurologica', label: 'Hoja neurológica' },
      { key: 'realizarCuraciones', label: 'Realizar curaciones y cuidados de heridas' },
    ],
  },
  {
    title: "Líquidos",
    items: [
      { key: 'restriccionHidrica800', label: 'Restricción hídrica a 800 cc/24 horas' },
      { key: 'controlLiquidosAdminElim', label: 'Control de líquidos administrados y eliminados' },
      { key: 'registroBalanceHidrico24h', label: 'Registro de balance hídrico cada 24 horas' },
      { key: 'calcularDiuresisHoraria', label: 'Calcular diuresis horaria' },
      { key: 'pesoDiario', label: 'Peso diario' },
    ],
  },
];


export function MedicalOrdersModule({ id }: MedicalOrdersModuleProps) {
  const {
    medicalOrderInputs, setMedicalOrderInputs,
    medicalOrderOutput, setMedicalOrderOutput,
    isGeneratingMedicalOrder, setIsGeneratingMedicalOrder,
    medicalOrderError, setMedicalOrderError,
    clearMedicalOrdersModule
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { apiKey, openKeyModal } = useApiKey();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [showPaduaCalculator, setShowPaduaCalculator] = useState(false);
  const [paduaItems, setPaduaItems] = useState<Record<string, PaduaItem>>(JSON.parse(JSON.stringify(initialPaduaItems))); // Deep copy
  const [currentPaduaScore, setCurrentPaduaScore] = useState(0);


  useEffect(() => {
    const score = Object.values(paduaItems).reduce((acc, item) => acc + (item.checked ? item.points : 0), 0);
    setCurrentPaduaScore(score);
  }, [paduaItems]);

  const handlePaduaItemChange = (key: string) => {
    setPaduaItems(prev => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked }
    }));
  };

  const getPaduaRiskInterpretation = (score: number): string => {
    if (score < 4) return `Bajo riesgo (Puntaje: ${score})`;
    return `Alto riesgo (Puntaje: ${score})`;
  };
  
  const handleApplyPaduaScore = () => {
    handleInputChange('paduaScale', `${currentPaduaScore} puntos (${getPaduaRiskInterpretation(currentPaduaScore).split('(')[0].trim()})`);
    setShowPaduaCalculator(false);
     toast({ title: "Puntaje Aplicado", description: `Escala de Padua actualizada a ${currentPaduaScore} puntos.` });
  };

  const handleInputChange = (field: keyof MedicalOrderInputState, value: any) => {
    setMedicalOrderInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleNursingSurveillanceChange = (field: keyof MedicalOrderInputState['nursingSurveillance'], checked: boolean) => {
    setMedicalOrderInputs(prev => ({
      ...prev,
      nursingSurveillance: {
        ...prev.nursingSurveillance,
        [field]: checked
      }
    }));
  };

  const handleNoMedicationReconciliationChange = (checked: boolean) => {
    setMedicalOrderInputs(prev => ({
      ...prev,
      noMedicationReconciliation: checked,
      medicationReconciliationInput: checked ? "NO TIENE CONCILIACIÓN MEDICAMENTOSA" : ""
    }));
  };

  const handleOutputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMedicalOrderOutput({ generatedOrderText: event.target.value });
  };
  
  const handleGenerateOrder = async () => {
    if (!apiKey) {
      openKeyModal();
      return;
    }
    if (!medicalOrderInputs.orderType) {
      toast({ title: "Falta Información", description: "Por favor, seleccione el tipo de orden.", variant: "destructive" });
      return;
    }
    if (!medicalOrderInputs.transferConditions) {
      toast({ title: "Falta Información", description: "Por favor, seleccione las condiciones de traslado.", variant: "destructive" });
      return;
    }

    setIsGeneratingMedicalOrder(true);
    setMedicalOrderError(null);
    let aiOutput: GenerateMedicalOrderOutput | null = null;

    const inputForAI: GenerateMedicalOrderInput = {
        orderType: medicalOrderInputs.orderType as MedicalOrderType,
        oxygen: medicalOrderInputs.oxygen || "NO REQUIERE OXÍGENO",
        isolation: medicalOrderInputs.isolation || "NO REQUIERE AISLAMIENTO",
        diet: medicalOrderInputs.orderType === "HOSPITALIZACIÓN" ? (medicalOrderInputs.diet || "Dieta por definir") : undefined,
        medicationsInput: medicalOrderInputs.medicationsInput || "NO REQUIERE MEDICAMENTOS",
        medicationReconciliationInput: medicalOrderInputs.noMedicationReconciliation ? "NO TIENE CONCILIACIÓN MEDICAMENTOSA" : (medicalOrderInputs.medicationReconciliationInput || "NO TIENE CONCILIACIÓN MEDICAMENTOSA"),
        specialtyFollowUp: medicalOrderInputs.orderType === "HOSPITALIZACIÓN" ? medicalOrderInputs.specialtyFollowUp : undefined,
        fallRisk: medicalOrderInputs.fallRisk || "RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA",
        paduaScale: medicalOrderInputs.paduaScale || "NO APLICA",
        surveillanceNursing: medicalOrderInputs.nursingSurveillance,
        transferConditions: medicalOrderInputs.transferConditions as TransferConditionType,
        specialConsiderations: medicalOrderInputs.specialConsiderations || "NO HAY CONSIDERACIONES ESPECIALES",
    };
    
    try {
      aiOutput = await generateMedicalOrder({ ...inputForAI, apiKey });
      setMedicalOrderOutput({ generatedOrderText: aiOutput.generatedOrderText });
      toast({ title: "Órdenes Generadas", description: "Las órdenes médicas han sido generadas." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'MedicalOrders',
          inputType: 'application/json',
          inputSummary: `Tipo Orden: ${medicalOrderInputs.orderType}`,
          outputSummary: getTextSummary(aiOutput.generatedOrderText, 100),
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating medical order:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setMedicalOrderError(errorMessage);
      toast({ title: "Error al Generar Órdenes", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'MedicalOrders',
          inputType: 'application/json',
          inputSummary: `Tipo Orden: ${medicalOrderInputs.orderType}`,
          outputSummary: 'Error en la generación',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingMedicalOrder(false);
    }
  };

  const handleClearSelection = () => {
    clearMedicalOrdersModule();
    setPaduaItems(JSON.parse(JSON.stringify(initialPaduaItems))); // Reset Padua items
    toast({ title: "Campos Limpiados", description: "Se han limpiado todos los campos de órdenes médicas." });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = medicalOrderOutput.generatedOrderText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Órdenes Copiadas", description: "Las órdenes médicas generadas han sido copiadas." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: "No hay órdenes generadas para copiar." });
    }
  };

  const handleCapitalizeSentenceCase = () => {
    if (medicalOrderOutput.generatedOrderText) {
      const text = medicalOrderOutput.generatedOrderText;
      // Assuming actual newlines \n from AI
      const lines = text.split('\n'); 
      const sentenceCasedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return line; // Keep empty lines as is if they are intentional (e.g. between major sections)
        // Capitalize only if it looks like a sentence start (not all caps title or a list item)
        if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3) { // Likely a title
            return line; 
        }
        return trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1).toLowerCase();
      });
      setMedicalOrderOutput({ generatedOrderText: sentenceCasedLines.join('\n') });
      toast({ title: "Texto Formateado", description: "Las órdenes médicas se han formateado a tipo frase." });
    }
  };

  const handleConvertToUppercase = () => {
    if (medicalOrderOutput.generatedOrderText) {
      setMedicalOrderOutput({ generatedOrderText: medicalOrderOutput.generatedOrderText.toUpperCase() });
      toast({ title: "Texto en Mayúsculas", description: "Las órdenes médicas se han convertido a mayúsculas." });
    }
  };

  const handleCompactText = () => {
    if (medicalOrderOutput.generatedOrderText) {
      // This regex looks for two or more actual newline characters
      const compactedText = medicalOrderOutput.generatedOrderText.replace(/\n{2,}/g, '\n').trim();
      setMedicalOrderOutput({ generatedOrderText: compactedText });
      toast({ title: "Texto Compactado", description: "Se han normalizado los saltos de línea múltiples." });
    }
  };
  
  const handleSaveManually = async () => {
     if (!medicalOrderOutput.generatedOrderText && !medicalOrderError) {
      toast({ title: "Nada que Guardar", description: "Genere las órdenes médicas primero.", variant: "default" });
      return;
    }
    
    const status = medicalOrderError ? 'error' : 'completed';
    const output = medicalOrderError ? { error: medicalOrderError } : medicalOrderOutput;
    const outputSum = medicalOrderError ? 'Error en la generación' : getTextSummary(medicalOrderOutput.generatedOrderText, 100);
    
    const inputForAI: GenerateMedicalOrderInput = {
        orderType: medicalOrderInputs.orderType as MedicalOrderType,
        oxygen: medicalOrderInputs.oxygen || "NO REQUIERE OXÍGENO",
        isolation: medicalOrderInputs.isolation || "NO REQUIERE AISLAMIENTO",
        diet: medicalOrderInputs.orderType === "HOSPITALIZACIÓN" ? (medicalOrderInputs.diet || "Dieta por definir") : undefined,
        medicationsInput: medicalOrderInputs.medicationsInput || "NO REQUIERE MEDICAMENTOS",
        medicationReconciliationInput: medicalOrderInputs.noMedicationReconciliation ? "NO TIENE CONCILIACIÓN MEDICAMENTOSA" : (medicalOrderInputs.medicationReconciliationInput || "NO TIENE CONCILIACIÓN MEDICAMENTOSA"),
        specialtyFollowUp: medicalOrderInputs.orderType === "HOSPITALIZACIÓN" ? medicalOrderInputs.specialtyFollowUp : undefined,
        fallRisk: medicalOrderInputs.fallRisk || "RIESGO DE CAIDAS Y LESIONES POR PRESION SEGUN ESCALAS POR PERSONAL DE ENFERMERIA",
        paduaScale: medicalOrderInputs.paduaScale || "NO APLICA",
        surveillanceNursing: medicalOrderInputs.nursingSurveillance,
        transferConditions: medicalOrderInputs.transferConditions as TransferConditionType,
        specialConsiderations: medicalOrderInputs.specialConsiderations || "NO HAY CONSIDERACIONES ESPECIALES",
    };

    await addHistoryEntry({
      module: 'MedicalOrders',
      inputType: 'application/json',
      inputSummary: `Tipo Orden: ${medicalOrderInputs.orderType || 'N/A'}`,
      outputSummary: outputSum,
      fullInput: inputForAI,
      fullOutput: output,
      status: status,
      errorDetails: medicalOrderError || undefined,
    });
  };

  const orderTypeOptions: MedicalOrderType[] = ["OBSERVACIÓN MENOR A 6 HORAS", "OBSERVACIÓN", "HOSPITALIZACIÓN", "EGRESO"];
  const transferConditionOptions: TransferConditionType[] = ["Grupo 1: Camillero o auxiliar", "Grupo 2: Médico general", "Grupo 3: Médico general por paciente intubado", "NO APLICA"];
  const isObservacionCorta = medicalOrderInputs.orderType === "OBSERVACIÓN MENOR A 6 HORAS";

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Órdenes Médicas Generales"
      description="Complete los campos para generar órdenes médicas detalladas. La IA asistirá en la redacción y formato."
      icon={FileEdit}
      isLoading={isGeneratingMedicalOrder}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderType">Tipo de Orden</Label>
            <Select value={medicalOrderInputs.orderType} onValueChange={(value) => handleInputChange('orderType', value as MedicalOrderType)} disabled={isGeneratingMedicalOrder}>
              <SelectTrigger id="orderType"><SelectValue placeholder="Seleccione tipo..." /></SelectTrigger>
              <SelectContent>
                {orderTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="oxygen">Oxígeno</Label>
            <Input id="oxygen" value={medicalOrderInputs.oxygen} onChange={(e) => handleInputChange('oxygen', e.target.value)} placeholder="Ej: Oxígeno por cánula nasal a 2 L/min" disabled={isGeneratingMedicalOrder}/>
          </div>
          <div>
            <Label htmlFor="isolation">Aislamiento</Label>
            <Input id="isolation" value={medicalOrderInputs.isolation} onChange={(e) => handleInputChange('isolation', e.target.value)} placeholder="Ej: Aislamiento de gotitas" disabled={isGeneratingMedicalOrder}/>
          </div>
          {medicalOrderInputs.orderType === 'HOSPITALIZACIÓN' && (
            <div>
              <Label htmlFor="diet">Dieta</Label>
              <Input id="diet" value={medicalOrderInputs.diet} onChange={(e) => handleInputChange('diet', e.target.value)} placeholder="Ej: Dieta blanda" disabled={isGeneratingMedicalOrder}/>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="medicationsInput">Medicamentos (uno por línea)</Label>
          <Textarea id="medicationsInput" value={medicalOrderInputs.medicationsInput} onChange={(e) => handleInputChange('medicationsInput', e.target.value)} rows={4} placeholder="Ej: Acetaminofén, tabletas 500mg, 1g VO c/8h" disabled={isGeneratingMedicalOrder}/>
        </div>
        
        {!isObservacionCorta && (
          <div className="space-y-2">
            <Label htmlFor="medicationReconciliationInput">Conciliación Medicamentosa</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noMedicationReconciliation"
                checked={medicalOrderInputs.noMedicationReconciliation}
                onCheckedChange={(checked) => handleNoMedicationReconciliationChange(!!checked)}
                disabled={isGeneratingMedicalOrder}
              />
              <Label htmlFor="noMedicationReconciliation" className="text-sm font-normal">
                No tiene conciliación medicamentosa
              </Label>
            </div>
            <Textarea 
              id="medicationReconciliationInput" 
              value={medicalOrderInputs.medicationReconciliationInput} 
              onChange={(e) => handleInputChange('medicationReconciliationInput', e.target.value)} 
              rows={3} 
              placeholder="Ej: Losartán 50mg VO c/día." 
              disabled={isGeneratingMedicalOrder || medicalOrderInputs.noMedicationReconciliation}
              className={medicalOrderInputs.noMedicationReconciliation ? "bg-muted/50" : ""}
            />
          </div>
        )}

        {medicalOrderInputs.orderType === 'HOSPITALIZACIÓN' && (
            <div>
              <Label htmlFor="specialtyFollowUp">Seguimiento por Especialidad</Label>
              <Input 
                id="specialtyFollowUp" 
                value={medicalOrderInputs.specialtyFollowUp || ''} 
                onChange={(e) => handleInputChange('specialtyFollowUp', e.target.value)} 
                placeholder="Ej: Cardiología, Medicina Interna" 
                disabled={isGeneratingMedicalOrder}
              />
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
                <Label htmlFor="fallRisk">Riesgo de Caídas y Lesiones por Presión</Label>
                <Input id="fallRisk" value={medicalOrderInputs.fallRisk} onChange={(e) => handleInputChange('fallRisk', e.target.value)} disabled={isGeneratingMedicalOrder}/>
            </div>
            {!isObservacionCorta && (
              <div className="flex flex-col">
                  <Label htmlFor="paduaScale">Escala de Padua</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="paduaScale" 
                      value={medicalOrderInputs.paduaScale} 
                      onChange={(e) => handleInputChange('paduaScale', e.target.value)} 
                      placeholder="Ej: 3 puntos" 
                      disabled={isGeneratingMedicalOrder}
                      className="flex-grow"
                    />
                    <Dialog open={showPaduaCalculator} onOpenChange={setShowPaduaCalculator}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" title="Calculadora Escala de Padua" disabled={isGeneratingMedicalOrder}>
                          <Calculator className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Calculadora de Escala de Padua</DialogTitle>
                          <DialogDescription>
                            Seleccione los factores de riesgo presentes para calcular el puntaje.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto pr-2">
                          {Object.entries(paduaItems).map(([key, item]) => (
                            <div key={key} className="flex items-center space-x-2 p-2 border rounded-md">
                              <Checkbox
                                id={`padua-${key}`}
                                checked={item.checked}
                                onCheckedChange={() => handlePaduaItemChange(key)}
                              />
                              <Label htmlFor={`padua-${key}`} className="text-sm font-normal flex-grow">
                                {item.text} <span className="font-semibold">({item.points} pts)</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                         <div className="mt-2 p-2 border-t text-sm">
                          <strong>Puntaje Total:</strong> {currentPaduaScore}
                          <br />
                          <strong>Interpretación:</strong> {getPaduaRiskInterpretation(currentPaduaScore)}
                        </div>
                        <DialogFooter className="sm:justify-between">
                          <DialogClose asChild>
                              <Button type="button" variant="outline">Cerrar</Button>
                          </DialogClose>
                          <Button type="button" onClick={handleApplyPaduaScore}>Aplicar Puntaje</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
              </div>
            )}
        </div>
        
        <div>
          <Label>Vigilancia por Enfermería y Personal de Salud</Label>
          <Accordion type="multiple" className="w-full mt-1">
            {surveillanceCategories.map((category) => (
              <AccordionItem value={category.title} key={category.title}>
                <AccordionTrigger>{category.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-2">
                    {category.items.map((item) => (
                      <div key={item.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`nursing-${item.key}`}
                          checked={medicalOrderInputs.nursingSurveillance[item.key]}
                          onCheckedChange={(checked) => handleNursingSurveillanceChange(item.key, !!checked)}
                          disabled={isGeneratingMedicalOrder}
                        />
                        <Label htmlFor={`nursing-${item.key}`} className="text-sm font-normal">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div>
          <Label htmlFor="specialConsiderations">Consideraciones Especiales</Label>
          <Textarea id="specialConsiderations" value={medicalOrderInputs.specialConsiderations} onChange={(e) => handleInputChange('specialConsiderations', e.target.value)} rows={3} placeholder="Notas adicionales..." disabled={isGeneratingMedicalOrder}/>
        </div>

        <div>
            <Label htmlFor="transferConditions">Condiciones de Traslado</Label>
            <Select value={medicalOrderInputs.transferConditions} onValueChange={(value) => handleInputChange('transferConditions', value as TransferConditionType)} disabled={isGeneratingMedicalOrder}>
              <SelectTrigger id="transferConditions"><SelectValue placeholder="Seleccione condiciones..." /></SelectTrigger>
              <SelectContent>
                {transferConditionOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={handleGenerateOrder} disabled={isGeneratingMedicalOrder || !medicalOrderInputs.orderType || !medicalOrderInputs.transferConditions} className="flex-1">
            <FileEdit className="mr-2 h-4 w-4" />
            Generar
          </Button>
          <Button onClick={handleClearSelection} variant="outline" disabled={isGeneratingMedicalOrder} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {medicalOrderOutput.generatedOrderText !== null && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Órdenes Médicas Generadas:</h3>
            <Textarea
              ref={outputTextareaRef}
              value={medicalOrderOutput.generatedOrderText}
              onChange={handleOutputChange}
              rows={15}
              className="bg-muted/30"
              disabled={isGeneratingMedicalOrder}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={isGeneratingMedicalOrder}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button onClick={handleCapitalizeSentenceCase} variant="outline" size="sm" disabled={isGeneratingMedicalOrder}>
                <Baseline className="mr-2 h-4 w-4" /> 
                Formato Frase
              </Button>
              <Button onClick={handleConvertToUppercase} variant="outline" size="sm" disabled={isGeneratingMedicalOrder}>
                <ALargeSmall className="mr-2 h-4 w-4" />
                Todo Mayúsculas
              </Button>
              <Button onClick={handleCompactText} variant="outline" size="sm" disabled={isGeneratingMedicalOrder}>
                <WrapText className="mr-2 h-4 w-4" /> 
                Compactar Texto
              </Button>
            </div>
          </div>
        )}
        {medicalOrderError && (
          <p className="text-sm text-destructive">Error: {medicalOrderError}</p>
        )}
        
        {!isAutoSaveEnabled && (medicalOrderOutput.generatedOrderText !== null || medicalOrderError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingMedicalOrder}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
