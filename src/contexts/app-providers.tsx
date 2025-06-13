
'use client';

import React from 'react';
import { ClinicalDataProvider } from './clinical-data-context';
import { ViewProvider } from './view-context';
// Import other providers here if needed, e.g., ThemeProvider from next-themes

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClinicalDataProvider>
      <ViewProvider>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          {children}
        {/* </ThemeProvider> */}
      </ViewProvider>
    </ClinicalDataProvider>
  );
}
