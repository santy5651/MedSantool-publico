
'use client';

import React from 'react';
import { ClinicalDataProvider } from './clinical-data-context';
import { ViewProvider } from './view-context';
import { ThemeProvider } from 'next-themes';

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClinicalDataProvider>
        <ViewProvider>
          {children}
        </ViewProvider>
      </ClinicalDataProvider>
    </ThemeProvider>
  );
}
