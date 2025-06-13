
'use client';
import type { ActiveView, ViewContextType as GlobalViewContextType } from '@/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

const ViewContext = createContext<GlobalViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('analysis'); // Default to 'analysis'
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  return (
    <ViewContext.Provider value={{ activeView, setActiveView, expandedModuleId, setExpandedModuleId }}>
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
