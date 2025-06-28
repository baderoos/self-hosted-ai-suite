import React from "react";
import { motion } from "framer-motion";
import { colorClassMap } from "../../lib/colorClassMap";

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="group p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`p-3 rounded-xl ${
                colorClassMap[stat.color]?.bg ||
                "bg-neutral-100 dark:bg-neutral-900/30"
              }`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon
                size={24}
                className={`${
                  colorClassMap[stat.color]?.text || "text-neutral-600"
                } ${
                  colorClassMap[stat.color]?.darkText || "dark:text-neutral-400"
                }`}
              />
            </motion.div>
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {stat.change}
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {stat.label}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {stat.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
