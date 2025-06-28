import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

interface WorkflowTemplate {
  name: string;
  description: string;
  steps: number;
  avgTime: string;
  icon: React.ElementType;
  color: string;
}

interface SuggestedWorkflowsProps {
  templates: WorkflowTemplate[];
}

export function SuggestedWorkflows({ templates }: SuggestedWorkflowsProps) {
  return (
    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Echo's Suggested Workflows
      </h2>
      <div className="space-y-3">
        {templates.map((template, index) => (
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
  );
}