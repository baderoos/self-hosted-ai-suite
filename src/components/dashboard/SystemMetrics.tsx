import React from "react";
import { motion } from "framer-motion";

interface Metric {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}

interface SystemMetricsProps {
  echoMetrics: Metric[];
  systemMetrics: Metric[];
}

// Update colorMap to include both text and bg classes
const colorMap: Record<string, { text: string; bg: string }> = {
  blue: { text: "text-blue-500", bg: "bg-blue-500" },
  green: { text: "text-green-500", bg: "bg-green-500" },
  red: { text: "text-red-500", bg: "bg-red-500" },
  yellow: { text: "text-yellow-500", bg: "bg-yellow-500" },
  purple: { text: "text-purple-500", bg: "bg-purple-500" },
  orange: { text: "text-orange-500", bg: "bg-orange-500" },
  gray: { text: "text-gray-500", bg: "bg-gray-500" },
  // Add more as needed
};

export function SystemMetrics({
  echoMetrics,
  systemMetrics,
}: SystemMetricsProps) {
  // Combine and limit to 4 metrics
  const combinedMetrics = [...echoMetrics, ...systemMetrics].slice(0, 4);

  return (
    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Echo AI Performance
      </h2>
      <div className="space-y-4">
        {combinedMetrics.map((metric, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <metric.icon size={16} className={colorMap[metric.color]?.text || "text-gray-500"} />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {metric.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                <motion.div
                  className={`h-2 ${colorMap[metric.color]?.bg || "bg-gray-500"} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                />
              </div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white min-w-[40px]">
                {metric.value}
                {metric.unit}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
