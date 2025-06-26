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
  
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <Canvas>
          <Suspense fallback={null}>
            <ParticleField count={getParticleCount()} />
            {intensity !== 'subtle' && <FloatingElements />}
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate
              autoRotateSpeed={intensity === 'dynamic' ? 1 : 0.5}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}