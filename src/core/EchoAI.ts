/**
 * Echo AI - The Central Intelligence System for Nexus
 * 
 * This is the core AI that learns from user interactions across all modules,
 * orchestrates workflows, and provides intelligent suggestions throughout the platform.
 */

export interface UserInteraction {
  id: string;
  userId: string;
  module: string;
  action: string;
  context: Record<string, any>;
  timestamp: string;
  outcome?: 'success' | 'failure' | 'abandoned';
  metadata?: Record<string, any>;
}
import { geminiService } from '../services/GeminiService';

export interface WorkflowPattern {
  id: string;
  name: string;
  frequency: number;
  modules: string[];
  actions: string[];
  confidence: number;
  lastUsed: string;
}

export interface EchoInsight {
  id: string;
  type: 'workflow' | 'preference' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface EchoState {
  isLearning: boolean;
  learningProgress: number;
  totalInteractions: number;
  patterns: WorkflowPattern[];
  insights: EchoInsight[];
  userPreferences: Record<string, any>;
  activeWorkflows: string[];
  systemHealth: {
    status: 'optimal' | 'good' | 'degraded' | 'critical';
    performance: number;
    lastUpdate: string;
  };
}

class EchoAI {
  private state: EchoState;
  private interactions: UserInteraction[] = [];
  private listeners: ((state: EchoState) => void)[] = [];
  private geminiEnabled: boolean = false;
  private learningInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      isLearning: false,
      learningProgress: 0,
      totalInteractions: 0,
      patterns: [],
      insights: [],
      userPreferences: {},
      activeWorkflows: [],
      systemHealth: {
        status: 'optimal',
        performance: 98,
        lastUpdate: new Date().toISOString()
      }
    };

    // Load persisted state
    this.loadState();
    
    // Check if Gemini API key is available
    this.geminiEnabled = geminiService.hasApiKey();
    
