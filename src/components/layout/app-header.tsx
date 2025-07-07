
'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center">
        <BrainCircuit className="h-8 w-8 mr-3 text-primary" />
        <Link href="/" className="text-2xl font-headline font-bold text-foreground">
          MedSanTools
        </Link>
      </div>
    </header>
  );
}
