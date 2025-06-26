import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
  Fingerprint,
  ExternalLink,
  UserPlus,
  Mail,
  ArrowLeft
import { useAuth } from '../hooks/useAuth'; 

export function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [registrationData, setRegistrationData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { login, register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await register(registrationData.email, registrationData.password, registrationData.fullName);
      setRegistrationSuccess(true);
      // Reset form
      setRegistrationData({ fullName: '', email: '', password: '' });
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const fillDemoCredentials = (type: 'director' | 'operator') => {
    setCredentials({
      email: type === 'director' ? 'director@example.com' : 'operator@example.com',
      password: 'secret'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
        
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
            className="text-4xl font-bold mb-2 text-white"
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
            {isRegistering ? 'Create your account to get started' : 'Your all-in-one creative and strategic operations platform'}
          </p>
          
          {/* Cloud features */}
          {!isRegistering && !registrationSuccess && (
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
          )}
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
              <motion.div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          layout>
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">
                    <div className="text-red-200">{error}</div>
                    {error.includes('Supabase not configured') && (
                      <div className="mt-2 text-xs text-red-300">
                        Please configure Supabase by clicking "Connect to Supabase" in the top right corner.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              <div className="flex justify-center mt-4">
                <a 
                  href="https://supabase.com/dashboard/project/fpsqwsticysljkidpxos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Go to Supabase Dashboard</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            <AnimatePresence mode="wait">
              {registrationSuccess ? (
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
                    onClick={() => {
                      setIsRegistering(false);
                      setRegistrationSuccess(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Go to Login
                  </motion.button>
                </motion.div>
              ) : isRegistering ? (
                <motion.form
                  key="register-form"
                  onSubmit={handleRegister}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Full Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-violet-200 mb-3">
                      Full Name
                    </label>
                    <motion.div 
                      className={`relative transition-all duration-300 ${
                        focusedField === 'fullName' ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <User size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'fullName' ? 'text-rose-400' : 'text-violet-400'
                      }`} />
                      <input
                        type="text"
                        value={registrationData.fullName}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your full name"
                        required
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-rose-500/50 opacity-0 pointer-events-none"
                        animate={{
                          opacity: focusedField === 'fullName' ? 1 : 0,
                          scale: focusedField === 'fullName' ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-violet-200 mb-3">
                      Email
                    </label>
                    <motion.div 
                      className={`relative transition-all duration-300 ${
                        focusedField === 'registerEmail' ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <Mail size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'registerEmail' ? 'text-rose-400' : 'text-violet-400'
                      }`} />
                      <input
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                        onFocus={() => setFocusedField('registerEmail')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your email"
                        required
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-rose-500/50 opacity-0 pointer-events-none"
                        animate={{
                          opacity: focusedField === 'registerEmail' ? 1 : 0,
                          scale: focusedField === 'registerEmail' ? 1 : 0.95,
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
                        focusedField === 'registerPassword' ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <Lock size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'registerPassword' ? 'text-rose-400' : 'text-violet-400'
                      }`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                        onFocus={() => setFocusedField('registerPassword')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-14 py-4 bg-white/5 border border-rose-500/20 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Create a password (min. 6 characters)"
                        required
                        minLength={6}
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
                          opacity: focusedField === 'registerPassword' ? 1 : 0,
                          scale: focusedField === 'registerPassword' ? 1 : 0.95,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>

                  {/* Register Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !registrationData.email || !registrationData.password || !registrationData.fullName}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 relative overflow-hidden"
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>
                  
                  {/* Back to Login */}
                  <div className="text-center">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        clearError();
                      }}
                      className="text-violet-300 hover:text-white transition-colors flex items-center space-x-1 mx-auto"
                      whileHover={{ x: -3 }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Login</span>
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
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
                      onClick={() => {
                        setIsRegistering(true);
                        clearError();
                      }}
                      className="text-violet-300 hover:text-white transition-colors flex items-center space-x-1 mx-auto"
                      whileHover={{ x: 3 }}
                    >
                      <span>Need an account?</span>
                      <UserPlus size={16} />
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Demo Credentials */}
            {!isRegistering && !registrationSuccess && (
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
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}