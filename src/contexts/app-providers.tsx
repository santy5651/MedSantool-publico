'use client';

import React from 'react';
import { ClinicalDataProvider } from './clinical-data-context';
// Import other providers here if needed, e.g., ThemeProvider from next-themes

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClinicalDataProvider>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
        {children}
      {/* </ThemeProvider> */}
    </ClinicalDataProvider>
  );
}
