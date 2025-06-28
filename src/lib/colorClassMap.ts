// src/lib/colorClassMap.ts

/**
 * Shared Tailwind color class mapping for stat, workflow, and metric color keys.
 * Now includes 'bar' property for progress bars and agent status.
 */
export const colorClassMap: Record<
  string,
  { bg: string; text: string; darkText: string; bar: string }
> = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600",
    darkText: "dark:text-blue-400",
    bar: "bg-blue-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600",
    darkText: "dark:text-green-400",
    bar: "bg-green-500",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600",
    darkText: "dark:text-red-400",
    bar: "bg-red-500",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-600",
    darkText: "dark:text-yellow-400",
    bar: "bg-yellow-500",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600",
    darkText: "dark:text-purple-400",
    bar: "bg-purple-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600",
    darkText: "dark:text-orange-400",
    bar: "bg-orange-500",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600",
    darkText: "dark:text-pink-400",
    bar: "bg-pink-500",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-600",
    darkText: "dark:text-indigo-400",
    bar: "bg-indigo-500",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600",
    darkText: "dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  accent: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600",
    darkText: "dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  primary: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600",
    darkText: "dark:text-blue-400",
    bar: "bg-blue-500",
  },
  secondary: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600",
    darkText: "dark:text-purple-400",
    bar: "bg-purple-500",
  },
  // Add more as needed
};
