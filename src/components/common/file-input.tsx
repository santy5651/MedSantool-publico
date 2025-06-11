'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFileSummary } from '@/lib/utils';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  accept: string; // e.g., "image/*", ".pdf"
  currentFile: File | null;
  disabled?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({ onFileSelect, accept, currentFile, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    setFileName(getFileSummary(currentFile));
  }, [currentFile]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setFileName(getFileSummary(file));
    } else {
      onFileSelect(null);
      setFileName('');
    }
  }, [onFileSelect]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input if this button is part of a larger clickable area
    onFileSelect(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input value
    }
    toast({ title: "Archivo Deseleccionado", description: "Se ha quitado el archivo seleccionado." });
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        onClick={handleButtonClick}
        variant="outline"
        className="w-full justify-start text-left"
        disabled={disabled}
        aria-label={currentFile ? `Cambiar archivo ${fileName}` : "Seleccionar archivo"}
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {fileName || 'Seleccionar archivo...'}
      </Button>
      {currentFile && (
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>Archivo actual: {fileName} ({(currentFile.size / 1024).toFixed(2)} KB)</span>
          <Button variant="ghost" size="sm" onClick={handleClearFile} disabled={disabled} aria-label="Limpiar archivo seleccionado">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
