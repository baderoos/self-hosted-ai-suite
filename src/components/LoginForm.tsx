import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle, Sparkles, Shield, Zap, Cloud, Globe, Fingerprint } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const fillDemoCredentials = (type: 'director' | 'operator') => {
    setCredentials({
      username: type,
      password: 'secret'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-rose-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="relative w-24 h-24 mx-auto mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl"
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
            <motion.div
              className="absolute inset-1 bg-violet-950 rounded-3xl flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(99, 102, 241, 0.5)",
                  "0 0 40px rgba(99, 102, 241, 0.8)",
                  "0 0 20px rgba(99, 102, 241, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={32} className="text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold mb-2"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_100%]">
              Nexus Platform
            </span>
          </motion.h1>
          <p className="text-violet-300 text-lg">
            Your all-in-one creative and strategic operations platform
          </p>
          
          {/* Cloud features */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {[
              { icon: Cloud, label: 'Cloud-Powered', color: 'text-cyan-400' },
              { icon: Globe, label: 'Global Access', color: 'text-emerald-400' },
              { icon: Fingerprint, label: 'Two-Factor Auth', color: 'text-amber-400' }
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
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Glass morphism container */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-rose-500/20 shadow-2xl" />
          <div className="relative p-8">
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">
                    <div className="text-red-200">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-violet-200 mb-3">
                  Username
                </label>
                <motion.div 
                  className={`relative transition-all duration-300 ${
                    focusedField === 'username' ? 'scale-[1.02]' : ''
                  }`}
                  whileFocus={{ scale: 1.02 }}
                >
                  <User size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'username' ? 'text-rose-400' : 'text-violet-400'
                  }`} />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your username"
                    required
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-rose-500/50 opacity-0 pointer-events-none"
                    animate={{
                      opacity: focusedField === 'username' ? 1 : 0,
                      scale: focusedField === 'username' ? 1 : 0.95,
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
                disabled={isLoading || !credentials.username || !credentials.password}
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
            </form>

            {/* Demo Credentials */}
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
                <p><strong>Director:</strong> Enterprise tier with all features</p>
                <p><strong>Creator:</strong> Standard tier with core features</p>
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}