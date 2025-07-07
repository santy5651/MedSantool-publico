
'use client';
import type { ActiveView, FontSize, ColumnLayout, ViewContextType as GlobalViewContextType } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

const FONT_SIZE_STORAGE_KEY = 'medsantools-font-size-preference';
const COLUMN_LAYOUT_STORAGE_KEY = 'medsantools-column-layout-preference';

const ViewContext = createContext<GlobalViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('analysis');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [columnLayout, setColumnLayoutState] = useState<ColumnLayout>('two');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); // This can be removed if not used anywhere else, but let's leave it for now.

  useEffect(() => {
    const storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize | null;
    if (storedFontSize && ['small', 'normal', 'large'].includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
    }
    const storedColumnLayout = localStorage.getItem(COLUMN_LAYOUT_STORAGE_KEY) as ColumnLayout | null;
    if (storedColumnLayout && ['one', 'two'].includes(storedColumnLayout)) {
        setColumnLayoutState(storedColumnLayout);
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
  }, []);

  const setColumnLayout = useCallback((layout: ColumnLayout) => {
    setColumnLayoutState(layout);
    localStorage.setItem(COLUMN_LAYOUT_STORAGE_KEY, layout);
  }, []);

  // When a tool view is selected, ensure the 'about' view is turned off.
  const handleSetActiveView = (view: ActiveView) => {
      if (view === 'about') {
        setExpandedModuleId(null); // Collapse any expanded module when showing about page
      }
      setActiveView(view);
  }

  return (
    <ViewContext.Provider value={{ activeView, setActiveView: handleSetActiveView, expandedModuleId, setExpandedModuleId, fontSize, setFontSize, columnLayout, setColumnLayout, isAboutModalOpen, setIsAboutModalOpen }}>
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
