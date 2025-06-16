import React, { createContext, useContext, ReactNode } from 'react';
import { usePersonaLearning } from '../hooks/usePersonaLearning';

interface PersonaContextType {
  trackFeedback: (action: string, context: string, value: any, component: string) => string;
  analyzePatterns: () => Promise<void>;
  applyInsight: (insightId: string) => Promise<void>;
  getPersonalizedSuggestions: (context: string) => any;
  resetLearning: () => Promise<void>;
  feedbackHistory: any[];
  insights: any[];
  isLearning: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const personaLearning = usePersonaLearning();

  return (
    <PersonaContext.Provider value={personaLearning}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}