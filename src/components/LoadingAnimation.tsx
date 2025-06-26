import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
  progress?: number;
}

export function LoadingAnimation({ message = "Processing...", progress = 0 }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Animated Neural Network Visualization */}
      <div className="w-64 h-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg">
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-primary-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-64 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Message */}
      <motion.p
        className="text-neutral-600 dark:text-neutral-400 text-center"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}