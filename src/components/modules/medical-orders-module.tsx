
// src/components/modules/medical-orders-module.tsx
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateMedicalOrder, type GenerateMedicalOrderInput, type GenerateMedicalOrderOutput } from '@/ai/flows/generate-medical-order';
import { useToast } from '@/hooks/use-toast';
import { FileEdit, Eraser, Save, ClipboardCopy, WrapText, Baseline } from 'lucide-react';
import type { MedicalOrderType, TransferConditionType, MedicalOrderInputState } from '@/types';
import { getTextSummary } from '@/lib/utils';

export function MedicalOrdersModule() {
  const {
    medicalOrderInputs, setMedicalOrderInputs,
    medicalOrderOutput, setMedicalOrderOutput,
    isGeneratingMedicalOrder, setIsGeneratingMedicalOrder,
    medicalOrderError, setMedicalOrderError,
    clearMedicalOrdersModule
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

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
  
  const handleGenerateOrder = async () => {
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
      aiOutput = await generateMedicalOrder(inputForAI);
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
    toast({ title: "Campos Limpiados", description: "Se han limpiado todos los campos de órdenes médicas." });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = medicalOrderOutput.generatedOrderText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Copiado al Portapapeles", description: "Las órdenes médicas generadas han sido copiadas." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: "No hay órdenes generadas para copiar." });
    }
  };

  const handleCapitalizeSentenceCase = () => {
    if (medicalOrderOutput.generatedOrderText) {
      const text = medicalOrderOutput.generatedOrderText;
      const lowercasedText = text.toLowerCase();
      const lines = lowercasedText.split('\n');
      const sentenceCasedLines = lines.map(line => {
        if (line.trim().length === 0) return line; // Mantener líneas vacías si existen
        return line.charAt(0).toUpperCase() + line.slice(1);
      });
      setMedicalOrderOutput({ generatedOrderText: sentenceCasedLines.join('\n') });
      toast({ title: "Texto Formateado", description: "Las órdenes médicas se han formateado a tipo frase." });
    }
  };

  const handleCompactText = () => {
    if (medicalOrderOutput.generatedOrderText) {
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

  const orderTypeOptions: MedicalOrderType[] = ["OBSERVACIÓN", "HOSPITALIZACIÓN", "EGRESO"];
  const transferConditionOptions: TransferConditionType[] = ["Grupo 1: Camillero o auxiliar", "Grupo 2: Médico general", "Grupo 3: Médico general por paciente intubado", "NO APLICA"];

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Órdenes Médicas Generales"
      description="Complete los campos para generar órdenes médicas detalladas. La IA asistirá en la redacción y formato."
      icon={FileEdit}
      isLoading={isGeneratingMedicalOrder}
      id="medical-orders-module"
    >
      <div className="space-y-4">
        {/* Input Fields */}
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="fallRisk">Riesgo de Caídas y Lesiones por Presión</Label>
                <Input id="fallRisk" value={medicalOrderInputs.fallRisk} onChange={(e) => handleInputChange('fallRisk', e.target.value)} disabled={isGeneratingMedicalOrder}/>
            </div>
            <div>
                <Label htmlFor="paduaScale">Escala de Padua</Label>
                <Input id="paduaScale" value={medicalOrderInputs.paduaScale} onChange={(e) => handleInputChange('paduaScale', e.target.value)} placeholder="Ej: 3 puntos" disabled={isGeneratingMedicalOrder}/>
            </div>
        </div>
        
        <div>
          <Label>Vigilancia por Enfermería y Personal de Salud</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {(Object.keys(medicalOrderInputs.nursingSurveillance) as Array<keyof MedicalOrderInputState['nursingSurveillance']>).map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`nursing-${key}`}
                  checked={medicalOrderInputs.nursingSurveillance[key]}
                  onCheckedChange={(checked) => handleNursingSurveillanceChange(key, !!checked)}
                  disabled={isGeneratingMedicalOrder}
                />
                <Label htmlFor={`nursing-${key}`} className="text-sm font-normal capitalize">
                  {key === 'thermalCurve' ? 'Curva térmica' :
                   key === 'monitorPain' ? 'Vigilar dolor' :
                   key === 'monitorWounds' ? 'Vigilar heridas' :
                   key === 'monitorBleeding' ? 'Vigilar sangrado' : key}
                </Label>
              </div>
            ))}
          </div>
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

        <div>
          <Label htmlFor="specialConsiderations">Consideraciones Especiales</Label>
          <Textarea id="specialConsiderations" value={medicalOrderInputs.specialConsiderations} onChange={(e) => handleInputChange('specialConsiderations', e.target.value)} rows={3} placeholder="Notas adicionales..." disabled={isGeneratingMedicalOrder}/>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={handleGenerateOrder} disabled={isGeneratingMedicalOrder || !medicalOrderInputs.orderType || !medicalOrderInputs.transferConditions} className="flex-1">
            <FileEdit className="mr-2 h-4 w-4" />
            Generar Órdenes
          </Button>
          <Button onClick={handleClearSelection} variant="outline" disabled={isGeneratingMedicalOrder} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Campos
          </Button>
        </div>

        {/* Output Display */}
        {medicalOrderOutput.generatedOrderText && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Órdenes Médicas Generadas:</h3>
            <Textarea
              ref={outputTextareaRef}
              value={medicalOrderOutput.generatedOrderText}
              readOnly
              rows={15}
              className="bg-muted/30"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copiar Selección
              </Button>
              <Button onClick={handleCapitalizeSentenceCase} variant="outline" size="sm">
                <Baseline className="mr-2 h-4 w-4" /> 
                Formato Frase
              </Button>
              <Button onClick={handleCompactText} variant="outline" size="sm">
                <WrapText className="mr-2 h-4 w-4" /> 
                Compactar Texto
              </Button>
            </div>
          </div>
        )}
        {medicalOrderError && (
          <p className="text-sm text-destructive">Error: {medicalOrderError}</p>
        )}
        
        {!isAutoSaveEnabled && (medicalOrderOutput.generatedOrderText || medicalOrderError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}

