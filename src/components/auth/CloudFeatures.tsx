import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Globe, Key } from 'lucide-react';

export function CloudFeatures() {
  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      {[
        { icon: Cloud, label: 'Cloud-Powered', color: 'text-cyan-400' },
        { icon: Globe, label: 'Global Access', color: 'text-emerald-400' },
        { icon: Key, label: 'Two-Factor Auth', color: 'text-amber-400' }
      ].map((item, index) => (
        <motion.div
          key={item.label}
          className="flex items-center space-x-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          <item.icon size={14} className={item.color} />
          <span className="text-xs text-violet-400">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}