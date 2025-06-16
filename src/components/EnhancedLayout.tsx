import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, Zap, Activity } from 'lucide-react';
import { CustomCursor } from './CustomCursor';
import { useNexus } from '../core/NexusContext';
import { CommandPalette, CommandAction } from './CommandPalette';
import { useSystemStatus } from '../hooks/useSystemStatus';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  commands?: CommandAction[];
  onNavigate?: (view: string) => void;
}

export function EnhancedLayout({ children, commands = [], onNavigate }: EnhancedLayoutProps) {
  const { echoState } = useNexus();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mcpStatus, setMcpStatus] = useState('online');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isOnline } = useSystemStatus();

  useEffect(() => {
    setMounted(true);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-8"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Zap size={32} className="text-white" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Master Control Program
          </motion.h1>
          <motion.p 
            className="text-neutral-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Initializing AI Director's Console...
          </motion.p>
          <motion.div 
            className="mt-8 flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 transition-all duration-500">
      <CustomCursor />
      
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white font-bold text-sm">AI</span>
                </motion.div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  ContentSuite
                </span>
              </div>
            </motion.div>
            
            {/* Command Palette Trigger */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Orchestrate anything...
                </span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    ⌘K
                  </kbd>
                </div>
              </motion.button>
            </div>

            {/* MCP Status Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.div 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                  isOnline 
                    ? 'bg-indigo-100/50 dark:bg-indigo-900/30' 
                    : 'bg-red-100/50 dark:bg-red-900/30'
                }`}
                animate={{ 
                  boxShadow: [
                    `0 0 0 0 rgba(${isOnline ? '99, 102, 241' : '239, 68, 68'}, 0.4)`,
                    `0 0 0 10px rgba(${isOnline ? '99, 102, 241' : '239, 68, 68'}, 0)`,
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-indigo-500' : 'bg-red-500'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className={`text-xs font-medium ${
                  isOnline 
                    ? 'text-indigo-700 dark:text-indigo-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  ECHO {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </motion.div>
            </div>
            
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <motion.div 
                className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 shadow-xl"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="font-semibold">Navigation</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
        
        {/* Echo AI Status Indicator */}
        {echoState.isLearning && (
          <motion.div 
            className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600/90 text-white rounded-full shadow-lg flex items-center space-x-2 z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-3 h-3 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-medium">Echo is learning...</span>
          </motion.div>
        )}
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}