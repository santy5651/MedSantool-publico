
'use client';
import type { ActiveView, FontSize, ViewContextType as GlobalViewContextType } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

const FONT_SIZE_STORAGE_KEY = 'medsantools-font-size-preference';

const ViewContext = createContext<GlobalViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('analysis');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');

  useEffect(() => {
    const storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize | null;
    if (storedFontSize && ['small', 'normal', 'large'].includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
  }, []);

  return (
    <ViewContext.Provider value={{ activeView, setActiveView, expandedModuleId, setExpandedModuleId, fontSize, setFontSize }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = (): GlobalViewContextType => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
