import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  glowEffect?: boolean;
  tiltEffect?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  direction = 'up',
  glowEffect = false,
  tiltEffect = true
}: AnimatedCardProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 50, opacity: 0 };
      case 'down': return { y: -50, opacity: 0 };
      case 'left': return { x: -50, opacity: 0 };
      case 'right': return { x: 50, opacity: 0 };
      default: return { y: 50, opacity: 0 };
    }
  };

  const getHoverAnimation = () => {
    if (!hover) return {};
    
    const baseAnimation = {
      scale: 1.02,
      y: -8,
      transition: { duration: 0.3, type: "spring", stiffness: 300 }
    };
    
    if (tiltEffect) {
      return {
        ...baseAnimation,
        rotateX: 5,
        rotateY: 5,
      };
    }
    
    return baseAnimation;
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={getHoverAnimation()}
      className={`${className} ${tiltEffect ? 'transform-gpu' : ''}`}
      style={tiltEffect ? { 
        transformStyle: 'preserve-3d',
        perspective: 1000 
      } : {}}
    >
      <motion.div
        className="relative w-full h-full"
        whileHover={glowEffect ? {
          boxShadow: [
            "0 0 0 0 rgba(99, 102, 241, 0)",
            "0 0 30px 0 rgba(99, 102, 241, 0.3)",
            "0 0 0 0 rgba(99, 102, 241, 0)"
          ]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AnimatedCard);