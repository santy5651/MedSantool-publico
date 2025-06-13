
'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { activeView, setActiveView } = useView();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <BrainCircuit className="h-8 w-8 mr-3" />
          <Link href="/" className="text-2xl font-headline font-bold">
            MedSanTools
          </Link>
        </div>
        <Menubar className="border-none bg-transparent text-primary-foreground">
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setActiveView('analysis')}
              className={cn(
                "cursor-pointer data-[state=open]:bg-primary/80 data-[state=open]:text-primary-foreground hover:bg-primary/80 px-3 py-1.5 text-sm font-medium",
                activeView === 'analysis' && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              Herramientas de Análisis
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setActiveView('other')}
              className={cn(
                "cursor-pointer data-[state=open]:bg-primary/80 data-[state=open]:text-primary-foreground hover:bg-primary/80 px-3 py-1.5 text-sm font-medium",
                activeView === 'other' && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              Otras Herramientas
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setActiveView('all')}
              className={cn(
                "cursor-pointer data-[state=open]:bg-primary/80 data-[state=open]:text-primary-foreground hover:bg-primary/80 px-3 py-1.5 text-sm font-medium",
                activeView === 'all' && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              Mostrar Todas
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
}
