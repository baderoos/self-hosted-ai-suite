import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { echoAI, EchoState, UserInteraction } from './EchoAI';
import { geminiService } from '../services/GeminiService';

interface NexusContextType {
  echoState: EchoState;
  trackInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => string;
  analyzePatterns: () => Promise<void>;
  orchestrateWorkflow: (workflowId: string, context: Record<string, any>) => Promise<string>;
  getPersonalizedSuggestions: (module: string, context?: Record<string, any>) => any[];
  isEchoActive: boolean;
  geminiAvailable: boolean;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const [echoState, setEchoState] = useState<EchoState>(echoAI.getState());
  const [isEchoActive, setIsEchoActive] = useState(true);
  const [geminiAvailable, setGeminiAvailable] = useState(geminiService.hasApiKey());

  useEffect(() => {
    // Subscribe to Echo state changes
    const unsubscribe = echoAI.subscribe((newState) => {
      setEchoState(newState);
    });

    return unsubscribe;
  }, []);

  // Check if Gemini API key is available
  useEffect(() => {
    const checkGeminiAvailability = () => {
      const available = geminiService.hasApiKey();
      setGeminiAvailable(available);
      echoAI.setGeminiEnabled(available);
    };
    
    // Check on mount
    checkGeminiAvailability();
    
    // Set up interval to check periodically
    const interval = setInterval(checkGeminiAvailability, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const trackInteraction = (interaction: Omit<UserInteraction, 'id' | 'timestamp'>): string => {
    if (!isEchoActive) return '';
    return echoAI.trackInteraction(interaction);
  };

  const analyzePatterns = async (): Promise<void> => {
    if (!isEchoActive) return;
    return echoAI.analyzePatterns();
  };

  const orchestrateWorkflow = async (workflowId: string, context: Record<string, any>): Promise<string> => {
    if (!isEchoActive) return '';
    return echoAI.orchestrateWorkflow(workflowId, context);
  };

  const getPersonalizedSuggestions = (module: string, context: Record<string, any> = []): any[] => {
    if (!isEchoActive) return [];
    return echoAI.getPersonalizedSuggestions(module, context);
  };

  const contextValue: NexusContextType = {
    echoState,
    trackInteraction,
    analyzePatterns,
    orchestrateWorkflow,
    getPersonalizedSuggestions,
    isEchoActive,
    geminiAvailable
  };

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus(): NexusContextType {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
}

// Hook for tracking interactions in components
export function useEchoTracking(module: string) {
  const { trackInteraction } = useNexus();

  const track = (action: string, context: Record<string, any> = {}, outcome?: 'success' | 'failure' | 'abandoned') => {
    return trackInteraction({
      userId: 'current_user', // This would come from auth context in real app
      module,
      action,
      context,
      outcome
    });
  };

  return { track };
}