
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useView } from '@/contexts/view-context';
import { BrainCircuit, CheckCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export function AboutDialog() {
  const { isAboutModalOpen, setIsAboutModalOpen } = useView();

  const features = [
    "Mejora de redacción médica con IA",
    "Análisis de imágenes médicas (radiografías)",
    "Extracción de datos de documentos PDF",
    "Sugerencia de diagnósticos (CIE-10)",
    "Generación de órdenes médicas estructuradas",
    "Soporte para planes terapéuticos",
    "Generación de consejos y recomendaciones al paciente",
    "Creación de justificaciones médicas",
    "Asistente de chat médico con citas a fuentes",
    "Calculadora de dosis y perfusiones",
    "Generador de resúmenes de egreso hospitalario",
    "Estandarizador de resultados de laboratorio",
    "Historial de trabajo persistente y exportable",
    "Interfaz personalizable (tema, fuente, columnas)",
  ];

  return (
    <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="items-center text-center">
            <BrainCircuit className="h-12 w-12 text-primary mb-2" />
          <DialogTitle className="text-2xl font-headline">Acerca de MedSanTools</DialogTitle>
          <DialogDescription>
            Plataforma Inteligente de Análisis Clínico y Soporte Diagnóstico Avanzado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <p className="text-sm text-center text-muted-foreground">
                MedSanTools es una suite de herramientas diseñada para potenciar el juicio clínico de los profesionales de la salud, optimizando tareas repetitivas y proporcionando análisis avanzados asistidos por IA para un soporte diagnóstico más rápido y preciso.
            </p>
            <h3 className="text-lg font-semibold text-center">Características Principales</h3>
             <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsAboutModalOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
