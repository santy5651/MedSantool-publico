
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Eraser, Save, AlertTriangle, Info, ChevronsUpDown, Check } from 'lucide-react';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { useToast } from '@/hooks/use-toast';
import type { MedicationInfo, MedicationUsage, DoseUnit, DoseCalculatorInputState } from '@/types';
import { initialMedicationsList, commonDoseUnits, infusionDrugAmountUnits } from '@/lib/medication-data';
import { cn, getTextSummary } from '@/lib/utils';

interface DoseCalculatorModuleProps {
  id?: string;
}

export function DoseCalculatorModule({ id }: DoseCalculatorModuleProps) {
  const {
    doseCalculatorInputs,
    setDoseCalculatorInputs,
    doseCalculatorOutput,
    setDoseCalculatorOutput,
    isCalculatingDose,
    setIsCalculatingDose,
    doseCalculationError, // Using this for UI display of errors from calculation logic
    setDoseCalculationError,
    clearDoseCalculatorModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();

  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationComboboxOpen, setMedicationComboboxOpen] = useState(false);

  const filteredMedications = useMemo(() => {
    if (!medicationSearch) return initialMedicationsList;
    return initialMedicationsList.filter(med => 
      med.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
      med.keywords?.some(kw => kw.toLowerCase().includes(medicationSearch.toLowerCase()))
    );
  }, [medicationSearch]);


  const handleInputChange = (field: keyof DoseCalculatorInputState, value: any) => {
    setDoseCalculatorInputs(prev => ({ ...prev, [field]: value }));
    // Reset outputs if key inputs change
    if (['patientWeight', 'medicationName', 'selectedMedication', 'selectedUsage', 'doseToUse', 'doseUnit', 'infusionDrugAmount', 'infusionDrugAmountUnit', 'infusionTotalVolume'].includes(field)) {
        setDoseCalculatorOutput({
            calculatedBolusDose: null,
            calculatedInfusionRate: null,
            calculatedConcentration: null,
            calculationWarning: null,
            calculationError: null,
        });
        setDoseCalculationError(null);
    }
  };
  
  const handleMedicationSelect = (med: MedicationInfo | null) => {
    setDoseCalculatorInputs(prev => ({
      ...prev,
      selectedMedication: med,
      medicationName: med ? med.name : '',
      selectedUsage: med && med.usages.length > 0 ? med.usages[0] : null, // Auto-select first usage
      doseToUse: '',
      doseUnit: med && med.usages.length > 0 ? med.usages[0].unit as DoseUnit : '',
      isInfusion: med && med.usages.length > 0 ? med.usages[0].type === 'infusion' : false,
      useSuggestedDose: false,
      infusionDrugAmount: med?.defaultConcentration?.totalDrugAmount?.toString() || '',
      infusionDrugAmountUnit: med?.defaultConcentration?.totalDrugAmountUnit || '',
      infusionTotalVolume: med?.defaultConcentration?.totalVolume?.toString() || '',
    }));
    setMedicationSearch('');
    setMedicationComboboxOpen(false);
  };

  const handleUsageSelect = (usageId: string) => {
    const usage = doseCalculatorInputs.selectedMedication?.usages.find(u => u.protocol === usageId) || null;
    if (usage) {
      setDoseCalculatorInputs(prev => ({
        ...prev,
        selectedUsage: usage,
        doseToUse: '', // Reset dose when usage changes
        doseUnit: usage.unit as DoseUnit,
        isInfusion: usage.type === 'infusion',
        useSuggestedDose: false,
      }));
    }
  };
  
  const handleUseSuggestedDoseChange = (checked: boolean) => {
    handleInputChange('useSuggestedDose', checked);
    if (checked && doseCalculatorInputs.selectedUsage?.doseNumerical) {
      const suggestedDose = doseCalculatorInputs.selectedUsage.doseNumerical.value ?? doseCalculatorInputs.selectedUsage.doseNumerical.min ?? '';
      handleInputChange('doseToUse', String(suggestedDose));
      handleInputChange('doseUnit', doseCalculatorInputs.selectedUsage.unit as DoseUnit);
    } else if (!checked) {
      // Optionally clear or leave as is, user might want to adjust manually
      // handleInputChange('doseToUse', ''); 
    }
  };

  const performCalculations = () => {
    setIsCalculatingDose(true);
    setDoseCalculatorOutput({ calculatedBolusDose: null, calculatedInfusionRate: null, calculatedConcentration: null, calculationWarning: null, calculationError: null });
    setDoseCalculationError(null);

    const weight = parseFloat(doseCalculatorInputs.patientWeight);
    const dose = parseFloat(doseCalculatorInputs.doseToUse);
    const unit = doseCalculatorInputs.doseUnit;
    const med = doseCalculatorInputs.selectedMedication;
    const usage = doseCalculatorInputs.selectedUsage;

    if (isNaN(weight) || weight <= 0) {
      setDoseCalculationError("El peso del paciente debe ser un número positivo.");
      setIsCalculatingDose(false);
      return;
    }
    if (!med || !usage) {
      setDoseCalculationError("Seleccione un medicamento y un uso/protocolo.");
      setIsCalculatingDose(false);
      return;
    }
     if (isNaN(dose) || dose < 0) { // Dose can be 0 for some protocols (e.g. stop infusion)
      setDoseCalculationError("La dosis a usar debe ser un número válido.");
      setIsCalculatingDose(false);
      return;
    }
    if (!unit) {
      setDoseCalculationError("Seleccione una unidad de dosis.");
      setIsCalculatingDose(false);
      return;
    }

    let calculatedBolus: string | null = null;
    let calculatedRate: string | null = null;
    let calculatedConcDisplay: string | null = null;
    let warningMsg: string | null = null;

    try {
      if (usage.type === 'bolus') {
        if (unit.includes('/kg')) { // Dose is weight-based
          const totalDose = dose * weight;
          calculatedBolus = `${totalDose.toFixed(2)} ${unit.replace('/kg', '')}`;
        } else { // Dose is fixed
          calculatedBolus = `${dose.toFixed(2)} ${unit}`;
        }
      } else if (usage.type === 'infusion') {
        const drugAmount = parseFloat(doseCalculatorInputs.infusionDrugAmount);
        const drugAmountUnit = doseCalculatorInputs.infusionDrugAmountUnit;
        const totalVolume = parseFloat(doseCalculatorInputs.infusionTotalVolume);

        if (isNaN(drugAmount) || drugAmount <= 0 || !drugAmountUnit || isNaN(totalVolume) || totalVolume <= 0) {
          setDoseCalculationError("Para infusiones, complete los detalles de dilución (cantidad, unidad y volumen).");
          setIsCalculatingDose(false);
          return;
        }

        let concentrationMcgPerMl: number;
        const drugAmountMcg = drugAmountUnit === 'mg' ? drugAmount * 1000 : drugAmount;
        concentrationMcgPerMl = drugAmountMcg / totalVolume;
        calculatedConcDisplay = `${concentrationMcgPerMl.toFixed(2)} mcg/ml`;

        let doseMcgKgMin: number | null = null;
        let doseMcgMin: number | null = null;
        let doseMcgKgHora: number | null = null;
        let doseMcgHora: number | null = null;

        if (unit === 'mcg/kg/min') doseMcgKgMin = dose;
        else if (unit === 'mg/kg/min') doseMcgKgMin = dose * 1000;
        else if (unit === 'mcg/min') doseMcgMin = dose;
        else if (unit === 'mg/min') doseMcgMin = dose * 1000;
        else if (unit === 'mcg/kg/hora') doseMcgKgHora = dose;
        else if (unit === 'mg/kg/hora') doseMcgKgHora = dose * 1000;
        else if (unit === 'ml/hora') {
             // This case means the user *input* ml/hr, we might calculate total drug delivered or something else.
             // For now, if unit is ml/hr, we assume it's the target rate and don't calculate it.
             warningMsg = "La unidad 'ml/hora' se interpreta como una tasa de infusión objetivo, no se calcula una nueva tasa.";
             calculatedRate = `${dose.toFixed(2)} ml/hora`;
        } else {
          setDoseCalculationError(`Unidad de dosis para infusión (${unit}) no soportada para cálculo de ml/hr.`);
          setIsCalculatingDose(false);
          return;
        }
        
        if (calculatedRate === null) { // Only calculate if not already set by ml/hr input
            let totalDoseMcgPerHr: number;
            if (doseMcgKgMin !== null) totalDoseMcgPerHr = doseMcgKgMin * weight * 60;
            else if (doseMcgMin !== null) totalDoseMcgPerHr = doseMcgMin * 60;
            else if (doseMcgKgHora !== null) totalDoseMcgPerHr = doseMcgKgHora * weight;
            else if (doseMcgHora !== null) totalDoseMcgPerHr = doseMcgHora;
            else {
                setDoseCalculationError("No se pudo determinar la tasa de dosis total para la infusión.");
                setIsCalculatingDose(false);
                return;
            }
            
            if (concentrationMcgPerMl > 0) {
              const rateMlHr = totalDoseMcgPerHr / concentrationMcgPerMl;
              calculatedRate = `${rateMlHr.toFixed(2)} ml/hora`;
            } else {
              setDoseCalculationError("La concentración calculada es cero, no se puede determinar la velocidad de perfusión.");
              setIsCalculatingDose(false);
              return;
            }
        }
      }

      setDoseCalculatorOutput({
        calculatedBolusDose: calculatedBolus,
        calculatedInfusionRate: calculatedRate,
        calculatedConcentration: calculatedConcDisplay,
        calculationWarning: warningMsg,
        calculationError: null,
      });

      if (isAutoSaveEnabled) {
        saveToHistory(calculatedBolus, calculatedRate, calculatedConcDisplay, warningMsg, null);
      }

    } catch (e: any) {
      console.error("Calculation error:", e);
      setDoseCalculationError(e.message || "Error desconocido durante el cálculo.");
      if (isAutoSaveEnabled) {
        saveToHistory(null, null, null, null, e.message);
      }
    } finally {
      setIsCalculatingDose(false);
    }
  };

  const handleClear = () => {
    clearDoseCalculatorModule();
    setMedicationSearch('');
    setMedicationComboboxOpen(false);
    setDoseCalculationError(null); // Clear specific UI error too
    toast({ title: "Campos Limpiados", description: "Se han restablecido los campos de la calculadora." });
  };

  const saveToHistory = async (bolus: string | null, rate: string | null, conc: string | null, warning: string | null, error: string | null) => {
    const outputSummary = error 
      ? "Error en cálculo" 
      : `${bolus ? `Bolo: ${bolus}. ` : ''}${rate ? `Infusión: ${rate}. ` : ''}${conc ? `Conc: ${conc}.` : ''}`.trim() || "Cálculo realizado";
    
    await addHistoryEntry({
      module: 'DoseCalculator',
      inputType: 'application/json',
      inputSummary: `Peso: ${doseCalculatorInputs.patientWeight}kg, Med: ${doseCalculatorInputs.selectedMedication?.name || doseCalculatorInputs.medicationName}`,
      outputSummary: getTextSummary(outputSummary, 100),
      fullInput: doseCalculatorInputs,
      fullOutput: { 
        calculatedBolusDose: bolus, 
        calculatedInfusionRate: rate, 
        calculatedConcentration: conc,
        calculationWarning: warning,
        calculationError: error
      },
      status: error ? 'error' : 'completed',
      errorDetails: error || undefined,
    });
  };

  const handleSaveManually = () => {
    if (!doseCalculatorOutput.calculatedBolusDose && !doseCalculatorOutput.calculatedInfusionRate && !doseCalculationError && !doseCalculatorOutput.calculationWarning) {
      toast({ title: "Nada que Guardar", description: "Realice un cálculo primero.", variant: "default" });
      return;
    }
    saveToHistory(
        doseCalculatorOutput.calculatedBolusDose, 
        doseCalculatorOutput.calculatedInfusionRate,
        doseCalculatorOutput.calculatedConcentration,
        doseCalculatorOutput.calculationWarning,
        doseCalculatorOutput.calculationError || doseCalculationError // Prioritize specific UI error if present
    );
  };
  

  return (
    <ModuleCardWrapper
      id={id}
      title="Calculadora de Dosis y Perfusión"
      description="Calcule bolos, infusiones y dosis de medicamentos. Seleccione o ingrese el medicamento y complete los campos requeridos."
      icon={Calculator}
      isLoading={isCalculatingDose}
    >
      <div className="space-y-4">
        {/* Patient Weight */}
        <div>
          <Label htmlFor="patientWeight">Peso del Paciente (Kg)</Label>
          <Input
            id="patientWeight"
            type="number"
            value={doseCalculatorInputs.patientWeight}
            onChange={(e) => handleInputChange('patientWeight', e.target.value)}
            placeholder="Ej: 70"
            min="0"
          />
        </div>

        {/* Medication Selection */}
        <div>
          <Label htmlFor="medicationName">Medicamento</Label>
          <Popover open={medicationComboboxOpen} onOpenChange={setMedicationComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={medicationComboboxOpen}
                className="w-full justify-between"
              >
                {doseCalculatorInputs.selectedMedication
                  ? doseCalculatorInputs.selectedMedication.name
                  : doseCalculatorInputs.medicationName || "Seleccionar o escribir medicamento..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput 
                    placeholder="Buscar medicamento..."
                    value={medicationSearch}
                    onValueChange={setMedicationSearch}
                />
                <CommandList>
                  <CommandEmpty>No se encontró el medicamento.</CommandEmpty>
                  <CommandGroup>
                    {filteredMedications.map((med) => (
                      <CommandItem
                        key={med.id}
                        value={med.name}
                        onSelect={() => handleMedicationSelect(med)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            doseCalculatorInputs.selectedMedication?.id === med.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {med.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Allow manual input if medication not in list, or for quick entry */}
           {!doseCalculatorInputs.selectedMedication && (
             <Input
                id="manualMedicationName"
                type="text"
                value={doseCalculatorInputs.medicationName}
                onChange={(e) => handleInputChange('medicationName', e.target.value)}
                placeholder="O escribir nombre manualmente"
                className="mt-1 text-sm"
             />
           )}
        </div>

        {/* Suggested Dose / Usage Selection */}
        {doseCalculatorInputs.selectedMedication && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base">Usos y Dosis Sugeridas para {doseCalculatorInputs.selectedMedication.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {doseCalculatorInputs.selectedMedication.usages.length > 1 && (
                <div>
                  <Label htmlFor="medicationUsage">Seleccionar Uso/Protocolo:</Label>
                  <Select
                    value={doseCalculatorInputs.selectedUsage?.protocol || ''}
                    onValueChange={handleUsageSelect}
                  >
                    <SelectTrigger id="medicationUsage">
                      <SelectValue placeholder="Seleccione un uso..." />
                    </SelectTrigger>
                    <SelectContent>
                      {doseCalculatorInputs.selectedMedication.usages.map(u => (
                        <SelectItem key={u.protocol} value={u.protocol}>{u.protocol} ({u.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {doseCalculatorInputs.selectedUsage && (
                <div className="p-3 border rounded-md bg-background text-sm space-y-1">
                  <p><strong>Protocolo:</strong> {doseCalculatorInputs.selectedUsage.protocol}</p>
                  <p><strong>Dosis Sugerida:</strong> {doseCalculatorInputs.selectedUsage.doseRange} ({doseCalculatorInputs.selectedUsage.unit})</p>
                  {doseCalculatorInputs.selectedUsage.notes && <p className="text-xs text-muted-foreground"><em>Nota: {doseCalculatorInputs.selectedUsage.notes}</em></p>}
                  {doseCalculatorInputs.selectedUsage.doseNumerical && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="useSuggestedDose"
                        checked={doseCalculatorInputs.useSuggestedDose}
                        onCheckedChange={(checked) => handleUseSuggestedDoseChange(!!checked)}
                      />
                      <Label htmlFor="useSuggestedDose" className="text-sm font-normal">
                        Usar dosis sugerida ({doseCalculatorInputs.selectedUsage.doseNumerical.value ?? doseCalculatorInputs.selectedUsage.doseNumerical.min} {doseCalculatorInputs.selectedUsage.unit}) en el siguiente campo
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dose to Use & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="doseToUse">Dosis a Usar</Label>
            <Input
              id="doseToUse"
              type="number"
              value={doseCalculatorInputs.doseToUse}
              onChange={(e) => handleInputChange('doseToUse', e.target.value)}
              placeholder="Ej: 2.5"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="doseUnit">Unidad de Dosis</Label>
            <Select
              value={doseCalculatorInputs.doseUnit}
              onValueChange={(value) => handleInputChange('doseUnit', value as DoseUnit)}
            >
              <SelectTrigger id="doseUnit"><SelectValue placeholder="Seleccione unidad..." /></SelectTrigger>
              <SelectContent>
                {commonDoseUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Infusion Details (Conditional) */}
        {doseCalculatorInputs.isInfusion && (
          <Card className="bg-muted/40">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base">Detalles de la Infusión</CardTitle>
              <CardDescription>Complete para calcular la velocidad en ml/hora.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="infusionDrugAmount">Cantidad de Medicamento en Infusión</Label>
                  <Input
                    id="infusionDrugAmount"
                    type="number"
                    value={doseCalculatorInputs.infusionDrugAmount}
                    onChange={(e) => handleInputChange('infusionDrugAmount', e.target.value)}
                    placeholder="Ej: 4"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="infusionDrugAmountUnit">Unidad (Cantidad)</Label>
                  <Select
                    value={doseCalculatorInputs.infusionDrugAmountUnit}
                    onValueChange={(value) => handleInputChange('infusionDrugAmountUnit', value as 'mg' | 'mcg')}
                  >
                    <SelectTrigger id="infusionDrugAmountUnit"><SelectValue placeholder="mg o mcg" /></SelectTrigger>
                    <SelectContent>
                      {infusionDrugAmountUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="infusionTotalVolume">Volumen Total de Solución (ml)</Label>
                <Input
                  id="infusionTotalVolume"
                  type="number"
                  value={doseCalculatorInputs.infusionTotalVolume}
                  onChange={(e) => handleInputChange('infusionTotalVolume', e.target.value)}
                  placeholder="Ej: 250"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button onClick={performCalculations} disabled={isCalculatingDose} className="flex-1">
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Dosis/Infusión
          </Button>
          <Button onClick={handleClear} variant="outline" className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Campos
          </Button>
        </div>

        {/* Results Display */}
        {(doseCalculatorOutput.calculatedBolusDose || doseCalculatorOutput.calculatedInfusionRate || doseCalculatorOutput.calculatedConcentration || doseCalculatorOutput.calculationWarning || doseCalculationError) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resultados del Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {doseCalculatorOutput.calculatedBolusDose && (
                <p><strong>Bolo Total Estimado:</strong> {doseCalculatorOutput.calculatedBolusDose}</p>
              )}
              {doseCalculatorOutput.calculatedConcentration && (
                <p><strong>Concentración de Infusión:</strong> {doseCalculatorOutput.calculatedConcentration}</p>
              )}
              {doseCalculatorOutput.calculatedInfusionRate && (
                <p><strong>Velocidad de Perfusión Estimada:</strong> {doseCalculatorOutput.calculatedInfusionRate}</p>
              )}
              {doseCalculatorOutput.calculationWarning && (
                <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                  <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle className="text-yellow-700 dark:text-yellow-300">Advertencia</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-500">
                    {doseCalculatorOutput.calculationWarning}
                  </AlertDescription>
                </Alert>
              )}
              {doseCalculationError && ( // Display specific UI error
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error en Cálculo</AlertTitle>
                  <AlertDescription>{doseCalculationError}</AlertDescription>
                </Alert>
              )}
               {!isAutoSaveEnabled && (
                <Button onClick={handleSaveManually} variant="secondary" size="sm" className="w-full mt-3">
                  <Save className="mr-2 h-4 w-4" /> Guardar en Historial
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleCardWrapper>
  );
}

    