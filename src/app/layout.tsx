import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppProviders from '@/contexts/app-providers';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';


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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AppProviders>
          <AppHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <AppFooter />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
