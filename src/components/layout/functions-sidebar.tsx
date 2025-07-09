
'use client';

import { useView } from '@/contexts/view-context';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import type { ActiveView } from '@/types';

export function FunctionsSidebar() {
  const { activeView, setActiveView } = useView();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { view: 'consultorio', label: 'Flujo de Consultorio' },
    { view: 'egreso', label: 'Flujo de Egreso' },
    { view: 'analysis', label: 'Herramientas de Análisis' },
    { view: 'other', label: 'Otras Herramientas' },
    { view: 'all', label: 'Mostrar Todas' },
  ];

  const handleNav = (view: ActiveView) => {
    setActiveView(view);
    if (pathname !== '/') {
        router.push('/');
    }
  }

  return (
    <aside className="hidden md:flex fixed left-16 top-0 z-40 h-screen w-64 bg-sidebar-functions text-sidebar-functions-foreground border-r border-sidebar-border flex-col">
       <div className="h-16 border-b border-sidebar-border" />
       <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
            <Button
              key={item.view}
              onClick={() => handleNav(item.view as ActiveView)}
              variant={activeView === item.view && pathname === '/' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base py-6"
            >
              {item.label}
            </Button>
        ))}
       </nav>
    </aside>
  );
}
