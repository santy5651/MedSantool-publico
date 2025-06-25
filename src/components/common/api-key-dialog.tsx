
'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiKey } from '@/contexts/api-key-context';
import Link from 'next/link';

export function ApiKeyDialog() {
  const { apiKey, setApiKey, isKeyModalOpen, openKeyModal, setIsKeyModalOpen } = useApiKey();
  const [localKey, setLocalKey] = useState('');

  useEffect(() => {
    if (apiKey) {
      setLocalKey(apiKey);
    }
  }, [apiKey]);

  const handleSave = () => {
    if (localKey.trim()) {
      setApiKey(localKey.trim());
    }
  };

  return (
    <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        // Prevent closing the dialog by clicking outside if no API key is set
        if (!apiKey) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Configurar API Key de Google AI</DialogTitle>
          <DialogDescription>
            Para usar las funciones de IA, por favor ingrese su API key. Puede obtener una gratuitamente en{' '}
            <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
              Google AI Studio
            </Link>
            . Su clave se guarda de forma segura en su navegador.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="api-key" className="sr-only">
              API Key
            </Label>
            <Input
              id="api-key"
              placeholder="Ingrese su API Key aquí"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              type="password"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" onClick={handleSave} disabled={!localKey.trim()}>
            Guardar y Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
