import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorVariant, setCursorVariant] = useState('default');

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsHovering(true);
      
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        setCursorVariant('button');
      } else if (target.tagName === 'A' || target.closest('a')) {
        setCursorVariant('link');
      } else if (target.closest('[data-cursor="text"]')) {
        setCursorVariant('text');
      } else {
        setCursorVariant('hover');
      }
    };
    
    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorVariant('default');
    };

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, textarea');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const getCursorSize = () => {
    switch (cursorVariant) {
      case 'button': return { main: 8, trail: 32 };
      case 'link': return { main: 6, trail: 28 };
      case 'text': return { main: 3, trail: 20 };
      default: return { main: 6, trail: 20 };
    }
  };

  const sizes = getCursorSize();

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-50 ${
          cursorVariant === 'text' 
            ? 'bg-primary-500 mix-blend-difference' 
            : 'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg'
        }`}
        animate={{
          x: mousePosition.x - sizes.main,
          y: mousePosition.y - sizes.main,
          width: sizes.main * 2,
          height: sizes.main * 2,
          scale: isClicking ? 0.6 : isHovering ? 1.4 : 1,
          boxShadow: isHovering ? [
            "0 0 20px rgba(99, 102, 241, 0.6)",
            "0 0 40px rgba(99, 102, 241, 0.8)",
            "0 0 20px rgba(99, 102, 241, 0.6)"
          ] : "0 0 0px rgba(99, 102, 241, 0)"
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 30,
          boxShadow: { duration: 1, repeat: isHovering ? Infinity : 0 }
        }}
      />
      
      {/* Trail cursor */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-40 ${
          cursorVariant === 'button' 
            ? 'border-2 border-secondary-400 bg-secondary-100/20' 
            : 'border-2 border-primary-300'
        }`}
        animate={{
          x: mousePosition.x - sizes.trail / 2,
          y: mousePosition.y - sizes.trail / 2,
          width: sizes.trail,
          height: sizes.trail,
          scale: isClicking ? 0.4 : isHovering ? 1.8 : 1,
          opacity: isHovering ? 0.9 : 0.5,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      />
      
      {/* Particle trail for interactions */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 w-2 h-2 bg-gradient-to-r from-accent-400 to-secondary-400 rounded-full pointer-events-none z-30"
          animate={{
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
      
      {/* Additional particles for button interactions */}
      {cursorVariant === 'button' && (
        <>
          <motion.div
            className="fixed top-0 left-0 w-1 h-1 bg-accent-400 rounded-full pointer-events-none z-30"
            animate={{
              x: mousePosition.x + Math.cos(Date.now() * 0.01) * 20,
              y: mousePosition.y + Math.sin(Date.now() * 0.01) * 20,
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="fixed top-0 left-0 w-1 h-1 bg-secondary-400 rounded-full pointer-events-none z-30"
            animate={{
              x: mousePosition.x + Math.cos(Date.now() * 0.015 + Math.PI) * 15,
              y: mousePosition.y + Math.sin(Date.now() * 0.015 + Math.PI) * 15,
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </>
      )}
    </>
  );
}