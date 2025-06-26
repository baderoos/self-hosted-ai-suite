import React from 'react';

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  color?: string;
  speed?: number;
}

export function ParticleField({
  count = 5000,
  radius = 1.2,
  color = "#6366f1",
  speed = 1
}: ParticleFieldProps) {
  // Simplified version without Three.js dependencies
  return <div className="hidden">Particle Field (disabled for performance)</div>;
}