
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, UserCircle, HelpCircle, Info, KeyRound, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useApiKey } from '@/contexts/api-key-context';
import { useTheme } from 'next-themes';
import { useView } from '@/contexts/view-context';

export function ConfigSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const { openKeyModal } = useApiKey();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useView();

  const navItems = [
    { id: 'apikey', icon: KeyRound, label: 'API Key', action: openKeyModal },
    { id: 'settings', icon: Settings, label: 'Configuración', href: '#' },
    { id: 'account', icon: UserCircle, label: 'Cuenta', href: '#' },
    { id: 'help', icon: HelpCircle, label: 'Ayuda', href: '#' },
    { id: 'about', icon: Info, label: 'Acerca de', href: '#' },
  ];

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 z-50 h-screen bg-sidebar-config text-sidebar-config-foreground transition-all duration-300 ease-in-out flex-col border-r border-sidebar-border"
      style={{ width: isExpanded ? '16rem' : '4rem' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setOpenTooltipId(null);
      }}
    >
      <nav className="flex flex-col items-center gap-2 px-2 py-4 mt-16">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip 
              key={item.id}
              open={openTooltipId === item.id && !isExpanded}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  setOpenTooltipId(item.id);
                } else {
                  setOpenTooltipId(null);
                }
              }}
            >
              <TooltipTrigger asChild>
                <button
                  onClick={item.action}
                  className={cn(
                    "flex h-12 items-center rounded-lg text-sidebar-config-foreground transition-colors hover:bg-sidebar-config-accent hover:text-sidebar-config-accent-foreground overflow-hidden",
                    isExpanded ? "w-full justify-start px-3" : "w-12 justify-center"
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out",
                      isExpanded ? "ml-4 opacity-100" : "ml-0 w-0 opacity-0"
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
        </TooltipProvider>
      </nav>
    </aside>
  );
}
