import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegistrationFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function RegistrationForm({ onSuccess, onBackToLogin }: RegistrationFormProps) {
  const [registrationData, setRegistrationData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, isLoading, clearError } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await register(registrationData.email, registrationData.password, registrationData.fullName);
      onSuccess();
      // Reset form
      setRegistrationData({ fullName: '', email: '', password: '' });
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
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
          onClick={onBackToLogin}
          className="text-violet-300 hover:text-white transition-colors flex items-center space-x-1 mx-auto"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </motion.button>
      </div>
    </motion.form>
  );
}