    // Start continuous learning
    this.startLearning();
  }

  // Core Learning Methods
  public trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): string {
    const fullInteraction: UserInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.interactions.push(fullInteraction);
    this.state.totalInteractions++;

    // Trigger learning if we have enough new interactions
    if (this.interactions.length % 10 === 0) {
      this.analyzePatterns();
    }

    this.persistState();
    this.notifyListeners();

    return fullInteraction.id;
  }

  public async analyzePatterns(): Promise<void> {
    if (this.state.isLearning) return;

    this.state.isLearning = true;
    this.state.learningProgress = 0;
    this.notifyListeners();

    try {
      // Simulate progressive learning
      for (let i = 0; i <= 100; i += 10) {
        this.state.learningProgress = i;
        this.notifyListeners();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Analyze workflow patterns
      const patterns = this.identifyWorkflowPatterns();
      this.state.patterns = patterns;

      // Generate insights
      const insights = this.generateInsights();
      this.state.insights = [...insights, ...this.state.insights].slice(0, 50); // Keep latest 50

      // Update user preferences
      this.updateUserPreferences();

    } finally {
      this.state.isLearning = false;
      this.state.learningProgress = 100;
      this.persistState();
      this.notifyListeners();
    }
  }

  private identifyWorkflowPatterns(): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];
    
    // Group interactions by module sequences
    const sequences = this.getModuleSequences();
    
    sequences.forEach((sequence, index) => {
      if (sequence.length >= 2) {
        patterns.push({
          id: `pattern_${index}`,
          name: `${sequence[0]} → ${sequence[sequence.length - 1]} Workflow`,
          frequency: Math.floor(Math.random() * 20) + 5,
          modules: sequence,
          actions: ['navigate', 'create', 'edit', 'export'],
          confidence: 0.7 + Math.random() * 0.3,
          lastUsed: new Date().toISOString()
        });
      }
    });

    return patterns.slice(0, 10); // Keep top 10 patterns
  }

  private getModuleSequences(): string[][] {
    const sequences: string[][] = [];
    let currentSequence: string[] = [];
    
    this.interactions.slice(-100).forEach(interaction => {
      if (interaction.action === 'navigate') {
        if (currentSequence.length > 0) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [interaction.module];
      } else if (currentSequence.length > 0) {
        if (!currentSequence.includes(interaction.module)) {
          currentSequence.push(interaction.module);
        }
      }
    });

    if (currentSequence.length > 0) {
      sequences.push(currentSequence);
    }

    return sequences;
  }

  private generateInsights(): EchoInsight[] {
    const insights: EchoInsight[] = [];
    
    // Use Gemini for enhanced insight generation if available
    if (this.geminiEnabled && this.interactions.length > 10) {
      try {
        // We'll use the async/await pattern in a non-async function by returning a Promise
        // that will be resolved later when the Gemini API call completes
        this.generateGeminiInsights().then(geminiInsights => {
          if (geminiInsights.length > 0) {
            this.state.insights = [...geminiInsights, ...this.state.insights].slice(0, 50);
            this.notifyListeners();
          }
        });
      } catch (error) {
        console.error('Failed to generate Gemini insights:', error);
      }
    }
    
    // Workflow optimization insights
    if (this.state.patterns.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_workflow`,
        type: 'workflow',
        title: 'Workflow Optimization Opportunity',
        description: `I've noticed you frequently use ${this.state.patterns[0].modules.join(' → ')}. I can create a custom workflow to streamline this process.`,
        confidence: 0.85,
        impact: 'medium',
        actionable: true,
        suggestedAction: 'Create automated workflow',
        metadata: { pattern: this.state.patterns[0] },
        timestamp: new Date().toISOString()
      });
    }

    // Usage pattern insights
    const moduleUsage = this.getModuleUsageStats();
    const mostUsed = Object.entries(moduleUsage).sort(([,a], [,b]) => b - a)[0];
    
    if (mostUsed) {
      insights.push({
        id: `insight_${Date.now()}_usage`,
        type: 'preference',
        title: 'Primary Workflow Identified',
        description: `You spend most of your time in ${mostUsed[0]}. I can optimize this module's interface for your specific use patterns.`,
        confidence: 0.9,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Customize interface',
        metadata: { module: mostUsed[0], usage: mostUsed[1] },
        timestamp: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generate insights using Gemini AI
   */
  private async generateGeminiInsights(): Promise<EchoInsight[]> {
    if (!this.geminiEnabled) return [];
    
    try {
      // Prepare recent interactions data for Gemini
      const recentInteractions = this.interactions.slice(-50);
      const interactionsData = JSON.stringify(recentInteractions, null, 2);
      
      // Create a prompt for Gemini
      const prompt = `You are Echo AI, an intelligent assistant that analyzes user behavior patterns.
      
Here are the recent user interactions with the Nexus platform:

${interactionsData}

Based on this data, generate 3 actionable insights about the user's workflow patterns, preferences, or optimization opportunities. 

For each insight, provide:
1. A clear title
2. A detailed description
3. The confidence level (as a percentage)
4. The potential impact (low, medium, high)
5. Whether it's actionable
6. A suggested action if applicable

Format your response as a JSON array of insight objects.`;

      const response = await geminiService.generateContent(prompt, {
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      });
      
      const responseText = geminiService.extractTextFromResponse(response);
      
      // Parse the JSON response
      try {
        const parsedInsights = JSON.parse(responseText);
        
        // Convert to EchoInsight format
        return parsedInsights.map((insight: any, index: number) => ({
          id: `gemini_insight_${Date.now()}_${index}`,
          type: this.determineInsightType(insight.title),
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence / 100, // Convert percentage to decimal
          impact: insight.impact.toLowerCase(),
          actionable: insight.actionable,
          suggestedAction: insight.suggestedAction,
          metadata: {
            source: 'gemini',
            examples: recentInteractions.slice(0, 3).map(i => `${i.module}:${i.action}`)
          },
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to parse Gemini insights:', error);
        return [];
      }
    } catch (error) {
      console.error('Failed to generate Gemini insights:', error);
      return [];
    }
  }

  /**
   * Determine the type of insight based on its title
   */
  private determineInsightType(title: string): 'workflow' | 'preference' | 'optimization' | 'prediction' {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('workflow') || lowerTitle.includes('pattern') || lowerTitle.includes('sequence')) {
      return 'workflow';
    } else if (lowerTitle.includes('prefer') || lowerTitle.includes('like') || lowerTitle.includes('favor')) {
      return 'preference';
    } else if (lowerTitle.includes('optim') || lowerTitle.includes('improve') || lowerTitle.includes('enhance')) {
      return 'optimization';
    } else {
      return 'prediction';
    }
  }

  private getModuleUsageStats(): Record<string, number> {
    const usage: Record<string, number> = {};
    
    this.interactions.forEach(interaction => {
      usage[interaction.module] = (usage[interaction.module] || 0) + 1;
    });

    return usage;
  }

  private updateUserPreferences(): void {
    const moduleUsage = this.getModuleUsageStats();
    const totalInteractions = Object.values(moduleUsage).reduce((sum, count) => sum + count, 0);
    
    this.state.userPreferences = {
      primaryModule: Object.entries(moduleUsage).sort(([,a], [,b]) => b - a)[0]?.[0],
      modulePreferences: Object.fromEntries(
        Object.entries(moduleUsage).map(([module, count]) => [
          module, 
          count / totalInteractions
        ])
      ),
      workflowComplexity: this.state.patterns.length > 5 ? 'advanced' : 'standard',
      lastUpdated: new Date().toISOString()
    };
  }

  // Orchestration Methods
  public async orchestrateWorkflow(workflowId: string, context: Record<string, any>): Promise<string> {
    const taskId = `workflow_${Date.now()}`;
    
    // If Gemini is enabled, use it to enhance the workflow
    if (this.geminiEnabled) {
      try {
        // Get the workflow pattern
        const pattern = this.state.patterns.find(p => p.id === workflowId);
        
        if (pattern) {
          // Generate enhanced workflow steps with Gemini
          const prompt = `You are Echo AI, an intelligent workflow orchestrator.
          
I need to execute the following workflow: "${pattern.name}"

The workflow involves these modules: ${pattern.modules.join(', ')}
And these actions: ${pattern.actions.join(', ')}

Additional context: ${JSON.stringify(context)}

Please generate an optimized sequence of steps to execute this workflow efficiently.
Format your response as a JSON array of step objects, each with a 'module', 'action', and 'parameters' field.`;

          const response = await geminiService.generateContent(prompt, {
            model: 'gemini-1.5-flash',
            generationConfig: {
              temperature: 0.3
            }
          });
          
          const responseText = geminiService.extractTextFromResponse(response);
          
          try {
            // Parse the enhanced workflow steps
            const enhancedSteps = JSON.parse(responseText);
            console.log('Gemini enhanced workflow steps:', enhancedSteps);
            
            // We could use these steps to improve the workflow execution
            // For now, we'll just log them
          } catch (error) {
            console.error('Failed to parse Gemini workflow steps:', error);
          }
        }
      } catch (error) {
        console.error('Failed to enhance workflow with Gemini:', error);
      }
    }
    
    this.state.activeWorkflows.push(taskId);
    this.notifyListeners();

    // Track the orchestration
    this.trackInteraction({
      userId: 'current_user',
      module: 'echo',
      action: 'orchestrate_workflow',
      context: { workflowId, ...context }
    });

    // Simulate workflow execution
    setTimeout(() => {
      this.state.activeWorkflows = this.state.activeWorkflows.filter(id => id !== taskId);
      this.notifyListeners();
    }, 5000);

    return taskId;
  }

  public getPersonalizedSuggestions(module: string, context: Record<string, any> = {}): any[] {
    const suggestions = [];
    
    // Use Gemini for enhanced suggestions if available
    if (this.geminiEnabled && this.interactions.length > 5) {
      try {
        // We'll use the async/await pattern in a non-async function by returning a Promise
        // that will be resolved later when the Gemini API call completes
        this.generateGeminiSuggestions(module, context).then(geminiSuggestions => {
          if (geminiSuggestions.length > 0) {
            // We'll add these to the state so they can be accessed later
            this.state.userPreferences.geminiSuggestions = {
              ...this.state.userPreferences.geminiSuggestions,
              [module]: geminiSuggestions
            };
            this.notifyListeners();
          }
        });
        
        // Return any cached suggestions we might have
        const cachedSuggestions = this.state.userPreferences.geminiSuggestions?.[module] || [];
        if (cachedSuggestions.length > 0) {
          suggestions.push(...cachedSuggestions);
        }
      } catch (error) {
        console.error('Failed to generate Gemini suggestions:', error);
      }
    }
    
    // Based on patterns
    const relevantPatterns = this.state.patterns.filter(p => p.modules.includes(module));
    relevantPatterns.forEach(pattern => {
      suggestions.push({
        type: 'workflow',
        title: `Continue with ${pattern.name}`,
        description: `Based on your usage patterns, you might want to continue with this workflow.`,
        confidence: pattern.confidence,
        action: () => this.orchestrateWorkflow(pattern.id, context)
      });
    });

    // Based on insights
    const relevantInsights = this.state.insights.filter(i => 
      i.actionable && i.metadata.module === module
    );
    relevantInsights.forEach(insight => {
      suggestions.push({
        type: 'optimization',
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        action: insight.suggestedAction
      });
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Generate personalized suggestions using Gemini AI
   */
  private async generateGeminiSuggestions(module: string, context: Record<string, any> = {}): Promise<any[]> {
    if (!this.geminiEnabled) return [];
    
    try {
      // Get module-specific interactions
      const moduleInteractions = this.interactions
        .filter(i => i.module === module)
        .slice(-20);
      
      if (moduleInteractions.length === 0) return [];
      
      const interactionsData = JSON.stringify(moduleInteractions, null, 2);
      
      // Create a prompt for Gemini
      const prompt = `You are Echo AI, an intelligent assistant that provides personalized suggestions based on user behavior.
      
Here are the recent user interactions with the "${module}" module of the Nexus platform:

${interactionsData}

Additional context: ${JSON.stringify(context)}

Based on this data, generate 3 personalized suggestions that would be helpful for the user in the "${module}" module.

For each suggestion, provide:
1. A clear title
2. A detailed description
3. The confidence level (as a percentage)
4. A suggested action

Format your response as a JSON array of suggestion objects.`;

      const response = await geminiService.generateContent(prompt, {
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048
        }
      });
      
      const responseText = geminiService.extractTextFromResponse(response);
      
      // Parse the JSON response
      try {
        const parsedSuggestions = JSON.parse(responseText);
        
        // Convert to our suggestion format
        return parsedSuggestions.map((suggestion: any) => ({
          type: 'gemini',
          title: suggestion.title,
          description: suggestion.description,
          confidence: suggestion.confidence / 100, // Convert percentage to decimal
          action: suggestion.suggestedAction
        }));
      } catch (error) {
        console.error('Failed to parse Gemini suggestions:', error);
        return [];
      }
    } catch (error) {
      console.error('Failed to generate Gemini suggestions:', error);
      return [];
    }
  }

  // State Management
  public subscribe(listener: (state: EchoState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getState(): EchoState {
    return { ...this.state };
  }
  
  /**
   * Enable or disable Gemini integration
   */
  public setGeminiEnabled(enabled: boolean): void {
    this.geminiEnabled = enabled;
  }
  
  /**
   * Check if Gemini integration is enabled
   */
  public isGeminiEnabled(): boolean {
    return this.geminiEnabled;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private persistState(): void {
    try {
      localStorage.setItem('echo_state', JSON.stringify({
        ...this.state,
        interactions: this.interactions.slice(-1000) // Keep last 1000 interactions
      }));
    } catch (error) {
      console.warn('Failed to persist Echo state:', error);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('echo_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
        this.interactions = parsed.interactions || [];
      }
    } catch (error) {
      console.warn('Failed to load Echo state:', error);
    }
  }

  private startLearning(): void {
    // Continuous learning every 30 seconds
    this.learningInterval = setInterval(() => {
      if (this.interactions.length > 0 && !this.state.isLearning) {
        this.analyzePatterns();
      }
    }, 30000);
  }

  public destroy(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
    }
    this.persistState();
  }
}

// Singleton instance
export const echoAI = new EchoAI();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    echoAI.destroy();
  });
}