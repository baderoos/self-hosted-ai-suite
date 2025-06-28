import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Cloud, 
  UserPlus 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm({ onRegister }: { onRegister: () => void }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <motion.form
      key="login-form"
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-violet-200 mb-3">
          Email
        </label>
        <motion.div 
          className={`relative transition-all duration-300 ${
            focusedField === 'email' ? 'scale-[1.02]' : ''
          }`}
          whileFocus={{ scale: 1.02 }}
        >
          <User size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            focusedField === 'email' ? 'text-rose-400' : 'text-violet-400'
          }`} />
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
            placeholder="Enter your email"
            required
          />
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-rose-500/50 opacity-0 pointer-events-none"
            animate={{
              opacity: focusedField === 'email' ? 1 : 0,
              scale: focusedField === 'email' ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-violet-200 mb-3">
          Password
        </label>
        <motion.div 
          className={`relative transition-all duration-300 ${
            focusedField === 'password' ? 'scale-[1.02]' : ''
          }`}
          whileFocus={{ scale: 1.02 }}
        >
          <Lock size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            focusedField === 'password' ? 'text-rose-400' : 'text-violet-400'
          }`} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-12 pr-14 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
            placeholder="Enter your password"
            required
          />
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-violet-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-rose-500/50 opacity-0 pointer-events-none"
            animate={{
              opacity: focusedField === 'password' ? 1 : 0,
              scale: focusedField === 'password' ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || !credentials.email || !credentials.password}
        className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 relative overflow-hidden group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        {isLoading ? (
          <>
            <motion.div 
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Connecting to Cloud...</span>
          </>
        ) : (
          <>
            <Cloud size={20} />
            <span>Sign In to Cloud</span>
            <motion.div
              className="absolute right-4 text-white"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </>
        )}
      </motion.button>
      
      {/* Register Link */}
      <div className="text-center">
        <motion.button
          type="button"
          onClick={onRegister}
          className="text-violet-300 hover:text-white transition-colors flex items-center space-x-1 mx-auto"
          whileHover={{ x: 3 }}
        >
          <span>Need an account?</span>
          <UserPlus size={16} />
        </motion.button>
      </div>
    </motion.form>
  );
}