import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  progress: number;
  task_id: string;
}

interface Task {
  task_id: string;
  status: string;
}

interface ConsoleLogProps {
  logs: LogEntry[];
  isLoading: boolean;
  tasks: Task[];
  getLogIcon: (type: string) => React.ElementType;
  getLogColor: (type: string) => string;
  onCancelTask: (taskId: string) => void;
  logEndRef: React.RefObject<HTMLDivElement>;
}

export function ConsoleLog({
  logs,
  isLoading,
  tasks,
  getLogIcon,
  getLogColor,
  onCancelTask,
  logEndRef,
}: ConsoleLogProps) {
  // Map progress bar colors to static Tailwind classes
  const progressBarClass = "h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full";

  return (
    <div className="bg-neutral-900 dark:bg-neutral-950 rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
        <div className="flex items-center space-x-3">
          <Terminal size={16} className="text-emerald-400" />
          <span className="text-emerald-400 font-mono text-sm font-semibold">
            MCP Terminal v2.1
          </span>
          {tasks.some((task) => task.status === "processing") && (
            <motion.span
              className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              PROCESSING
            </motion.span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      {/* Console Log */}
      <div className="h-96 overflow-y-auto p-4 font-mono text-sm bg-neutral-900/50">
        <AnimatePresence>
          {logs.map((log) => {
            const LogIcon = getLogIcon(log.type);
            const associatedTask = tasks.find((task) => task.task_id === log.task_id);
            return (
              <motion.div
                key={log.id}
                className="flex items-start space-x-3 mb-3 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-neutral-500 text-xs mt-1 min-w-[60px]">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <LogIcon
                  size={14}
                  className={`mt-0.5 ${getLogColor(
                    log.type
                  )} group-hover:scale-110 transition-transform`}
                />
                <div className="flex-1">
                  <span className="text-neutral-300">{log.message}</span>
                  {log.progress > 0 && log.progress < 100 && (
                    <div className="mt-2 w-full bg-neutral-700 rounded-full h-1">
                      <motion.div
                        className={progressBarClass}
                        initial={{ width: 0 }}
                        animate={{ width: `${log.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </div>
                {associatedTask?.status === "processing" && (
                  <button
                    onClick={() => onCancelTask(log.task_id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <X size={12} />
                  </button>
                )}{" "}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex items-center space-x-2 text-accent-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
            <span>MCP processing directive...</span>
          </motion.div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
