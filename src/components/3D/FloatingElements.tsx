import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

export function FloatingElements() {
  const group = useRef<THREE.Group>(null);
  const sphere1 = useRef<THREE.Mesh>(null);
  const sphere2 = useRef<THREE.Mesh>(null);
  const box1 = useRef<THREE.Mesh>(null);
  const torus1 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    
    // Individual element animations
    if (sphere1.current) {
      sphere1.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5 + 1;
      sphere1.current.rotation.x = state.clock.elapsedTime * 0.5;
    }
    
    if (sphere2.current) {
      sphere2.current.position.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.3 + 1.5;
      sphere2.current.rotation.z = state.clock.elapsedTime * 0.7;
    }
    
    if (box1.current) {
      box1.current.rotation.x = state.clock.elapsedTime * 0.4;
      box1.current.rotation.y = state.clock.elapsedTime * 0.6;
    }
    
    if (torus1.current) {
      torus1.current.rotation.x = state.clock.elapsedTime * 0.3;
      torus1.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group ref={group}>
      <Sphere ref={sphere1} position={[-2, 1, 0]} scale={0.3}>
        <meshStandardMaterial 
          color="#14b8a6" 
          transparent 
          opacity={0.7}
          emissive="#14b8a6"
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      <Box ref={box1} position={[2, -1, 1]} scale={0.4}>
        <meshStandardMaterial 
          color="#f97316" 
          transparent 
          opacity={0.8}
          emissive="#f97316"
          emissiveIntensity={0.1}
        />
      </Box>
      
      <Octahedron position={[0, 2, -1]} scale={0.35}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          transparent 
          opacity={0.7}
          emissive="#8b5cf6"
          emissiveIntensity={0.15}
        />
      </Octahedron>
      
      <Sphere ref={sphere2} position={[1.5, 0.5, -2]} scale={0.25}>
        <meshStandardMaterial 
          color="#ec4899" 
          transparent 
          opacity={0.6}
          emissive="#ec4899"
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      <Torus ref={torus1} position={[-1, -1.5, 0]} scale={0.3} args={[0.5, 0.2, 8, 16]}>
        <meshStandardMaterial 
          color="#6366f1" 
          transparent 
          opacity={0.6}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </Torus>
    </group>
  );
}