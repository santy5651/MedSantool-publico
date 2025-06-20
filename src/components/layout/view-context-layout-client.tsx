
'use client';

import React, { useEffect, type ReactNode } from 'react';
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

export function ViewContextLayoutClient({ children }: { children: ReactNode }) {
  const { fontSize } = useView();

  React.useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    
    if (fontSize) {
      htmlElement.classList.add(`font-size-${fontSize}`);
    }
    
    // Ensure a default class is present if fontSize is somehow not set or invalid
    // Prefer 'font-size-normal' as a fallback.
    const currentClasses = Array.from(htmlElement.classList);
    const hasFontSizeClass = currentClasses.some(cls => cls.startsWith('font-size-'));
    if (!hasFontSizeClass) {
        htmlElement.classList.add('font-size-normal');
    }

  }, [fontSize]);

  return (
    <div className={cn("font-body antialiased flex flex-col min-h-screen")}>
      {children}
    </div>
  );
}
