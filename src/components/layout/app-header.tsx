
'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { activeView, setActiveView } = useView();

  // Base classes for all triggers
  const triggerBaseClasses = "cursor-pointer px-3 py-1.5 text-sm font-medium rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-primary";

  // Classes for an active trigger
  const activeTriggerClasses = "bg-primary-foreground/20 text-primary-foreground";

  // Classes for an inactive trigger (including hover and focus)
  const inactiveTriggerClasses = "text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus-visible:bg-primary/85 focus-visible:text-primary-foreground";
  
  // Radix data-state=open override to look like hover, as our triggers don't open menus
  const dataOpenOverride = "data-[state=open]:bg-primary/90 data-[state=open]:text-primary-foreground";


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
                triggerBaseClasses,
                dataOpenOverride,
                activeView === 'analysis' ? activeTriggerClasses : inactiveTriggerClasses
              )}
            >
              Herramientas de Análisis
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setActiveView('other')}
              className={cn(
                triggerBaseClasses,
                dataOpenOverride,
                activeView === 'other' ? activeTriggerClasses : inactiveTriggerClasses
              )}
            >
              Otras Herramientas
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setActiveView('all')}
              className={cn(
                triggerBaseClasses,
                dataOpenOverride,
                activeView === 'all' ? activeTriggerClasses : inactiveTriggerClasses
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
