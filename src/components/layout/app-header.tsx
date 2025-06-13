'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <BrainCircuit className="h-8 w-8 mr-3" />
        <Link href="/" className="text-2xl font-headline font-bold">
          MedSanTools
        </Link>
      </div>
    </header>
  );
}
