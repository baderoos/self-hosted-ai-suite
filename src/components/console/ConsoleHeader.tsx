import React from "react";
import { motion } from "framer-motion";
import { Terminal, Cloud, AlertTriangle, X } from "lucide-react";

interface ConsoleHeaderProps {
  isOnline: boolean;
  error: string | null;
  onClearError: () => void;
}

export function ConsoleHeader({
  isOnline,
  error,
  onClearError,
}: ConsoleHeaderProps) {
  return (
    <>
      {/* Connection Status */}
      {!isOnline && (
        <motion.div
          className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <Cloud size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Connecting to MCP Cloud Service... Please check your internet
              connection.
            </span>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle
                size={20}
                className="text-red-600 dark:text-red-400"
              />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              aria-label="Clear error message"
              type="button"
            >
              <X size={16} />
            </button>{" "}
          </div>
        </motion.div>
      )}

      {/* MCP Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center space-x-3 mb-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center"
            animate={{
              boxShadow: isOnline
                ? [
                    "0 0 20px rgba(79, 70, 229, 0.5)",
                    "0 0 40px rgba(79, 70, 229, 0.8)",
                    "0 0 20px rgba(79, 70, 229, 0.5)",
                  ]
                : ["0 0 20px rgba(239, 68, 68, 0.5)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Echo Command Console
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Advanced Natural Language Command Interface
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-500" : "bg-blue-500"
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span
                className={`text-xs font-medium ${
                  isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {isOnline ? "ECHO CONNECTED" : "CONNECTING..."}
              </span>
            </div>
          </div>
        </div>
        <motion.p
          className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to the Echo Command Console. Issue natural language directives
          to your AI assistant. Echo will learn from your interactions and
          intelligently orchestrate your creative workflows.
        </motion.p>
      </motion.div>
    </>
  );
}
