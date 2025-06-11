'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { HistoryEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AUTOSAVE_STORAGE_KEY = 'medinsight-autosave-preference';

export function useHistoryStore() {
  const { toast } = useToast();
  // Initialize with a server-safe default. Client will update after mount.
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(false); 

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    const savedPreference = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (savedPreference !== null) {
      setIsAutoSaveEnabled(savedPreference === 'true');
    } else {
      // If no preference is saved in localStorage, default to true (as per original logic) and save it.
      setIsAutoSaveEnabled(true);
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, 'true');
    }
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  useEffect(() => {
    // This effect synchronizes subsequent changes to isAutoSaveEnabled back to localStorage.
    // It runs after the initial state is set by the above useEffect and whenever isAutoSaveEnabled changes.
    if (typeof window !== 'undefined') { // Ensure localStorage is available
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, String(isAutoSaveEnabled));
    }
  }, [isAutoSaveEnabled]);


  const historyEntries = useLiveQuery(
    () => db.history.orderBy('timestamp').reverse().limit(50).toArray(),
    []
  );

  const addHistoryEntry = useCallback(async (entryData: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    try {
      const newEntry: HistoryEntry = {
        ...entryData,
        timestamp: Date.now(),
      };
      await db.history.add(newEntry);
      toast({ title: "Guardado en Historial", description: `Entrada para ${entryData.module} guardada.` });
    } catch (error) {
      console.error("Failed to add history entry:", error);
      toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar la entrada en el historial." });
    }
  }, [toast]);

  const deleteHistoryEntry = useCallback(async (id: number) => {
    try {
      await db.history.delete(id);
      toast({ title: "Entrada Eliminada", description: "La entrada del historial ha sido eliminada." });
    } catch (error) {
      console.error("Failed to delete history entry:", error);
      toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo eliminar la entrada." });
    }
  }, [toast]);

  const clearHistory = useCallback(async () => {
    try {
      await db.history.clear();
      toast({ title: "Historial Eliminado", description: "Todo el historial ha sido eliminado." });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({ variant: "destructive", title: "Error al Eliminar Historial", description: "No se pudo eliminar el historial." });
    }
  }, [toast]);

  const exportHistory = useCallback(async () => {
    if (!historyEntries || historyEntries.length === 0) {
      toast({ title: "Historial Vacío", description: "No hay entradas para exportar." });
      return;
    }
    try {
      const dataToExport = historyEntries.map(({ id, ...rest }) => rest); // Exclude Dexie's 'id'
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medinsight_historial_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Historial Exportado", description: "El historial ha sido exportado como JSON." });
    } catch (error) {
      console.error("Failed to export history:", error);
      toast({ variant: "destructive", title: "Error al Exportar", description: "No se pudo exportar el historial." });
    }
  }, [historyEntries, toast]);

  const importHistory = useCallback(async (file: File, mode: 'replace' | 'add') => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedEntries = JSON.parse(jsonString) as Omit<HistoryEntry, 'id'>[];

        // Validate structure (basic check)
        if (!Array.isArray(importedEntries) || !importedEntries.every(e => e.module && e.timestamp && e.status)) {
          throw new Error("Formato de archivo inválido.");
        }
        
        // Convert timestamp if it's a string (e.g. ISO string)
        const processedEntries = importedEntries.map(entry => ({
          ...entry,
          timestamp: typeof entry.timestamp === 'string' ? new Date(entry.timestamp).getTime() : entry.timestamp
        }));


        if (mode === 'replace') {
          await db.history.clear();
        }
        await db.history.bulkAdd(processedEntries as HistoryEntry[]); // Cast as Dexie will add 'id'
        toast({ title: "Historial Importado", description: `El historial ha sido ${mode === 'replace' ? 'reemplazado' : 'actualizado'}.` });
      } catch (error: any) {
        console.error("Failed to import history:", error);
        toast({ variant: "destructive", title: "Error al Importar", description: error.message || "No se pudo importar el historial." });
      }
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error de Lectura", description: "No se pudo leer el archivo." });
    };
    reader.readAsText(file);
  }, [toast]);

  const toggleAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(prev => !prev);
  }, []);

  return {
    historyEntries: historyEntries || [],
    isAutoSaveEnabled,
    toggleAutoSave,
    addHistoryEntry,
    deleteHistoryEntry,
    clearHistory,
    exportHistory,
    importHistory,
  };
}
