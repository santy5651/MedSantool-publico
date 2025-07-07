
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppProviders from '@/contexts/app-providers';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { ViewContextLayoutClient } from '@/components/layout/view-context-layout-client';
import { ApiKeyDialog } from '@/components/common/api-key-dialog';
import { ConfigSidebar } from '@/components/layout/config-sidebar';
import { FunctionsSidebar } from '@/components/layout/functions-sidebar';


export const metadata: Metadata = {
  title: 'MedSanTools',
  description: 'Plataforma Inteligente de Análisis Clínico y Soporte Diagnóstico Avanzado',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProviders>
          <div className="flex min-h-screen w-full">
            <ConfigSidebar />
            <FunctionsSidebar />
            <ViewContextLayoutClient>
              <AppHeader />
              <main className="flex-grow p-4 md:p-6 bg-muted/20">
                {children}
              </main>
              <AppFooter />
            </ViewContextLayoutClient>
          </div>
          <Toaster />
          <ApiKeyDialog />
        </AppProviders>
      </body>
    </html>
  );
}
