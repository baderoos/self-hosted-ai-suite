import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Shield, 
  User, 
  Cloud 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function DemoCredentials() {
  const { login } = useAuth();
  
  const fillDemoCredentials = (type: 'director' | 'operator') => {
    const credentials = {
      email: type === 'director' ? 'director@example.com' : 'operator@example.com',
      password: 'secret'
    };
    
    // Automatically log in with the demo credentials
    login(credentials);
  };

  return (
    <motion.div 
      className="mt-8 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <div className="text-center">
        <h3 className="text-sm font-semibold text-cyan-300 mb-4 flex items-center justify-center space-x-2">
          <Sparkles size={16} />
          <span>Demo Accounts</span>
          <Sparkles size={16} />
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {[
          { type: 'director' as const, label: 'Director', icon: Shield, color: 'from-emerald-600 to-teal-700' },
          { type: 'operator' as const, label: 'Creator', icon: User, color: 'from-indigo-600 to-blue-700' }
        ].map((demo) => (
          <motion.button
            key={demo.type}
            onClick={() => fillDemoCredentials(demo.type)}
            className={`p-3 bg-gradient-to-r ${demo.color} rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 group`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <demo.icon size={16} />
            <span>{demo.label}</span>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={12} />
            </motion.div>
          </motion.button>
        ))}
      </div>
      
      <div className="text-xs text-cyan-200/70 text-center space-y-1 bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
        <p><strong>Director:</strong> director@example.com</p>
        <p><strong>Creator:</strong> operator@example.com</p>
        <p className="text-cyan-300/50 mt-2">Password: <code className="bg-cyan-900/30 px-1 rounded">secret</code></p>
      </div>

      {/* Cloud Benefits */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 border border-purple-500/20">
        <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center space-x-2">
          <Cloud size={14} />
          <span>Cloud Benefits</span>
        </h4>
        <ul className="text-xs text-purple-200/80 space-y-1">
          <li>• No local setup required</li>
          <li>• Instant access from anywhere</li>
          <li>• Automatic updates & scaling</li>
          <li>• Enterprise-grade security</li>
        </ul>
      </div>
    </motion.div>
  );
}