'use client';

import { useEffect, useState } from 'react';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>
          Copyright MedInsight IA &copy; {currentYear}. Todos los derechos reservados.
        </p>
        <p className="mt-2">
          Descargo de responsabilidad: MedInsight IA es una herramienta de soporte diagnóstico y no reemplaza el juicio clínico profesional.
        </p>
      </div>
    </footer>
  );
}
