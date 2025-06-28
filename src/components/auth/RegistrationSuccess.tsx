import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface RegistrationSuccessProps {
  onGoToLogin: () => void;
}

export function RegistrationSuccess({ onGoToLogin }: RegistrationSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-6"
    >
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Registration Successful!
      </h3>
      <p className="text-violet-300 mb-6">
        Your account has been created. You can now sign in.
      </p>
      <motion.button
        onClick={onGoToLogin}
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Go to Login
      </motion.button>
    </motion.div>
  );
}