import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'dynamic';
  theme?: 'default' | 'neural' | 'matrix';
}

export function AnimatedBackground({ 
  children, 
  intensity = 'subtle', 
  theme = 'default' 
}: AnimatedBackgroundProps) {
  // Safe window dimensions with fallbacks
  const getWindowDimensions = () => {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 }; // Default fallback dimensions
    }
    return {
      width: window.innerWidth || 1920,
      height: window.innerHeight || 1080
    };
  };

  const getBackgroundPattern = () => {
    switch (theme) {
      case 'neural':
        return 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)';
      case 'matrix':
        return 'linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px)';
      default:
        return 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)';
    }
  };

  const getParticleCount = () => {
    switch (intensity) {
      case 'dynamic': return 50;
      case 'medium': return 30;
      default: return 20;
    }
  };

  const { width, height } = getWindowDimensions();
  
  return (
    <div className="relative w-full h-full">
      {/* Animated Background Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          background: getBackgroundPattern(),
          backgroundSize: theme === 'matrix' ? '20px 20px' : 'auto',
        }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: getParticleCount() }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-500/30 rounded-full"
              initial={{
                x: Math.random() * width,
                y: Math.random() * height,
              }}
              animate={{
                x: Math.random() * width,
                y: Math.random() * height,
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* Additional Effects for Higher Intensity */}
        {intensity !== 'subtle' && (
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`effect-${i}`}
                className="absolute w-32 h-32 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full blur-xl"
                initial={{
                  x: Math.random() * width,
                  y: Math.random() * height,
                }}
                animate={{
                  x: Math.random() * width,
                  y: Math.random() * height,
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}