import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => {
    const nodePositions = [];
    const layers = 4;
    const nodesPerLayer = 6;
    
    for (let layer = 0; layer < layers; layer++) {
      for (let node = 0; node < nodesPerLayer; node++) {
        nodePositions.push([
          (layer - layers / 2) * 2,
          (node - nodesPerLayer / 2) * 0.8,
          0
        ]);
      }
    }
    
    return nodePositions;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    const layers = 4;
    const nodesPerLayer = 6;
    
    for (let layer = 0; layer < layers - 1; layer++) {
      for (let node = 0; node < nodesPerLayer; node++) {
        for (let nextNode = 0; nextNode < nodesPerLayer; nextNode++) {
          if (Math.random() > 0.3) { // Random connections
            const start = nodes[layer * nodesPerLayer + node];
            const end = nodes[(layer + 1) * nodesPerLayer + nextNode];
            lines.push([start, end]);
          }
        }
      }
    }
    
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={0.5}>
      {/* Nodes */}
      {nodes.map((position, index) => (
        <Sphere key={index} position={position as [number, number, number]} scale={0.1}>
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#6366f1" 
            emissiveIntensity={0.2}
          />
        </Sphere>
      ))}
      
      {/* Connections */}
      {connections.map((line, index) => (
        <Line
          key={index}
          points={line}
          color="#14b8a6"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  );
}