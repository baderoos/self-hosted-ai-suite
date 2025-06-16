import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ParticleField } from './3D/ParticleField';
import { FloatingElements } from './3D/FloatingElements';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'dynamic';
  theme?: 'default' | 'neural' | 'matrix';
}

export function AnimatedBackground({ children, intensity = 'subtle', theme = 'default' }: AnimatedBackgroundProps) {
  const getParticleCount = () => {
    switch (intensity) {
      case 'subtle': return 2000;
      case 'medium': return 3500;
      case 'dynamic': return 5000;
      default: return 2000;
    }
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

  return (
    <div className="relative w-full h-full">
      {/* Enhanced Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
        style={{
          backgroundImage: getBackgroundPattern(),
          backgroundSize: theme === 'matrix' ? '20px 20px' : '100% 100%',
        }}
      />
      
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#14b8a6" />
            
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