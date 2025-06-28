import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint,
  ExternalLink,
  UserPlus,
  Mail,
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 
import { LoginForm as LoginFormContent } from './auth/LoginForm';
import { RegistrationForm } from './auth/RegistrationForm';
import { RegistrationSuccess } from './auth/RegistrationSuccess';
import { DemoCredentials } from './auth/DemoCredentials';
import { CloudFeatures } from './auth/CloudFeatures';

export function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { error, clearError } = useAuth();

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
          {!isRegistering && !registrationSuccess && <CloudFeatures />}
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
              <div className="mb-6">
                <motion.div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl"
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
              </div>
            )}

            <AnimatePresence mode="wait">
              {registrationSuccess ? (
                <RegistrationSuccess 
                  onGoToLogin={() => {
                    setIsRegistering(false);
                    setRegistrationSuccess(false);
                  }}
                />
              ) : isRegistering ? (
                <RegistrationForm 
                  onSuccess={() => setRegistrationSuccess(true)}
                  onBackToLogin={() => {
                    setIsRegistering(false);
                    clearError();
                  }}
                />
              ) : (
                <LoginFormContent 
                  onRegister={() => {
                    setIsRegistering(true);
                    clearError();
                  }}
                />
              )}
            </AnimatePresence>

            {/* Demo Credentials */}
            {!isRegistering && !registrationSuccess && <DemoCredentials />}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}