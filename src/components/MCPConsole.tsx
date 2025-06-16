import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { 
  Terminal, 
  Send, 
  Zap, 
  Brain, 
  Eye, 
  Mic, 
  Video, 
  Image,
  ChevronRight,
  Activity,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  X,
  Cloud
} from 'lucide-react';
import { useMCPTasks } from '../hooks/useMCPTasks';
import { useSystemStatus } from '../hooks/useSystemStatus';

interface AIAgent {
  name: string;
  icon: any;
  status: 'ready' | 'busy' | 'offline' | 'processing';
  color: string;
  load: number;
  tasks: number;
}

export function MCPConsole() {
  const [command, setCommand] = useState('');
  const { tasks, isLoading, error, executeCommand, cancelTask, clearError } = useMCPTasks();
  const { echoState, trackInteraction } = useNexus();
  const { status: systemStatus, isOnline } = useSystemStatus();
  const logEndRef = useRef<HTMLDivElement>(null);

  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    { name: 'Transcriber AI', icon: Mic, status: 'ready', color: 'emerald', load: 12, tasks: 0 },
    { name: 'Vision AI', icon: Eye, status: 'ready', color: 'blue', load: 8, tasks: 0 },
    { name: 'Audio AI', icon: Mic, status: 'ready', color: 'purple', load: 15, tasks: 0 },
    { name: 'Social Clip AI', icon: Video, status: 'ready', color: 'pink', load: 5, tasks: 0 },
    { name: 'Multi-Cam AI', icon: Video, status: 'ready', color: 'orange', load: 22, tasks: 0 },
    { name: 'Image AI', icon: Image, status: 'ready', color: 'cyan', load: 7, tasks: 0 },
  ]);

  const predefinedWorkflows = [
    {
      name: "The Podcast Workflow",
      command: 'MCP, execute "The Podcast Workflow": sync multi-cam, remove filler words, generate 3 teaser clips with animated captions',
      description: "Complete podcast production pipeline",
      workflow_type: "podcast"
    },
    {
      name: "Viral Moment Extraction",
      command: "MCP, analyze this content and extract the 5 most engaging moments for social media",
      description: "AI-powered viral content detection",
      workflow_type: "social"
    },
    {
      name: "Live-Switch Edit",
      command: "MCP, create a live-switched edit favoring the wide shot during crosstalk",
      description: "Intelligent multi-camera switching",
      workflow_type: "multicam"
    },
    {
      name: "Emotional Emphasis",
      command: "MCP, find the most emotional moment in this interview and emphasize it with music and color grading",
      description: "AI-driven emotional storytelling",
      workflow_type: "analysis"
    },
    {
      name: "Style Transfer",
      command: "MCP, re-edit this content in the style of a sci-fi trailer with dramatic pacing",
      description: "Creative style transformation",
      workflow_type: "style"
    }
  ];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tasks]);

  // Update agent status based on active tasks
  useEffect(() => {
    const activeTasks = tasks.filter(task => task.status === 'processing' || task.status === 'initiated');
    
    setAiAgents(prev => prev.map(agent => {
      const agentTasks = activeTasks.filter(task => 
        task.logs.some(log => log.includes(agent.name))
      );
      
      return {
        ...agent,
        status: agentTasks.length > 0 ? 'busy' : 'ready',
        tasks: agentTasks.length,
        load: agentTasks.length > 0 ? Math.floor(Math.random() * 40) + 30 : Math.floor(Math.random() * 20) + 5
      };
    }));
  }, [tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isLoading) return;
    
    try {
      await executeCommand({ command });
      setCommand('');
    } catch (err) {
      console.error('Failed to execute command:', err);
    }
  };

  const executeWorkflow = async (workflow: any) => {
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'console',
        action: 'execute_workflow',
        context: { workflow: workflow.name }
      });
      
      await executeCommand({
        command: workflow.command,
        workflow_type: workflow.workflow_type
      });
    } catch (err) {
      console.error('Failed to execute workflow:', err);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'command': return ChevronRight;
      case 'delegation': return Zap;
      case 'status': return Activity;
      case 'analysis': return Brain;
      case 'processing': return Cpu;
      case 'complete': return CheckCircle;
      case 'error': return AlertTriangle;
      default: return Terminal;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'command': return 'text-primary-400';
      case 'delegation': return 'text-secondary-400';
      case 'status': return 'text-accent-400';
      case 'analysis': return 'text-purple-400';
      case 'processing': return 'text-blue-400';
      case 'complete': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-emerald-400 bg-emerald-900/30';
      case 'busy': return 'text-yellow-400 bg-yellow-900/30';
      case 'processing': return 'text-blue-400 bg-blue-900/30';
      case 'offline': return 'text-red-400 bg-red-900/30';
      default: return 'text-neutral-400 bg-neutral-700';
    }
  };

  // Flatten all logs from all tasks for display
  const allLogs = tasks.flatMap(task => 
    task.logs.map((log, index) => ({
      id: `${task.task_id}-${index}`,
      timestamp: new Date(),
      type: task.status === 'completed' ? 'complete' : 
            task.status === 'error' ? 'error' : 
            task.status === 'processing' ? 'processing' : 'status',
      message: log,
      progress: task.progress,
      task_id: task.task_id
    }))
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Connection Status */}
      {!isOnline && (
        <motion.div 
          className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <Cloud size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Connecting to MCP Cloud Service... Please check your internet connection.
            </span>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* MCP Header */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center space-x-3 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: isOnline ? [
                "0 0 20px rgba(79, 70, 229, 0.5)",
                "0 0 40px rgba(79, 70, 229, 0.8)",
                "0 0 20px rgba(79, 70, 229, 0.5)"
              ] : ["0 0 20px rgba(239, 68, 68, 0.5)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Echo Command Console
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Advanced Natural Language Command Interface
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <motion.div 
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-blue-500'}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className={`text-xs font-medium ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {isOnline ? 'ECHO CONNECTED' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </div>
        <motion.p 
          className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to the Echo Command Console. Issue natural language directives to your AI assistant.
          Echo will learn from your interactions and intelligently orchestrate your creative workflows.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* AI Agents Status Panel */}
        <motion.div 
          className="xl:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6 shadow-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Activity size={20} className="mr-2" />
              AI Agent Telemetry
            </h2>
            <div className="space-y-3">
              {aiAgents.map((agent, index) => (
                <motion.div 
                  key={agent.name} 
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
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className={`w-2 h-2 rounded-full ${
                          agent.status === 'ready' ? 'bg-emerald-500' :
                          agent.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        animate={{ 
                          scale: agent.status === 'busy' ? [1, 1.2, 1] : 1,
                          opacity: agent.status === 'busy' ? [1, 0.5, 1] : 1
                        }}
                        transition={{ duration: 1, repeat: agent.status === 'busy' ? Infinity : 0 }}
                      />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAgentStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Load: {agent.load}%</span>
                    <span>Tasks: {agent.tasks}</span>
                  </div>
                  <div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-1">
                    <motion.div 
                      className={`h-1 rounded-full bg-${agent.color}-500`}
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.load}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              System Metrics
            </h3>
            <div className="space-y-3">
              {[
                { icon: Cpu, label: 'API Status', value: systemStatus?.api_status || 'Unknown', color: 'blue' },
                { icon: HardDrive, label: 'Redis Status', value: systemStatus?.redis_status || 'Unknown', color: 'green' },
                { icon: Wifi, label: 'Active Tasks', value: systemStatus?.active_task_count?.toString() || '0', color: 'purple' },
                { icon: Zap, label: 'Memory Usage', value: systemStatus?.redis_memory_usage || 'N/A', color: 'orange' }
              ].map((metric, index) => (
                <motion.div 
                  key={metric.label}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-700/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <metric.icon size={16} className={`text-${metric.color}-500`} />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{metric.label}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{metric.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* MCP Console */}
        <motion.div 
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-neutral-900 dark:bg-neutral-950 rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl">
            {/* Console Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
              <div className="flex items-center space-x-3">
                <Terminal size={16} className="text-emerald-400" />
                <span className="text-emerald-400 font-mono text-sm font-semibold">MCP Terminal v2.1</span>
                {tasks.some(task => task.status === 'processing') && (
                  <motion.span 
                    className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    PROCESSING
                  </motion.span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Console Log */}
            <div className="h-96 overflow-y-auto p-4 font-mono text-sm bg-neutral-900/50">
              <AnimatePresence>
                {allLogs.map((log) => {
                  const LogIcon = getLogIcon(log.type);
                  return (
                    <motion.div 
                      key={log.id} 
                      className="flex items-start space-x-3 mb-3 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-neutral-500 text-xs mt-1 min-w-[60px]">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <LogIcon size={14} className={`mt-0.5 ${getLogColor(log.type)} group-hover:scale-110 transition-transform`} />
                      <div className="flex-1">
                        <span className="text-neutral-300">
                          {log.message}
                        </span>
                        {log.progress > 0 && log.progress < 100 && (
                          <div className="mt-2 w-full bg-neutral-700 rounded-full h-1">
                            <motion.div 
                              className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${log.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                      {tasks.find(task => task.task_id === log.task_id)?.status === 'processing' && (
                        <button
                          onClick={() => cancelTask(log.task_id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  className="flex items-center space-x-2 text-accent-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                  <span>MCP processing directive...</span>
                </motion.div>
              )}
              <div ref={logEndRef} />
            </div>

            {/* Command Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-700 bg-neutral-800/30">
              <div className="flex items-center space-x-3">
                <span className="text-primary-400 font-mono font-bold">{'MCP>'}</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter your creative directive for the Master Control Program..."
                  disabled={isLoading || !isOnline}
                  className="flex-1 bg-transparent text-neutral-300 placeholder-neutral-500 focus:outline-none font-mono text-sm disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={!command.trim() || isLoading || !isOnline}
                  className="p-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={16} className="text-white" />
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Workflow Library */}
        <motion.div 
          className="xl:col-span-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Workflow Library
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Pre-configured creative workflows for common production tasks
            </p>
            <div className="space-y-3">
              {predefinedWorkflows.map((workflow, index) => (
                <motion.button
                  key={workflow.name}
                  onClick={() => executeWorkflow(workflow)}
                  disabled={isLoading || !isOnline}
                  className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-600 hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {workflow.name}
                    </h4>
                    <Play size={14} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                    {workflow.description}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                    "{workflow.command.substring(0, 50)}..."
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}