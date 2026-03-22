'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { enhancementModes, EnhancementMode } from './useDynamicTheme';

interface ModeContextType {
  currentMode: string;
  setCurrentMode: (mode: string) => void;
  modeConfig: EnhancementMode;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [currentMode, setCurrentMode] = useState<string>('particle');
  const modeConfig = enhancementModes[currentMode];

  return (
    <ModeContext.Provider value={{ currentMode, setCurrentMode, modeConfig }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
