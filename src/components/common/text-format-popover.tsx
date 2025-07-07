'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Baseline,
  ClipboardPaste,
  ClipboardCopy,
  Eraser,
  CaseUpper,
  CaseLower,
  CaseSensitive,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export function TextFormatPopover() {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      setText(pastedText);
      toast({ title: 'Texto Pegado', description: 'El contenido del portapapeles ha sido pegado.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al Pegar', description: 'No se pudo leer el portapapeles. Asegúrese de haber concedido los permisos.' });
    }
  };

  const handleCopy = () => {
    if (!text) {
      toast({ title: 'Nada que Copiar', description: 'El cuadro de texto está vacío.' });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({ title: 'Texto Copiado', description: 'El texto formateado ha sido copiado al portapapeles.' });
  };

  const handleClear = () => {
    setText('');
    toast({ title: 'Texto Limpiado' });
  };

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Baseline className="mr-2 h-4 w-4" />
          Formato de Texto
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Herramienta de Formato de Texto</h4>
            <p className="text-sm text-muted-foreground">
              Pegue texto, aplique formato y copie el resultado.
            </p>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pegue su texto aquí..."
            rows={8}
          />
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handlePaste}><ClipboardPaste className="mr-2 h-4 w-4" /> Pegar</Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopy}><ClipboardCopy className="mr-2 h-4 w-4" /> Copiar</Button>
              <Button variant="destructive" size="sm" onClick={handleClear}><Eraser className="mr-2 h-4 w-4" /> Limpiar</Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label>Conversión de Mayúsculas/Minúsculas</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setText(text.toUpperCase())}><CaseUpper className="mr-2 h-4 w-4" /> MAYÚSCULAS</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setText(text.toLowerCase())}><CaseLower className="mr-2 h-4 w-4" /> minúsculas</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setText(toSentenceCase(text))}><CaseSensitive className="mr-2 h-4 w-4" /> Tipo Frase</Button>
            </div>
          </div>
           <Separator />
            <div className="grid gap-2">
                 <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Alineación (Visual)</Label>
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">La alineación es una propiedad de estilo visual, no de contenido. Esta herramienta formatea el texto, no su apariencia. Use estas opciones en un editor de texto enriquecido.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                 </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" disabled><AlignLeft className="mr-2 h-4 w-4" /> Izquierda</Button>
                    <Button variant="outline" size="sm" className="flex-1" disabled><AlignCenter className="mr-2 h-4 w-4" /> Centro</Button>
                    <Button variant="outline" size="sm" className="flex-1" disabled><AlignRight className="mr-2 h-4 w-4" /> Derecha</Button>
                    <Button variant="outline" size="sm" className="flex-1" disabled><AlignJustify className="mr-2 h-4 w-4" /> Justificar</Button>
                </div>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}