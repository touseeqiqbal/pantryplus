'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type AppMode = 'personal' | 'business';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  isBusiness: boolean;
  isPersonal: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('personal');
  const [initialized, setInitialized] = useState(false);

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('pantryPlusMode') as AppMode;
    if (savedMode && (savedMode === 'personal' || savedMode === 'business')) {
      setModeState(savedMode);
    }
    setInitialized(true);
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('pantryPlusMode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'personal' ? 'business' : 'personal';
    setMode(newMode);
  };

  if (!initialized) {
    return null; // Prevent flash of wrong mode or hydration mismatch
  }

  return (
    <AppModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isBusiness: mode === 'business',
        isPersonal: mode === 'personal',
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
