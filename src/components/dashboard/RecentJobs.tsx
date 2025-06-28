import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  type: string;
  status: string;
  title: string;
  time: string;
  duration: string;
  agent: string;
  progress?: number;
}

interface RecentJobsProps {
  jobs: Job[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  return (
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
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-700/50 transition-colors group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ x: 10 }}
            >
              <div className="flex-shrink-0">                {job.status === 'completed' && (
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
+               {!['completed', 'processing', 'scheduled'].includes(job.status) && (
+                 <AlertCircle size={24} className="text-gray-500" />
+               )}
              </div>              </div>
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  ${job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                  ${job.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                  ${job.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  ${!['completed', 'processing', 'scheduled'].includes(job.status) ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' : ''}
                `}>                  ${job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
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
  );
}