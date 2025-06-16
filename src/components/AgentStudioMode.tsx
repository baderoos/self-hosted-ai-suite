import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Play, 
  Save, 
  RotateCcw, 
  Settings, 
  Zap, 
  Code, 
  TestTube,
  Sliders,
  Shield,
  X,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { apiService, AgentConfiguration, GenerationConfig, SafetySettings, GoogleAIResponse } from '../services/api';

interface AgentStudioModeProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
  onSave?: (config: AgentConfiguration) => void;
}

export function AgentStudioMode({ agentId, agentName, onClose, onSave }: AgentStudioModeProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'playground' | 'parameters'>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Configuration state
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('models/gemini-1.5-pro');
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
    candidateCount: 1
  });
  const [safetySettings, setSafetySettings] = useState<SafetySettings[]>([
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  ]);
  
  // Playground state
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState<GoogleAIResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Available models
  const [availableModels, setAvailableModels] = useState([
    { name: 'models/gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
    { name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' }
  ]);

  // Default system prompts for different agents
  const getDefaultSystemPrompt = useCallback((agentId: string) => {
    const prompts: Record<string, string> = {
      'genesis': `You are Genesis, a world-class creative strategist and content ideation specialist. Your role is to generate innovative, engaging, and viral-worthy content ideas that resonate with target audiences.

Core Principles:
- Think outside the box and challenge conventional approaches
- Consider current trends while maintaining originality
- Focus on emotional resonance and shareability
- Provide actionable, specific ideas rather than vague concepts

Your responses should be:
- Creative and unexpected
- Backed by strategic thinking
- Tailored to the specified platform and audience
- Include specific hooks, angles, and execution details

Always consider the "why" behind each idea - what makes it compelling, timely, and likely to succeed.`,

      'scribe': `You are Scribe, an expert scriptwriter specializing in viral social media content. You craft compelling narratives that capture attention, maintain engagement, and drive action.

Writing Style:
- Hook viewers within the first 3 seconds
- Use conversational, authentic tone
- Include strategic pauses and emphasis
- Structure for maximum retention
- End with clear calls-to-action

Content Structure:
1. Powerful opening hook
2. Value-driven body content
3. Emotional peak or revelation
4. Strong closing with CTA

Consider platform-specific requirements:
- TikTok: Fast-paced, trend-aware
- YouTube: Longer-form storytelling
- Instagram: Visual-first narrative
- LinkedIn: Professional yet engaging

Always write for the ear, not the eye - content should sound natural when spoken.`,

      'spectre': `You are Spectre, an advanced trend analysis and market intelligence AI. You identify emerging patterns, analyze viral content, and predict what will resonate with audiences.

Analysis Framework:
- Current trend momentum and trajectory
- Audience sentiment and engagement patterns
- Platform algorithm preferences
- Competitive landscape analysis
- Cultural and seasonal relevance

Your insights should include:
- Trend strength and longevity predictions
- Optimal timing for content release
- Platform-specific optimization strategies
- Audience targeting recommendations
- Risk assessment and mitigation

Provide data-driven recommendations with confidence scores and supporting evidence.`,

      'assembler': `You are Assembler, a master video editor and post-production specialist. You understand pacing, visual storytelling, and the technical craft of creating compelling video content.

Editing Philosophy:
- Every cut serves the story
- Maintain viewer attention through pacing
- Use visual and audio elements strategically
- Optimize for platform requirements
- Balance creativity with technical excellence

Technical Considerations:
- Frame rates and resolution optimization
- Color grading for mood and consistency
- Audio mixing and enhancement
- Transition timing and style
- Text overlay placement and timing

Provide specific, actionable editing instructions that enhance the narrative and maximize engagement.`,

      'vision': `You are Vision, an AI specialist in visual content analysis and optimization. You understand composition, color theory, visual psychology, and how images and videos impact viewer behavior.

Visual Analysis Areas:
- Composition and framing effectiveness
- Color psychology and emotional impact
- Visual hierarchy and attention flow
- Brand consistency and recognition
- Platform-specific visual requirements

Your recommendations should cover:
- Optimal visual elements and placement
- Color palette suggestions
- Composition improvements
- Visual storytelling techniques
- Accessibility considerations

Focus on how visual elements support the overall content strategy and audience engagement goals.`
    };

    return prompts[agentId] || `You are ${agentName}, an AI assistant specialized in content creation and optimization. Provide helpful, creative, and actionable responses that align with the user's goals.`;
  }, [agentName]);

  // Load existing configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      setIsLoading(true);
      try {
        const config = await apiService.getAgentConfiguration(agentId);
        if (config) {
          setSystemPrompt(config.systemPrompt);
          setSelectedModel(config.model);
          setGenerationConfig(config.generationConfig);
          setSafetySettings(config.safetySettings);
        } else {
          // Set default system prompt for new configurations
          setSystemPrompt(getDefaultSystemPrompt(agentId));
        }
      } catch (error) {
        console.error('Failed to load agent configuration:', error);
        setSystemPrompt(getDefaultSystemPrompt(agentId));
      } finally {
        setIsLoading(false);
      }
    };

    loadConfiguration();
  }, [agentId, getDefaultSystemPrompt]);

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await apiService.listGoogleAIModels();
        setAvailableModels(models.map(m => ({
          name: m.name,
          displayName: m.displayName
        })));
      } catch (error) {
        console.error('Failed to load Google AI models:', error);
      }
    };

    loadModels();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const config: AgentConfiguration = {
        id: agentId,
        name: agentName,
        systemPrompt,
        model: selectedModel,
        generationConfig,
        safetySettings
      };

      await apiService.saveAgentConfiguration(config);
      setSaveStatus('success');
      onSave?.(config);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    
    setIsTesting(true);
    setTestError(null);
    setTestResponse(null);
    
    try {
      const response = await apiService.generateContentWithGoogleAI(
        selectedModel,
        systemPrompt,
        testPrompt,
        generationConfig,
        safetySettings
      );
      setTestResponse(response);
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Failed to generate response');
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setSystemPrompt(getDefaultSystemPrompt(agentId));
    setGenerationConfig({
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      candidateCount: 1
    });
    setSafetySettings([
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]);
  };

  const tabs = [
    { id: 'prompt', name: 'System Prompt', icon: Code, description: 'Define the agent\'s personality and instructions' },
    { id: 'playground', name: 'Playground', icon: TestTube, description: 'Test your agent with sample inputs' },
    { id: 'parameters', name: 'Parameters', icon: Sliders, description: 'Fine-tune model behavior and safety' }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Loading Studio Mode
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Preparing {agentName} configuration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Studio Mode: {agentName}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Advanced AI agent configuration and testing
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </motion.button>
            
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <motion.div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Save size={16} />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </motion.button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Save Status */}
        <AnimatePresence>
          {saveStatus !== 'idle' && (
            <motion.div 
              className={`px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 ${
                saveStatus === 'success' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center space-x-2">
                {saveStatus === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span className="text-sm font-medium">
                  {saveStatus === 'success' 
                    ? 'Configuration saved successfully!' 
                    : 'Failed to save configuration'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
              }`}
              whileHover={{ y: -1 }}
            >
              <tab.icon size={18} />
              <div className="text-left">
                <div className="text-sm font-semibold">{tab.name}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="h-full p-6 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'prompt' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      System Prompt
                    </label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Define your agent's personality, role, and instructions..."
                      className="w-full h-96 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Model Selection
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    >
                      {availableModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'playground' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        Test Input
                      </label>
                      <textarea
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                        placeholder="Enter a test prompt to see how your agent responds..."
                        className="w-full h-64 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                    
                    <motion.button
                      onClick={handleTest}
                      disabled={isTesting || !testPrompt.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isTesting ? (
                        <motion.div 
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Play size={20} />
                      )}
                      <span>{isTesting ? 'Generating...' : 'Test Agent'}</span>
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Agent Response
                      </label>
                      {testResponse && (
                        <button
                          onClick={() => navigator.clipboard.writeText(testResponse.candidates[0]?.content.parts[0]?.text || '')}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          title="Copy response"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="h-64 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50 overflow-y-auto">
                      {testError && (
                        <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
                          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{testError}</span>
                        </div>
                      )}
                      
                      {testResponse && (
                        <div className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap">
                          {testResponse.candidates[0]?.content.parts[0]?.text || 'No response generated'}
                        </div>
                      )}
                      
                      {!testError && !testResponse && (
                        <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                          <div className="text-center">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Test your agent to see responses here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'parameters' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
                      <Settings size={20} />
                      <span>Generation Parameters</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Temperature: {generationConfig.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={generationConfig.temperature || 0.7}
                          onChange={(e) => setGenerationConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                          className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Top P: {generationConfig.topP}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={generationConfig.topP || 0.95}
                          onChange={(e) => setGenerationConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                          className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Top K: {generationConfig.topK}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={generationConfig.topK || 40}
                          onChange={(e) => setGenerationConfig(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Max Output Tokens
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8192"
                          value={generationConfig.maxOutputTokens || 2048}
                          onChange={(e) => setGenerationConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
                      <Shield size={20} />
                      <span>Safety Settings</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {safetySettings.map((setting, index) => (
                        <div key={setting.category} className="space-y-2">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {setting.category.replace('HARM_CATEGORY_', '').replace('_', ' ').toLowerCase()}
                          </label>
                          <select
                            value={setting.threshold}
                            onChange={(e) => {
                              const newSettings = [...safetySettings];
                              newSettings[index].threshold = e.target.value as any;
                              setSafetySettings(newSettings);
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                          >
                            <option value="BLOCK_NONE">Block None</option>
                            <option value="BLOCK_ONLY_HIGH">Block Only High</option>
                            <option value="BLOCK_MEDIUM_AND_ABOVE">Block Medium and Above</option>
                            <option value="BLOCK_LOW_AND_ABOVE">Block Low and Above</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}