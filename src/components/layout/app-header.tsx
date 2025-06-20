
'use client';

import Link from 'next/link';
import { BrainCircuit, Settings, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarRadioGroup, MenubarRadioItem } from "@/components/ui/menubar"; // Adjusted imports
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import type { FontSize } from '@/types';

export function AppHeader() {
  const { activeView, setActiveView, fontSize, setFontSize } = useView();
  const { theme, setTheme } = useTheme();

  const staticTriggerClasses = "cursor-pointer px-3 py-1.5 text-sm font-medium rounded-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-primary";

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <BrainCircuit className="h-8 w-8 mr-3" />
          <Link href="/" className="text-2xl font-headline font-bold">
            MedSanTools
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Menubar className="border-none bg-transparent text-primary-foreground">
            <MenubarMenu>
              <MenubarTrigger
                onClick={() => setActiveView('analysis')}
                className={cn(staticTriggerClasses, activeView === 'analysis' ? 'underline' : '')}
              >
                Herramientas de Análisis
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger
                onClick={() => setActiveView('other')}
                className={cn(staticTriggerClasses, activeView === 'other' ? 'underline' : '')}
              >
                Otras Herramientas
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger
                onClick={() => setActiveView('all')}
                className={cn(staticTriggerClasses, activeView === 'all' ? 'underline' : '')}
              >
                Mostrar Todas
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>

          <Menubar className="border-none bg-transparent">
            <MenubarMenu>
              <MenubarTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80 focus-visible:bg-primary/80">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Configuración</span>
                 </Button>
              </MenubarTrigger>
              <MenubarContent align="end" className="bg-popover text-popover-foreground">
                <MenubarLabel className="px-2 py-1.5 text-sm font-semibold">Apariencia</MenubarLabel>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Tema</span>
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarRadioGroup value={theme}>
                      <MenubarRadioItem value="light" onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" /> Claro
                      </MenubarRadioItem>
                      <MenubarRadioItem value="dark" onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" /> Oscuro
                      </MenubarRadioItem>
                      <MenubarRadioItem value="system" onClick={() => setTheme('system')}>
                        <Monitor className="mr-2 h-4 w-4" /> Sistema
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
                
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Palette className="mr-2 h-4 w-4" /> {/* Placeholder, consider 'CaseSensitive' or similar for text size */}
                    <span>Tamaño de Fuente</span>
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarRadioGroup value={fontSize}>
                      <MenubarRadioItem value="small" onClick={() => setFontSize('small')}>
                        Pequeño
                      </MenubarRadioItem>
                      <MenubarRadioItem value="normal" onClick={() => setFontSize('normal')}>
                        Normal
                      </MenubarRadioItem>
                      <MenubarRadioItem value="large" onClick={() => setFontSize('large')}>
                        Grande
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>

              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  );
}
