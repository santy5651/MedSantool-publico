
'use client';

import React, { useEffect, type ReactNode } from 'react'; // Added React import
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

// This client component wrapper is needed to apply the dynamic class from useView to the body or a main wrapper
// because RootLayout itself is a Server Component and cannot directly use client-side hooks.
export function ViewContextLayoutClient({ children }: { children: ReactNode }) {
  const { fontSize } = useView();

  // If you were applying to the body, you'd do it via a useEffect here:
  // useEffect(() => {
  //   document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
  //   document.body.classList.add(`font-size-${fontSize}`);
  // }, [fontSize]);
  // return <>{children}</>;
  // However, modifying body class directly in a child component is not ideal for Next.js App Router.
  // It's better to wrap the content in a div that gets the class.
  // For now, let's assume the class will be applied to <html> by ThemeProvider or RootLayout can manage it.
  // For simplicity with globals.css targeting body.font-size-X, we use useEffect for now.
  // A more robust solution might involve CSS variables updated by this component.

  React.useEffect(() => {
    document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    if (fontSize) {
      document.body.classList.add(`font-size-${fontSize}`);
    }
    // Add a default class if fontSize is somehow not set, though 'normal' is default
    if (!document.body.className.includes('font-size-')) {
        document.body.classList.add('font-size-normal');
    }
  }, [fontSize]);

  return <div className={cn("font-body antialiased flex flex-col min-h-screen", 
    // The actual font size class will be applied to the body by useEffect
  )}>{children}</div>;
}
