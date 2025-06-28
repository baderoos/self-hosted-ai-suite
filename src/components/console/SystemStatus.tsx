import React from 'react';
import { motion } from 'framer-motion';

interface SystemMetric {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

interface SystemStatusProps {
  metrics: SystemMetric[];
}

export function SystemStatus({ metrics }: SystemStatusProps) {
  return (
    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        System Metrics
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
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
  );
}