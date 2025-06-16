import React from 'react';
import { motion } from 'framer-motion';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface MobileNavProps {
  navigation: NavigationItem[];
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function MobileNav({ navigation, currentView, setCurrentView }: MobileNavProps) {
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-700/50 lg:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navigation.slice(0, 6).map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              currentView === item.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <item.icon size={18} />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}