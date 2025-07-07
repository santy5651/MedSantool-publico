
'use client';

import React, { type ReactNode } from 'react';
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

export function ViewContextLayoutClient({ children }: { children: ReactNode }) {
  const { fontSize } = useView();

  React.useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    
    if (fontSize) {
      htmlElement.classList.add(`font-size-${fontSize}`);
    } else {
      htmlElement.classList.add('font-size-normal');
    }
  }, [fontSize]);

  return (
    <div className={cn("font-body antialiased flex flex-col flex-1 w-full md:ml-80")}>
      {children}
    </div>
  );
}
