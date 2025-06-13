
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
import { Calculator, Eraser, Save, AlertTriangle, Info, ChevronsUpDown, Check, Filter } from 'lucide-react';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { useToast } from '@/hooks/use-toast';
import type { MedicationInfo, MedicationUsage, DoseUnit, DoseCalculatorInputState } from '@/types';
import { initialMedicationsList, commonDoseUnits, infusionDrugAmountUnits, getAllMedicationCategories } from '@/lib/medication-data';
import { cn, getTextSummary } from '@/lib/utils';

interface DoseCalculatorModuleProps {
  id?: string;
}

const ALL_CATEGORIES_VALUE = "__ALL_CATEGORIES__";

export function DoseCalculatorModule({ id }: DoseCalculatorModuleProps) {
  const {
    doseCalculatorInputs,
    setDoseCalculatorInputs,
    doseCalculatorOutput,
    setDoseCalculatorOutput,
    isCalculatingDose,
    setIsCalculatingDose,
    doseCalculationError, 
    setDoseCalculationError,
    clearDoseCalculatorModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();

  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationComboboxOpen, setMedicationComboboxOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES_VALUE);
  const medicationCategories = useMemo(() => getAllMedicationCategories(), []);


  const filteredMedications = useMemo(() => {
    let medications = initialMedicationsList;

    if (categoryFilter && categoryFilter !== ALL_CATEGORIES_VALUE) {
      const normalizedFilter = categoryFilter.toLowerCase().replace(/ /g, '_');
      medications = medications.filter(med => 
        med.categories.some(cat => cat.toLowerCase().replace(/_protocol$/, '').includes(normalizedFilter))
      );
    }

    if (!medicationSearch.trim()) return medications;
    
    return medications.filter(med => 
      med.name.toLowerCase().includes(medicationSearch.toLowerCase().trim()) ||
      med.keywords?.some(kw => kw.toLowerCase().includes(medicationSearch.toLowerCase().trim()))
    );
  }, [medicationSearch, categoryFilter]);


  const handleInputChange = (field: keyof DoseCalculatorInputState, value: any) => {
    setDoseCalculatorInputs(prev => ({ ...prev, [field]: value }));
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
      selectedUsage: med && med.usages.length > 0 ? med.usages[0] : null,
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
        doseToUse: '', 
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
      setDoseCalculationError("Seleccione un medicamento y un uso/protocolo, o ingrese manualmente si no está en la lista.");
      setIsCalculatingDose(false);
      return;
    }
     if (isNaN(dose) || dose < 0) { 
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
        if (unit.includes('/kg')) { 
          const totalDose = dose * weight;
          calculatedBolus = `${totalDose.toFixed(2)} ${unit.replace('/kg', '')}`;
        } else { 
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
             warningMsg = "La unidad 'ml/hora' se interpreta como una tasa de infusión objetivo, no se calcula una nueva tasa.";
             calculatedRate = `${dose.toFixed(2)} ml/hora`;
        } else {
          setDoseCalculationError(`Unidad de dosis para infusión (${unit}) no soportada para cálculo de ml/hr.`);
          setIsCalculatingDose(false);
          return;
        }
        
        if (calculatedRate === null) { 
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
    setDoseCalculationError(null); 
    setCategoryFilter(ALL_CATEGORIES_VALUE);
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
        doseCalculatorOutput.calculationError || doseCalculationError 
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

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end">
            <div>
                <Label htmlFor="medicationCategoryFilter">Filtrar por Categoría</Label>
                <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setMedicationSearch(''); }}>
                    <SelectTrigger id="medicationCategoryFilter" className="w-full">
                        <SelectValue placeholder="Todas las categorías..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem>
                        {medicationCategories.filter(Boolean).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {categoryFilter && categoryFilter !== ALL_CATEGORIES_VALUE && (
                 <Button variant="ghost" size="sm" onClick={() => {setCategoryFilter(ALL_CATEGORIES_VALUE); setMedicationSearch('');}} className="self-end mb-1">
                    <Filter className="mr-1 h-4 w-4" /> Quitar Filtro
                </Button>
            )}
        </div>


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
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[300px] overflow-y-auto">
              <Command>
                <CommandInput 
                    placeholder="Buscar medicamento..."
                    value={medicationSearch}
                    onValueChange={setMedicationSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {filteredMedications.length === 0 && (medicationSearch.trim() || (categoryFilter !== ALL_CATEGORIES_VALUE)) ? "No se encontró el medicamento con los filtros actuales." : "No se encontró el medicamento."}
                  </CommandEmpty>
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
           {!doseCalculatorInputs.selectedMedication && (
             <Input
                id="manualMedicationName"
                type="text"
                value={doseCalculatorInputs.medicationName}
                onChange={(e) => handleInputChange('medicationName', e.target.value)}
                placeholder="O escribir nombre manualmente si no está en la lista"
                className="mt-1 text-sm text-muted-foreground"
             />
           )}
        </div>

        {doseCalculatorInputs.selectedMedication && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base">Usos y Dosis Sugeridas para {doseCalculatorInputs.selectedMedication.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {doseCalculatorInputs.selectedMedication.usages.length > 1 ? (
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
                      {doseCalculatorInputs.selectedMedication.usages
                        .filter(u => u.protocol && u.protocol.trim() !== "")
                        .map(u => (
                        <SelectItem key={u.protocol} value={u.protocol}>{u.protocol} ({u.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : doseCalculatorInputs.selectedMedication.usages.length === 1 && doseCalculatorInputs.selectedMedication.usages[0].protocol && doseCalculatorInputs.selectedMedication.usages[0].protocol.trim() !== "" && (
                 <div className="text-sm p-2 border rounded-md bg-background">
                    <p><strong>Protocolo Único:</strong> {doseCalculatorInputs.selectedMedication.usages[0].protocol} ({doseCalculatorInputs.selectedMedication.usages[0].type})</p>
                 </div>
              )}

              {doseCalculatorInputs.selectedUsage && (
                <div className="p-3 border rounded-md bg-background text-sm space-y-1">
                  <p><strong>Dosis Sugerida para "{doseCalculatorInputs.selectedUsage.protocol}":</strong> {doseCalculatorInputs.selectedUsage.doseRange} ({doseCalculatorInputs.selectedUsage.unit})</p>
                  {doseCalculatorInputs.selectedUsage.notes && <p className="text-xs text-muted-foreground"><em>Nota: {doseCalculatorInputs.selectedUsage.notes}</em></p>}
                  {doseCalculatorInputs.selectedUsage.doseNumerical && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="useSuggestedDose"
                        checked={doseCalculatorInputs.useSuggestedDose}
                        onCheckedChange={(checked) => handleUseSuggestedDoseChange(!!checked)}
                      />
                      <Label htmlFor="useSuggestedDose" className="text-sm font-normal">
                        Usar dosis sugerida ({doseCalculatorInputs.selectedUsage.doseNumerical.value ?? doseCalculatorInputs.selectedUsage.doseNumerical.min} {doseCalculatorInputs.selectedUsage.unit})
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                {commonDoseUnits.filter(Boolean).map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
                      {infusionDrugAmountUnits.filter(Boolean).map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
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

        <div className="flex space-x-2">
          <Button onClick={performCalculations} disabled={isCalculatingDose || !doseCalculatorInputs.patientWeight || (!doseCalculatorInputs.selectedMedication && !doseCalculatorInputs.medicationName.trim()) || !doseCalculatorInputs.doseToUse || !doseCalculatorInputs.doseUnit } className="flex-1">
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Dosis/Infusión
          </Button>
          <Button onClick={handleClear} variant="outline" className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Campos
          </Button>
        </div>

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
              {doseCalculationError && ( 
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
