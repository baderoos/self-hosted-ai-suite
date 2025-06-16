import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { NeuralNetwork } from './3D/NeuralNetwork';

interface LoadingAnimationProps {
  message?: string;
  progress?: number;
}

export function LoadingAnimation({ message = "Processing...", progress = 0 }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* 3D Neural Network */}
      <div className="w-64 h-32">
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <NeuralNetwork />
          </Suspense>
        </Canvas>
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