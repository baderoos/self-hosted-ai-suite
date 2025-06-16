import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Hash,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  CornerDownLeft
} from 'lucide-react';

export interface CommandAction {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: any;
  keywords: string[];
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandAction[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const { echoState } = useNexus();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on query
  const filteredCommands = query.trim() === '' 
    ? commands.slice(0, 8) // Show first 8 commands when no query
    : commands.filter(command => {
        const searchText = query.toLowerCase();
        return (
          command.name.toLowerCase().includes(searchText) ||
          command.description?.toLowerCase().includes(searchText) ||
          command.category.toLowerCase().includes(searchText) ||
          command.keywords.some(keyword => keyword.toLowerCase().includes(searchText))
        );
      }).slice(0, 8);

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, CommandAction[]>);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const executeCommand = useCallback((command: CommandAction) => {
    // Add to recent commands
    setRecentCommands(prev => {
      const filtered = prev.filter(id => id !== command.id);
      return [command.id, ...filtered].slice(0, 5);
    });

    // Execute the command
    command.action();
    
    // Close palette
    onClose();
    setQuery('');
    setSelectedIndex(0);
  }, [onClose]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return Hash;
      case 'actions': return Zap;
      case 'recent': return Clock;
      case 'ai': return Sparkles;
      default: return Command;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return 'text-cyan-400';
      case 'actions': return 'text-purple-400';
      case 'recent': return 'text-yellow-400';
      case 'ai': return 'text-pink-400';
      default: return 'text-neutral-400';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Command Palette */}
        <motion.div
          className="relative w-full max-w-2xl bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          style={{
            boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-neutral-700/50 bg-neutral-800/50">
            <div className="flex items-center space-x-3 flex-1">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(99, 102, 241, 0.4)",
                    "0 0 0 8px rgba(99, 102, 241, 0)",
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Search size={20} className="text-cyan-400" />
              </motion.div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Echo anything..."
                className="flex-1 bg-transparent text-white placeholder-neutral-400 text-lg focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="flex items-center space-x-2 text-neutral-500">
              <kbd className="px-2 py-1 bg-neutral-800 border border-neutral-600 rounded text-xs font-mono">
                ESC
              </kbd>
              <span className="text-xs">to close</span>
            </div>
          </div>

          {/* Echo AI Suggestions */}
          {query.length > 0 && echoState.insights.length > 0 && (
            <div className="px-6 py-3 border-b border-neutral-700/50 bg-indigo-900/20">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Echo AI Suggestions
                </span>
              </div>
              <div className="space-y-1">
                {echoState.insights.slice(0, 2).map((insight, index) => (
                  <motion.div
                    key={index}
                    className="px-3 py-2 rounded-lg bg-indigo-800/20 hover:bg-indigo-800/30 cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="text-sm text-indigo-200">{insight.title}</div>
                    <div className="text-xs text-indigo-400">{insight.description.substring(0, 60)}...</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Command List */}
          <div 
            ref={listRef}
            className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600"
          >
            {filteredCommands.length === 0 ? (
              <motion.div 
                className="px-6 py-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-neutral-500" />
                </div>
                <p className="text-neutral-400 text-lg font-medium mb-2">No commands found</p>
                <p className="text-neutral-500 text-sm">
                  Try searching for "dashboard", "generate", or "settings"
                </p>
              </motion.div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedCommands).map(([category, categoryCommands], categoryIndex) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="px-6 py-2 flex items-center space-x-2">
                      {React.createElement(getCategoryIcon(category), {
                        size: 14,
                        className: getCategoryColor(category)
                      })}
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        {category}
                      </span>
                    </div>

                    {/* Category Commands */}
                    {categoryCommands.map((command, commandIndex) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <motion.div
                          key={command.id}
                          className={`mx-2 mb-1 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30' 
                              : 'hover:bg-neutral-800/50'
                          }`}
                          onClick={() => executeCommand(command)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: categoryIndex * 0.05 + commandIndex * 0.02 }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {command.icon && (
                                <div className={`p-2 rounded-lg ${
                                  isSelected 
                                    ? 'bg-cyan-400/20 text-cyan-300' 
                                    : 'bg-neutral-700/50 text-neutral-400'
                                }`}>
                                  <command.icon size={16} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${
                                  isSelected ? 'text-white' : 'text-neutral-200'
                                }`}>
                                  {command.name}
                                </div>
                                {command.description && (
                                  <div className={`text-sm truncate ${
                                    isSelected ? 'text-neutral-300' : 'text-neutral-400'
                                  }`}>
                                    {command.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {command.shortcut && (
                                <kbd className={`px-2 py-1 rounded text-xs font-mono border ${
                                  isSelected 
                                    ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-300' 
                                    : 'bg-neutral-800 border-neutral-600 text-neutral-400'
                                }`}>
                                  {command.shortcut}
                                </kbd>
                              )}
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center space-x-1 text-cyan-400"
                                >
                                  <CornerDownLeft size={14} />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-neutral-700/50 bg-neutral-800/30">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded font-mono">
                    ↑↓
                  </kbd>
                  <span>navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded font-mono">
                    ↵
                  </kbd>
                  <span>select</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <motion.span 
                  className="text-indigo-400 font-semibold"
                  animate={{ 
                    textShadow: [
                      "0 0 0px currentColor",
                      "0 0 8px currentColor",
                      "0 0 0px currentColor"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Echo
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}