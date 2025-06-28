import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface CommandInputProps {
  command: string;
  setCommand: (command: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isOnline: boolean;
}

export function CommandInput({ command, setCommand, onSubmit, isLoading, isOnline }: CommandInputProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-neutral-700 bg-neutral-800/30">
      <div className="flex items-center space-x-3">
        <span className="text-primary-400 font-mono font-bold">{'MCP>'}</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter your creative directive for the Master Control Program..."
          disabled={isLoading || !isOnline}
          className="flex-1 bg-transparent text-neutral-300 placeholder-neutral-500 focus:outline-none font-mono text-sm disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={!command.trim() || isLoading || !isOnline}
          className="p-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </form>
  );
}