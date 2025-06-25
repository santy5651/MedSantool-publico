
'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isKeyModalOpen: boolean;
  setIsKeyModalOpen: (isOpen: boolean) => void; // Allow direct control
  openKeyModal: () => void;
}

const API_KEY_STORAGE_KEY = 'medsantools-api-key';
const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      setApiKeyState(storedKey);
    } catch (error) {
        console.error("Could not access localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Automatically open the modal if the app has loaded and there's no API key.
    if (isInitialized && !apiKey) {
      setIsKeyModalOpen(true);
    }
  }, [apiKey, isInitialized]);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key);
    try {
        if (key) {
          localStorage.setItem(API_KEY_STORAGE_KEY, key);
          setIsKeyModalOpen(false); // Close modal on save
        } else {
          localStorage.removeItem(API_KEY_STORAGE_KEY);
        }
    } catch (error) {
        console.error("Could not access localStorage", error);
    }
  }, []);

  const openKeyModal = useCallback(() => setIsKeyModalOpen(true), []);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, isKeyModalOpen, setIsKeyModalOpen, openKeyModal }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
