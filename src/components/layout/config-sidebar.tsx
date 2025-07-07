
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, UserCircle, HelpCircle, Info, KeyRound, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useApiKey } from '@/contexts/api-key-context';
import { useTheme } from 'next-themes';
import { useView } from '@/contexts/view-context';

export function ConfigSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const { openKeyModal } = useApiKey();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, columnLayout, setColumnLayout, setIsAboutModalOpen } = useView();
  
  const [accordionValue, setAccordionValue] = useState('');

  // This effect ensures the accordion and any open tooltips close when the sidebar collapses.
  useEffect(() => {
    if (!isExpanded) {
      setAccordionValue('');
      setOpenTooltipId(null); // Force close any open tooltips
    }
  }, [isExpanded]);

  const navItems = [
    { id: 'apikey', icon: KeyRound, label: 'API Key', action: openKeyModal },
    { id: 'account', icon: UserCircle, label: 'Cuenta', action: () => {} },
    { id: 'help', icon: HelpCircle, label: 'Ayuda', action: () => {} },
  ];

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 z-50 h-screen bg-sidebar-config text-sidebar-config-foreground transition-[width] duration-300 ease-in-out flex-col border-r border-sidebar-border"
      style={{ width: isExpanded ? '16rem' : '4rem' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className="w-full h-12 flex items-center transition-[width] duration-300 ease-in-out"
        style={{ width: isExpanded ? '16rem' : '4rem' }}
      ></div>
      <nav className="flex flex-col items-center gap-2 px-2 py-4 mt-16 flex-1">
        <TooltipProvider delayDuration={0}>
          {navItems.slice(0, 1).map((item) => (
            <Tooltip 
              key={item.id}
              open={openTooltipId === item.id && !isExpanded}
              onOpenChange={(isOpen) => setOpenTooltipId(isOpen ? item.id : null)}
            >
              <TooltipTrigger asChild>
                <button
                  onClick={item.action}
                  className={cn(
                    "flex h-12 w-full items-center rounded-lg text-sidebar-config-foreground transition-colors hover:bg-sidebar-config-accent hover:text-sidebar-config-accent-foreground overflow-hidden"
                  )}
                >
                  <div className="flex h-full w-12 flex-shrink-0 items-center justify-center">
                      <item.icon className="h-6 w-6 shrink-0" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-opacity duration-300",
                      isExpanded ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <Accordion 
              type="single" 
              collapsible 
              className="w-full" 
              value={accordionValue} 
              onValueChange={setAccordionValue}
          >
            <AccordionItem 
              value="settings" 
              className="border-b-0"
            >
              <Tooltip open={openTooltipId === 'settings' && !isExpanded} onOpenChange={(isOpen) => setOpenTooltipId(isOpen ? 'settings' : null)}>
                <TooltipTrigger asChild>
                  <AccordionTrigger
                    onMouseEnter={() => { if (isExpanded) setAccordionValue('settings') }}
                    className="p-0 hover:no-underline flex h-12 w-full items-center justify-between rounded-lg text-sidebar-config-foreground transition-colors hover:bg-sidebar-config-accent hover:text-sidebar-config-accent-foreground overflow-hidden"
                     onClick={(e) => e.preventDefault()} // Prevent click from toggling
                  >
                    <div className="flex items-center">
                      <div className="flex h-full w-12 flex-shrink-0 items-center justify-center">
                        <Settings className="h-6 w-6 shrink-0" />
                      </div>
                      <span className={cn("text-sm font-medium whitespace-nowrap transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
                        Configuración
                      </span>
                    </div>
                  </AccordionTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p>Configuración</p>
                </TooltipContent>
              </Tooltip>
              <AccordionContent className="pt-2 pb-0">
                  <div className={cn("pl-12 pr-2 space-y-4 text-sm text-sidebar-config-foreground/80")}>
                      <div>
                          <p className="font-medium mb-2">Tema</p>
                          <div className="flex justify-around gap-1">
                              <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setTheme('light')}><Sun className="h-5 w-5"/></Button>
                              <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setTheme('dark')}><Moon className="h-5 w-5"/></Button>
                              <Button variant={theme === 'system' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setTheme('system')}><Monitor className="h-5 w-5"/></Button>
                          </div>
                      </div>
                       <div>
                          <p className="font-medium mb-2">Fuente</p>
                          <div className="flex flex-col gap-1">
                            <Button variant={fontSize === 'small' ? 'secondary' : 'ghost'} size="sm" className="h-auto py-1 w-full justify-start" onClick={() => setFontSize('small')}>Pequeña</Button>
                            <Button variant={fontSize === 'normal' ? 'secondary' : 'ghost'} size="sm" className="h-auto py-1 w-full justify-start" onClick={() => setFontSize('normal')}>Normal</Button>
                            <Button variant={fontSize === 'large' ? 'secondary' : 'ghost'} size="sm" className="h-auto py-1 w-full justify-start" onClick={() => setFontSize('large')}>Grande</Button>
                          </div>
                      </div>
                      <div>
                          <p className="font-medium mb-2">Disposición</p>
                          <div className="flex flex-col gap-1">
                            <Button variant={columnLayout === 'one' ? 'secondary' : 'ghost'} size="sm" className="h-auto py-1 w-full justify-start" onClick={() => setColumnLayout('one')}>Una Columna</Button>
                            <Button variant={columnLayout === 'two' ? 'secondary' : 'ghost'} size="sm" className="h-auto py-1 w-full justify-start" onClick={() => setColumnLayout('two')}>Dos Columnas</Button>
                          </div>
                      </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {navItems.slice(1).map((item) => (
            <Tooltip 
              key={item.id}
              open={openTooltipId === item.id && !isExpanded}
              onOpenChange={(isOpen) => setOpenTooltipId(isOpen ? item.id : null)}
            >
              <TooltipTrigger asChild>
                <button
                  onClick={item.action}
                  className={cn(
                    "flex h-12 w-full items-center rounded-lg text-sidebar-config-foreground transition-colors hover:bg-sidebar-config-accent hover:text-sidebar-config-accent-foreground overflow-hidden"
                  )}
                >
                  <div className="flex h-full w-12 flex-shrink-0 items-center justify-center">
                      <item.icon className="h-6 w-6 shrink-0" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-opacity duration-300",
                      isExpanded ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip 
            key='about'
            open={openTooltipId === 'about' && !isExpanded}
            onOpenChange={(isOpen) => setOpenTooltipId(isOpen ? 'about' : null)}
          >
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className={cn(
                  "flex h-12 w-full items-center rounded-lg text-sidebar-config-foreground transition-colors hover:bg-sidebar-config-accent hover:text-sidebar-config-accent-foreground overflow-hidden"
                )}
              >
                <div className="flex h-full w-12 flex-shrink-0 items-center justify-center">
                    <Info className="h-6 w-6 shrink-0" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-opacity duration-300",
                    isExpanded ? "opacity-100" : "opacity-0"
                  )}
                >
                  Acerca de
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Acerca de</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
