import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { colorClassMap } from '../../lib/colorClassMap';

interface AIAgent {
  name: string;
  icon: React.ElementType;
  status: 'ready' | 'busy' | 'offline' | 'processing';
  color: string;
  load: number;
  tasks: number;
}

interface AIAgentStatusProps {
  agents: AIAgent[];
  getAgentStatusColor: (status: string) => string;
}

export function AIAgentStatus({ agents, getAgentStatusColor }: AIAgentStatusProps) {
  return (
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
          {agents.map((agent, index) => (
            <motion.div 
              key={agent.name} 
              className="p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-700/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colorClassMap[agent.color]?.bg || 'bg-neutral-100 dark:bg-neutral-900/30'}`}>
                    <agent.icon size={16} className={`${colorClassMap[agent.color]?.text || 'text-neutral-600 dark:text-neutral-400'}`} />
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
                  className={`h-1 rounded-full ${colorClassMap[agent.color]?.bar || 'bg-neutral-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.load}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}