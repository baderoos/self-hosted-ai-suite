import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStudioMode } from './AgentStudioMode';
import { useNexus } from '../core/NexusContext';
import { geminiService } from '../services/GeminiService';
import { 
  Brain, 
  Zap, 
  Eye, 
  Mic, 
  Video, 
  Scissors, 
  Palette, 
  Share2,
  Play,
  Pause,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Clock,
  Target,
  Sparkles,
  Workflow,
  Plus,
  BarChart3,
  Wand2,
  FileText,
  Image
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'active' | 'busy' | 'learning';
  performance: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: string;
  };
  icon: any;
  color: string;
  specialization: string;
}

export function TheHive() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [studioModeAgent, setStudioModeAgent] = useState<string | null>(null);
  const [swarmMode, setSwarmMode] = useState(false);
  const [researchTask, setResearchTask] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [researchResult, setResearchResult] = useState<string | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  
  const { trackInteraction } = useNexus();

  const agents: AIAgent[] = [
    {
      id: 'genesis',
      name: 'Genesis',
      role: 'Creative Strategist',
      description: 'Master of viral content ideation and strategic creative direction',
      capabilities: ['Trend Analysis', 'Content Strategy', 'Viral Prediction', 'Audience Psychology'],
      status: 'active',
      performance: {
        tasksCompleted: 1247,
        successRate: 94,
        avgResponseTime: '2.3s'
      },
      icon: Sparkles,
      color: 'purple',
      specialization: 'Creative Strategy & Ideation'
    },
    {
      id: 'scribe',
      name: 'Scribe',
      role: 'Master Scriptwriter',
      description: 'Crafts compelling narratives and viral-worthy scripts',
      capabilities: ['Script Writing', 'Storytelling', 'Hook Creation', 'CTA Optimization'],
      status: 'idle',
      performance: {
        tasksCompleted: 892,
        successRate: 97,
        avgResponseTime: '3.1s'
      },
      icon: FileText,
      color: 'blue',
      specialization: 'Script Writing & Narrative'
    },
    {
      id: 'spectre',
      name: 'Spectre',
      role: 'Trend Analyst',
      description: 'Advanced pattern recognition and market intelligence specialist',
      capabilities: ['Trend Detection', 'Market Analysis', 'Competitive Intelligence', 'Timing Optimization'],
      status: 'busy',
      performance: {
        tasksCompleted: 2156,
        successRate: 91,
        avgResponseTime: '1.8s'
      },
      icon: TrendingUp,
      color: 'emerald',
      specialization: 'Trend Analysis & Intelligence'
    },
    {
      id: 'vision',
      name: 'Vision',
      role: 'Visual Intelligence',
      description: 'Computer vision specialist for visual content optimization',
      capabilities: ['Image Analysis', 'Visual Composition', 'Color Psychology', 'Brand Recognition'],
      status: 'active',
      performance: {
        tasksCompleted: 1634,
        successRate: 89,
        avgResponseTime: '4.2s'
      },
      icon: Eye,
      color: 'cyan',
      specialization: 'Visual Analysis & Optimization'
    },
    {
      id: 'assembler',
      name: 'Assembler',
      role: 'Video Editor',
      description: 'Master of pacing, cuts, and visual storytelling',
      capabilities: ['Video Editing', 'Pacing Optimization', 'Transition Design', 'Audio Sync'],
      status: 'learning',
      performance: {
        tasksCompleted: 743,
        successRate: 96,
        avgResponseTime: '8.7s'
      },
      icon: Scissors,
      color: 'orange',
      specialization: 'Video Editing & Assembly'
    },
    {
      id: 'sonic',
      name: 'Sonic',
      role: 'Audio Specialist',
      description: 'Professional audio processing and enhancement expert',
      capabilities: ['Audio Enhancement', 'Music Selection', 'Voice Processing', 'Sound Design'],
      status: 'idle',
      performance: {
        tasksCompleted: 567,
        successRate: 93,
        avgResponseTime: '5.4s'
      },
      icon: Mic,
      color: 'pink',
      specialization: 'Audio Processing & Enhancement'
    }
  ];

  const swarmWorkflows = [
    {
      id: 'viral-campaign',
      name: 'Viral Campaign Genesis',
      description: 'Deploy all agents to create a comprehensive viral content campaign',
      agents: ['genesis', 'spectre', 'scribe', 'vision', 'assembler'],
      estimatedTime: '45 minutes',
      complexity: 'High'
    },
    {
      id: 'rapid-response',
      name: 'Rapid Response Team',
      description: 'Quick content creation for trending topics',
      agents: ['spectre', 'genesis', 'scribe'],
      estimatedTime: '15 minutes',
      complexity: 'Medium'
    },
    {
      id: 'content-optimization',
      name: 'Content Optimization Swarm',
      description: 'Enhance existing content across all dimensions',
      agents: ['vision', 'assembler', 'sonic', 'scribe'],
      estimatedTime: '30 minutes',
      complexity: 'Medium'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Filter for PDFs and text files
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.txt')
    );
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF and text files are supported.');
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Track interaction
    trackInteraction({
      userId: 'current_user',
      module: 'hive',
      action: 'upload_documents',
      context: { fileCount: validFiles.length }
    });
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const processResearchTask = async () => {
    if (!researchTask.trim() || uploadedFiles.length === 0) {
      setResearchError('Please provide a research task and upload at least one document.');
      return;
    }
    
    if (!geminiService.hasApiKey()) {
      setResearchError('Gemini API key not set. Please configure it in Settings.');
      return;
    }
    
    setIsProcessing(true);
    setResearchResult(null);
    setResearchError(null);
    
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'hive',
        action: 'process_research_task',
        context: { 
          task: researchTask,
          fileCount: uploadedFiles.length
        }
      });
      
      // For demo purposes, we'll just process the first file
      // In a real implementation, we would process all files and combine the results
      const file = uploadedFiles[0];
      
      const fileData = {
        mimeType: file.type || 'application/pdf',
        data: file
      };
      
      const response = await geminiService.analyzeDocument(
        fileData,
        `You are a research assistant. Please analyze this document and complete the following task: ${researchTask}`,
        {
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        }
      );
      
      const result = geminiService.extractTextFromResponse(response);
      setResearchResult(result);
    } catch (error) {
      console.error('Research task processing failed:', error);
      setResearchError(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-900/30';
      case 'busy': return 'text-yellow-400 bg-yellow-900/30';
      case 'learning': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-neutral-400 bg-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Activity;
      case 'busy': return Zap;
      case 'learning': return Brain;
      default: return Clock;
    }
  };

  const handleAgentTune = (agentId: string) => {
    setStudioModeAgent(agentId);
  };

  const handleStudioModeClose = () => {
    setStudioModeAgent(null);
  };

  const handleStudioModeSave = (config: any) => {
    console.log('Agent configuration saved:', config);
    // Here you would typically update the agent's configuration
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
            <Brain size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              The Hive
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Deploy autonomous content swarm agents with Studio Mode customization
            </p>
          </div>
        </div>

        {/* Swarm Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setSwarmMode(!swarmMode)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                swarmMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Workflow size={20} />
              <span>{swarmMode ? 'Exit Swarm Mode' : 'Enter Swarm Mode'}</span>
            </motion.button>
            
            {swarmMode && (
              <motion.div 
                className="flex items-center space-x-2 text-purple-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={16} />
                </motion.div>
                <span className="text-sm font-medium">Swarm Intelligence Active</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Users size={16} />
            <span>{agents.filter(a => a.status === 'active').length} agents active</span>
          </div>
        </div>
      </motion.div>
      
      {/* Document Research Task Panel */}
      <motion.div 
        className="mb-8 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Document Research Agent
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Research Task */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Research Task
              </label>
              <textarea
                value={researchTask}
                onChange={(e) => setResearchTask(e.target.value)}
                placeholder="Describe your research task (e.g., 'Read these scientific papers and write a literature review')"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Upload Documents (PDF, TXT)
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="hidden"
                  id="document-upload"
                  multiple
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer block w-full p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-center hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="py-8">
                    <Upload size={32} className="mx-auto text-neutral-400 mb-2" />
                    <p>Click to upload documents</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Uploaded Documents ({uploadedFiles.length})
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-neutral-500" />
                        <span className="text-sm text-neutral-900 dark:text-white truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Process Button */}
            <motion.button
              onClick={processResearchTask}
              disabled={isProcessing || !researchTask.trim() || uploadedFiles.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <>
                  <motion.div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Processing Documents...</span>
                </>
              ) : (
                <>
                  <Brain size={20} />
                  <span>Process Research Task</span>
                </>
              )}
            </motion.button>
            
            {researchError && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-400 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{researchError}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Results Section */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Research Results
            </h3>
            
            <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 h-[500px] overflow-y-auto">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <motion.div 
                      className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Gemini is analyzing your documents...
                    </p>
                  </div>
                </div>
              ) : researchResult ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">
                    {researchResult}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText size={32} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Upload documents and define a research task to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Swarm Workflows */}
      <AnimatePresence>
        {swarmMode && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Workflow size={20} />
                <span>Swarm Deployment Protocols</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {swarmWorkflows.map((workflow, index) => (
                  <motion.button
                    key={workflow.id}
                    onClick={() => setActiveWorkflow(workflow.id)}
                    className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <h3 className="font-semibold text-white mb-2">{workflow.name}</h3>
                    <p className="text-sm text-neutral-300 mb-3">{workflow.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-400">{workflow.agents.length} agents</span>
                      <span className="text-cyan-400">{workflow.estimatedTime}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const StatusIcon = getStatusIcon(agent.status);
          
          return (
            <motion.div
              key={agent.id}
              className="group bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className={`p-3 rounded-xl bg-${agent.color}-100 dark:bg-${agent.color}-900/30`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <agent.icon size={24} className={`text-${agent.color}-600 dark:text-${agent.color}-400`} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{agent.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    <StatusIcon size={12} className="mr-1" />
                    {agent.status}
                  </span>
                </div>
              </div>

              {/* Agent Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {agent.description}
              </p>

              {/* Capabilities */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Performance
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-neutral-900 dark:text-white">
                      {agent.performance.tasksCompleted.toLocaleString()}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {agent.performance.successRate}%
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {agent.performance.avgResponseTime}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400">Avg Time</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => handleAgentTune(agent.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wand2 size={16} />
                  <span>Studio Mode</span>
                </motion.button>
                
                <motion.button
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings size={16} />
                </motion.button>
              </div>

              {/* Specialization Badge */}
              <div className="mt-4 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
                <div className="flex items-center space-x-2">
                  <Target size={14} className={`text-${agent.color}-500`} />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {agent.specialization}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Studio Mode Modal */}
      <AnimatePresence>
        {studioModeAgent && (
          <AgentStudioMode
            agentId={studioModeAgent}
            agentName={agents.find(a => a.id === studioModeAgent)?.name || 'Agent'}
            onClose={handleStudioModeClose}
            onSave={handleStudioModeSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}