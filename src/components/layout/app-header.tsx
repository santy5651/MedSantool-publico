'use client';

import Link from 'next/link';
import { BrainCircuit, Eraser } from 'lucide-react';
import { useState } from 'react';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { clearAllModules } = useClinicalData();
  const { toast } = useToast();
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const handleClearAll = () => {
    clearAllModules();
    toast({
      title: "Todos los Módulos Limpiados",
      description: "Se ha restablecido el estado de todos los módulos de datos.",
    });
    setShowClearAllConfirm(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      <div className="flex items-center">
        <BrainCircuit className="h-8 w-8 mr-3 text-primary" />
        <Link href="/" className="text-2xl font-headline font-bold text-foreground">
          MedSanTools
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Eraser className="mr-2 h-4 w-4" />
              Limpiar Todo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se restablecerán todos los datos ingresados y generados en los módulos. El historial de trabajo no se verá afectado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>Confirmar Limpieza</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
