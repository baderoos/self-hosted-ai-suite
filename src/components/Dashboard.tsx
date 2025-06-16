import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMCPTasks } from '../hooks/useMCPTasks';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useNexus } from '../core/NexusContext';
import { 
  Brain, 
  Image, 
  Video, 
  FileText, 
  Share2, 
  Settings, 
  Activity,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Zap,
  Cpu,
  HardDrive,
  Users,
  BarChart3,
  PlayCircle,
  Download,
  Mic
} from 'lucide-react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const { echoState, getPersonalizedSuggestions } = useNexus();
  const { tasks } = useMCPTasks();
  const { status: systemStatus, isOnline } = useSystemStatus();

  const stats = [
    { 
      label: 'MCP Directives Executed', 
      value: tasks.length.toString(), 
      change: '+12%', 
      icon: Brain,
      color: 'primary',
      description: 'Natural language commands processed'
    },
    { 
      label: 'AI Agent Hours', 
      value: '156.2', 
      change: '+8%', 
      icon: Activity,
      color: 'secondary',
      description: 'Total processing time across all agents'
    },
    { 
      label: 'Multi-Cam Projects', 
      value: '89', 
      change: '+15%', 
      icon: Video,
      color: 'accent',
      description: 'Intelligent multi-camera productions'
    },
    { 
      label: 'Auto-Generated Clips', 
      value: '1,284', 
      change: '+23%', 
      icon: Share2,
      color: 'purple',
      description: 'Social media content created'
    },
  ];

  // Convert tasks to recent jobs format
  const recentJobs = tasks.slice(0, 10).map(task => ({
    id: task.task_id,
    type: task.current_step,
    status: task.status,
    title: task.logs[0]?.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '') || 'MCP Task',
    time: new Date(task.timestamp).toLocaleString(),
    duration: task.status === 'completed' ? 'Completed' : `${task.progress}%`,
    agent: 'MCP',
    progress: task.progress
  }));

  const workflowTemplates = [
    {
      name: "The Podcast Workflow",
      description: "Complete podcast production pipeline",
      steps: 7,
      avgTime: "2h 15m",
      icon: Mic,
      color: "emerald"
    },
    {
      name: "Viral Content Factory",
      description: "Extract and optimize viral moments",
      steps: 5,
      avgTime: "45m",
      icon: TrendingUp,
      color: "pink"
    },
    {
      name: "Live Event Coverage",
      description: "Multi-cam live switching and highlights",
      steps: 6,
      avgTime: "3h 30m",
      icon: Video,
      color: "blue"
    },
    {
      name: "Documentary Assembly",
      description: "Narrative-driven long-form editing",
      steps: 9,
      avgTime: "4h 45m",
      icon: FileText,
      color: "orange"
    }
  ];

  const systemMetrics = [
    { label: 'API Status', value: isOnline ? 100 : 0, unit: '%', color: 'blue', icon: Cpu },
    { label: 'Active Tasks', value: tasks.filter(t => t.status === 'processing').length, unit: '', color: 'green', icon: HardDrive },
    { label: 'Redis Status', value: systemStatus?.redis_status === 'connected' ? 100 : 0, unit: '%', color: 'purple', icon: Activity },
    { label: 'Total Tasks', value: tasks.length, unit: '', color: 'orange', icon: HardDrive }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(79, 70, 229, 0.5)",
                  "0 0 40px rgba(79, 70, 229, 0.8)",
                  "0 0 20px rgba(79, 70, 229, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={32} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
                Nexus Command Center
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Monitor your Echo AI and orchestrate creative workflows
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="group p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon size={24} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </motion.div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {stat.label}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Recent Echo Operations
              </h2>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-700/50 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="flex-shrink-0">
                    {job.status === 'completed' && (
                      <CheckCircle size={24} className="text-emerald-500" />
                    )}
                    {job.status === 'processing' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock size={24} className="text-yellow-500" />
                      </motion.div>
                    )}
                    {job.status === 'scheduled' && (
                      <AlertCircle size={24} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {job.title}
                      </p>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                        {job.agent}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.time}</span>
                      <span>•</span>
                      <span>{job.duration}</span>
                    </div>
                    {job.progress && (
                      <div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-1">
                        <motion.div 
                          className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      ${job.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      ${job.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    `}>
                      {job.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & System Status */}
        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Workflow Templates */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Echo's Suggested Workflows
            </h2>
            <div className="space-y-3">
              {getPersonalizedSuggestions('dashboard').concat(workflowTemplates).slice(0, 4).map((template, index) => (
                <motion.button
                  key={template.name}
                  className="w-full text-left p-3 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-700/50 transition-colors group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <template.icon size={16} className={`text-${template.color}-600 dark:text-${template.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                        {template.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {template.steps} steps • {template.avgTime}
                      </p>
                    </div>
                    <PlayCircle size={16} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Echo AI Performance
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Learning Strength', value: echoState.patterns.length * 5, unit: '%', color: 'indigo', icon: Brain },
                { label: 'Total Interactions', value: echoState.totalInteractions, unit: '', color: 'purple', icon: Activity },
                { label: 'Insights Generated', value: echoState.insights.length, unit: '', color: 'pink', icon: Sparkles },
                { label: 'System Health', value: echoState.systemHealth.performance, unit: '%', color: 'emerald', icon: Cpu }
              ].concat(systemMetrics).slice(0, 4).map((metric, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <metric.icon size={16} className={`text-${metric.color}-500`} />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{metric.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                      <motion.div 
                        className={`h-2 bg-${metric.color}-500 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white min-w-[40px]">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}