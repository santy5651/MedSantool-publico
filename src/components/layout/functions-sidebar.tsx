
'use client';

import { useView } from '@/contexts/view-context';
import { Button } from '@/components/ui/button';

export function FunctionsSidebar() {
  const { activeView, setActiveView } = useView();

  const navItems = [
    { view: 'analysis', label: 'Herramientas de Análisis' },
    { view: 'other', label: 'Otras Herramientas' },
    { view: 'all', label: 'Mostrar Todas' },
  ];

  return (
    <aside className="hidden md:flex fixed left-16 top-0 z-40 h-screen w-64 bg-sidebar-functions text-sidebar-functions-foreground border-r border-sidebar-border flex-col">
       <div className="h-16 border-b border-sidebar-border" />
       <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
            <Button
              key={item.view}
              onClick={() => setActiveView(item.view as 'analysis' | 'other' | 'all')}
              variant={activeView === item.view ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base py-6"
            >
              {item.label}
            </Button>
        ))}
       </nav>
    </aside>
  );
}
