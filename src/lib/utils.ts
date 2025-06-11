import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function getFileSummary(file: File | null, maxLength: number = 30): string {
  if (!file) return "Ningún archivo seleccionado";
  const name = file.name;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
}

export function getTextSummary(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return "Sin texto";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
