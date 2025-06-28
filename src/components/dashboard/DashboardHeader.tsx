import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function DashboardHeader({ timeRange, onTimeRangeChange }: DashboardHeaderProps) {
  return (
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
            onChange={(e) => onTimeRangeChange(e.target.value)}
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
  );
}