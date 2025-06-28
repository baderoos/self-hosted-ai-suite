import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { RecentJobs } from './dashboard/RecentJobs';
import { SuggestedWorkflows } from './dashboard/SuggestedWorkflows';
import { SystemMetrics } from './dashboard/SystemMetrics';
import { useMCPTasks } from '../hooks/useMCPTasks';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useNexus } from '../core/NexusContext';

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
      <DashboardHeader 
        timeRange={timeRange}
        onTimeRangeChange={(value) => setTimeRange(value)}
      />

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <RecentJobs jobs={recentJobs} />

        {/* Quick Actions & System Status */}
        <div className="lg:col-span-1 space-y-6">
          <SuggestedWorkflows 
            templates={getPersonalizedSuggestions('dashboard').concat(workflowTemplates).slice(0, 4)} 
          />
          <SystemMetrics 
            echoMetrics={[
              { label: 'Learning Strength', value: echoState.patterns.length * 5, unit: '%', color: 'indigo', icon: Brain },
              { label: 'Total Interactions', value: echoState.totalInteractions, unit: '', color: 'purple', icon: Activity },
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
  Mic,
  Sparkles
} from 'lucide-react';              { label: 'System Health', value: echoState.systemHealth.performance, unit: '%', color: 'emerald', icon: Cpu }
            ]}
            systemMetrics={systemMetrics}
          />
        </div>
      </div>
    </div>
  );
}