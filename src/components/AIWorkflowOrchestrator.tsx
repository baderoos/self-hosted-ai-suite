import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { geminiService } from '../services/GeminiService';
import { 
  Brain, 
  Wand2, 
  Video, 
  Mic, 
  Eye, 
  Scissors, 
  Music, 
  Palette,
  Zap,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Settings,
  Layers,
  Sparkles,
  Target,
  Workflow
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  estimatedTime: string;
  dependencies: string[];
  outputs?: string[];
}

interface AIAgent {
  id: string;
  name: string;
  type: 'generation' | 'editing' | 'analysis' | 'enhancement';
  icon: any;
  color: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  steps: Omit<WorkflowStep, 'status' | 'progress'>[];
  requiredInputs: string[];
  expectedOutputs: string[];
}

export function AIWorkflowOrchestrator() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowText, setWorkflowText] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any[] | null>(null);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  
  const { trackInteraction } = useNexus();

  const aiAgents: AIAgent[] = [
    {
      id: 'video-gen',
      name: 'Video Generation AI',
      type: 'generation',
      icon: Video,
      color: 'blue',
      capabilities: ['Text-to-Video', 'Image-to-Video', 'Style Transfer'],
      status: 'idle'
    },
    {
      id: 'transcriber',
      name: 'Transcriber AI',
      type: 'analysis',
      icon: Mic,
      color: 'green',
      capabilities: ['Speech-to-Text', 'Speaker ID', 'Timestamp Sync'],
      status: 'idle'
    },
    {
      id: 'vision-ai',
      name: 'Vision AI',
      type: 'analysis',
      icon: Eye,
      color: 'purple',
      capabilities: ['Scene Detection', 'Object Recognition', 'Content Analysis'],
      status: 'idle'
    },
    {
      id: 'editor-ai',
      name: 'Editor AI',
      type: 'editing',
      icon: Scissors,
      color: 'orange',
      capabilities: ['Auto-Cut', 'Silence Removal', 'Scene Assembly'],
      status: 'idle'
    },
    {
      id: 'audio-ai',
      name: 'Audio AI',
      type: 'enhancement',
      icon: Music,
      color: 'pink',
      capabilities: ['Noise Reduction', 'Audio Enhancement', 'Music Generation'],
      status: 'idle'
    },
    {
      id: 'style-ai',
      name: 'Style AI',
      type: 'enhancement',
      icon: Palette,
      color: 'cyan',
      capabilities: ['Color Grading', 'Visual Effects', 'Style Transfer'],
      status: 'idle'
    }
  ];

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'podcast-to-social',
      name: 'Podcast to Social Media',
      description: 'Transform a podcast episode into multiple social media clips',
      category: 'Content Creation',
      estimatedDuration: '15-20 minutes',
      complexity: 'intermediate',
      steps: [
        {
          id: 'transcribe',
          name: 'Transcribe Audio',
          description: 'Convert podcast audio to text with timestamps',
          agent: 'Transcriber AI',
          estimatedTime: '3-5 min',
          dependencies: []
        },
        {
          id: 'analyze-content',
          name: 'Analyze Content',
          description: 'Identify key moments and quotable segments',
          agent: 'Vision AI',
          estimatedTime: '2-3 min',
          dependencies: ['transcribe']
        },
        {
          id: 'create-clips',
          name: 'Create Video Clips',
          description: 'Generate short video clips from key segments',
          agent: 'Editor AI',
          estimatedTime: '8-10 min',
          dependencies: ['analyze-content']
        },
        {
          id: 'enhance-audio',
          name: 'Enhance Audio',
          description: 'Clean up audio and add background music',
          agent: 'Audio AI',
          estimatedTime: '2-3 min',
          dependencies: ['create-clips']
        }
      ],
      requiredInputs: ['Podcast audio file'],
      expectedOutputs: ['Social media clips', 'Transcription', 'Key quotes']
    },
    {
      id: 'blog-to-video',
      name: 'Blog Post to Video',
      description: 'Convert written blog content into engaging video format',
      category: 'Content Transformation',
      estimatedDuration: '10-15 minutes',
      complexity: 'beginner',
      steps: [
        {
          id: 'analyze-text',
          name: 'Analyze Blog Content',
          description: 'Extract key points and structure from blog post',
          agent: 'Vision AI',
          estimatedTime: '2-3 min',
          dependencies: []
        },
        {
          id: 'generate-visuals',
          name: 'Generate Visuals',
          description: 'Create relevant images and graphics for video',
          agent: 'Video Generation AI',
          estimatedTime: '5-7 min',
          dependencies: ['analyze-text']
        },
        {
          id: 'create-video',
          name: 'Assemble Video',
          description: 'Combine visuals with narration and transitions',
          agent: 'Editor AI',
          estimatedTime: '3-5 min',
          dependencies: ['generate-visuals']
        }
      ],
      requiredInputs: ['Blog post text', 'Brand guidelines'],
      expectedOutputs: ['Video content', 'Visual assets', 'Script']
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Content Analysis',
      description: 'Analyze competitor content and generate strategic insights',
      category: 'Market Research',
      estimatedDuration: '20-25 minutes',
      complexity: 'advanced',
      steps: [
        {
          id: 'scrape-content',
          name: 'Gather Competitor Content',
          description: 'Collect recent content from competitor channels',
          agent: 'Vision AI',
          estimatedTime: '5-7 min',
          dependencies: []
        },
        {
          id: 'analyze-performance',
          name: 'Analyze Performance Metrics',
          description: 'Evaluate engagement and reach of competitor content',
          agent: 'Vision AI',
          estimatedTime: '3-5 min',
          dependencies: ['scrape-content']
        },
        {
          id: 'identify-trends',
          name: 'Identify Content Trends',
          description: 'Discover patterns and trending topics',
          agent: 'Vision AI',
          estimatedTime: '4-6 min',
          dependencies: ['analyze-performance']
        },
        {
          id: 'generate-strategy',
          name: 'Generate Content Strategy',
          description: 'Create actionable content recommendations',
          agent: 'Vision AI',
          estimatedTime: '8-10 min',
          dependencies: ['identify-trends']
        }
      ],
      requiredInputs: ['Competitor URLs', 'Target metrics'],
      expectedOutputs: ['Analysis report', 'Content strategy', 'Trend insights']
    },
    {
      id: 'webinar-highlights',
      name: 'Webinar Highlight Reel',
      description: 'Create a highlight reel from a long-form webinar',
      category: 'Video Editing',
      estimatedDuration: '12-18 minutes',
      complexity: 'intermediate',
      steps: [
        {
          id: 'transcribe-webinar',
          name: 'Transcribe Webinar',
          description: 'Convert webinar audio to searchable text',
          agent: 'Transcriber AI',
          estimatedTime: '4-6 min',
          dependencies: []
        },
        {
          id: 'identify-highlights',
          name: 'Identify Key Moments',
          description: 'Find the most engaging and valuable segments',
          agent: 'Vision AI',
          estimatedTime: '3-4 min',
          dependencies: ['transcribe-webinar']
        },
        {
          id: 'edit-highlights',
          name: 'Edit Highlight Clips',
          description: 'Create polished clips from identified segments',
          agent: 'Editor AI',
          estimatedTime: '5-8 min',
          dependencies: ['identify-highlights']
        }
      ],
      requiredInputs: ['Webinar recording'],
      expectedOutputs: ['Highlight reel', 'Individual clips', 'Timestamps']
    }
  ];

  const generateWorkflowFromText = async () => {
    if (!workflowText.trim()) return;
    
    setIsGeneratingWorkflow(true);
    setGeneratedWorkflow(null);
    setWorkflowError(null);
    
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'workflow',
        action: 'generate_workflow',
        context: { prompt: workflowText }
      });
      
      if (!geminiService.hasApiKey()) {
        throw new Error('Gemini API key not set. Please configure it in Settings.');
      }
      
      const prompt = `You are Echo AI, an expert workflow orchestrator for the Nexus platform.

The user has requested the following workflow:

"${workflowText}"

Please analyze this request and create a structured workflow with multiple steps.

For each step, specify:
1. The step name
2. A brief description of what happens in this step
3. Which AI agent should handle this step
4. Any dependencies (previous steps that must complete first)
5. Estimated time to complete

Format your response as a JSON array of workflow step objects.

Available agents:
- Video Generation AI: Creates videos from text prompts
- Transcriber AI: Converts speech to text
- Vision AI: Analyzes visual content
- Editor AI: Edits and assembles content
- Audio AI: Processes and enhances audio
- Social Clip AI: Creates social media optimized clips`;

      const response = await geminiService.generateContent(prompt, {
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      });
      
      const responseText = geminiService.extractTextFromResponse(response);
      
      try {
        // Parse the JSON response
        const workflow = JSON.parse(responseText);
        setGeneratedWorkflow(workflow);
      } catch (error) {
        console.error('Failed to parse workflow JSON:', error);
        setWorkflowError('Failed to parse the generated workflow. Please try again with a clearer description.');
      }
    } catch (error) {
      console.error('Workflow generation failed:', error);
      setWorkflowError(`Error: ${error.message}`);
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  const executeWorkflow = useCallback(async (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (!template) return;

    setActiveWorkflow(templateId);
    setIsExecuting(true);
    
    const steps: WorkflowStep[] = template.steps.map(step => ({
      ...step,
      status: 'pending',
      progress: 0
    }));
    
    setWorkflowSteps(steps);

    // Simulate workflow execution
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update step to running
      setWorkflowSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'running' } : s
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setWorkflowSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, progress } : s
        ));
      }

      // Mark as completed
      setWorkflowSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'completed', progress: 100 } : s
      ));
    }

    setIsExecuting(false);
  }, [workflowTemplates]);

  const getAgentStatus = (agentId: string) => {
    const runningStep = workflowSteps.find(step => 
      step.agent === agentId && step.status === 'running'
    );
    return runningStep ? 'busy' : 'idle';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Play;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'running': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(168, 85, 247, 0.5)",
                "0 0 40px rgba(168, 85, 247, 0.8)",
                "0 0 20px rgba(168, 85, 247, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Workflow size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              AI Workflow Orchestrator
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Intelligent automation for complex video production workflows
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* AI Agents Panel */}
        <motion.div 
          className="xl:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Brain size={20} className="mr-2" />
              AI Agents
            </h2>
            <div className="space-y-3">
              {aiAgents.map((agent, index) => (
                <motion.div 
                  key={agent.id}
                  className="p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-700/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${agent.color}-100 dark:bg-${agent.color}-900/30`}>
                        <agent.icon size={16} className={`text-${agent.color}-600 dark:text-${agent.color}-400`} />
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white text-sm">
                        {agent.name}
                      </span>
                    </div>
                    <motion.div 
                      className={`w-2 h-2 rounded-full ${
                        getAgentStatus(agent.id) === 'busy' ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      animate={{ 
                        scale: getAgentStatus(agent.id) === 'busy' ? [1, 1.2, 1] : 1,
                        opacity: getAgentStatus(agent.id) === 'busy' ? [1, 0.5, 1] : 1
                      }}
                      transition={{ duration: 1, repeat: getAgentStatus(agent.id) === 'busy' ? Infinity : 0 }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {agent.capabilities.join(' • ')}
                  </div>
                  {getAgentStatus(agent.id) === 'busy' && (
                    <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                      Processing workflow step...
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Workflow Templates */}
        <motion.div 
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Workflow Templates
              <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                (or use Gemini to create a custom workflow)
              </span>
            </h2>
            
            {/* Gemini Workflow Generator */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                  Gemini Workflow Generator
                </h3>
              </div>
              
              <textarea
                value={workflowText}
                onChange={(e) => setWorkflowText(e.target.value)}
                placeholder="Describe a complex task in plain English (e.g., 'Analyze the top 5 blog posts from competitor.com and draft a response to their latest article')"
                className="w-full px-4 py-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3 resize-none"
                rows={3}
              />
              
              <motion.button
                onClick={generateWorkflowFromText}
                disabled={isGeneratingWorkflow || !workflowText.trim()}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGeneratingWorkflow ? (
                  <>
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Generating Workflow...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Workflow</span>
                  </>
                )}
              </motion.button>
              
              {workflowError && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-400 text-sm">
                  {workflowError}
                </div>
              )}
              
              {generatedWorkflow && (
                <motion.div
                  className="mt-4 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-medium text-indigo-900 dark:text-indigo-100 text-sm">
                    Generated Workflow
                  </h4>
                  
                  {generatedWorkflow.map((step, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-indigo-200 dark:border-indigo-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-neutral-900 dark:text-white text-sm">
                          {index + 1}. {step.name}
                        </h5>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {step.estimatedTime}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                        {step.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-600 dark:text-indigo-400">
                          Agent: {step.agent}
                        </span>
                        {step.dependencies && step.dependencies.length > 0 && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            Depends on: {step.dependencies.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <motion.button
                    onClick={() => {
                      setActiveWorkflow('custom');
                      setWorkflowSteps(generatedWorkflow.map(step => ({
                        ...step,
                        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        status: 'pending',
                        progress: 0
                      })));
                      setIsExecuting(true);
                      
                      // Simulate workflow execution
                      executeWorkflow('custom');
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap size={16} />
                    <span>Execute Generated Workflow</span>
                  </motion.button>
                </motion.div>
              )}
            </div>
            
            <div className="space-y-3">
              {workflowTemplates.map((template, index) => (
                <motion.button
                  key={template.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    selectedTemplate === template.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        template.complexity === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        template.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">Duration:</span>
                      <span className="text-neutral-900 dark:text-white ml-2">{template.estimatedDuration}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400">Steps:</span>
                      <span className="text-neutral-900 dark:text-white ml-2">{template.steps.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.expectedOutputs.slice(0, 3).map((output) => (
                      <span
                        key={output}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                      >
                        <Target size={10} className="mr-1" />
                        {output}
                      </span>
                    ))}
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <motion.div
                      className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeWorkflow(template.id);
                        }}
                        disabled={isExecuting}
                        className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Zap size={16} />
                        <span>{isExecuting ? 'Executing...' : 'Execute Workflow'}</span>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Workflow Execution Panel */}
        <motion.div 
          className="xl:col-span-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Execution Status
            </h2>
            
            {activeWorkflow ? (
              <div className="space-y-3">
                {workflowSteps.map((step, index) => {
                  const StepIcon = getStepIcon(step.status);
                  return (
                    <motion.div
                      key={step.id}
                      className="p-3 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/50"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <motion.div
                          animate={step.status === 'running' ? { rotate: 360 } : {}}
                          transition={{ duration: 2, repeat: step.status === 'running' ? Infinity : 0, ease: "linear" }}
                        >
                          <StepIcon size={16} className={getStepColor(step.status)} />
                        </motion.div>
                        <span className="font-medium text-neutral-900 dark:text-white text-sm">
                          {step.name}
                        </span>
                      </div>
                      
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        {step.description}
                      </div>
                      
                      {step.status === 'running' && (
                        <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-1">
                          <motion.div 
                            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${step.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        <span>Agent: {step.agent}</span>
                        <span>{step.estimatedTime}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={48} className="text-neutral-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Select a workflow template to begin
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}