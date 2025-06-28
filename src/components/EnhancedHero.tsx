import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Eye, Mic, Video, Share2, Zap, ArrowRight, Play, Sparkles, Store, BarChart3 } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load components
const AnimatedBackground = lazy(() => import('./AnimatedBackground').then(module => ({ default: module.AnimatedBackground })));
const AnimatedCard = lazy(() => import('./AnimatedCard').then(module => ({ default: module.AnimatedCard })));

export function EnhancedHero() {
  const features = [
    {
      icon: Brain,
      title: 'Master Control Program',
      description: 'Central AI intelligence that coordinates all specialized agents and workflows',
      color: 'from-primary-500 to-primary-600',
      delay: 0.1,
      stats: '2.8K directives executed'
    },
    {
      icon: Video,
      title: 'Multi-Camera Production',
      description: 'Intelligent multi-cam sync, live-switching, and automated angle selection',
      color: 'from-secondary-500 to-secondary-600',
      delay: 0.2,
      stats: '156 hours processed'
    },
    {
      icon: Brain,
      title: 'Transcriber AI Agent',
      description: 'Advanced speech-to-text with speaker identification and timing precision',
      color: 'from-accent-500 to-accent-600',
      delay: 0.3,
      stats: '99.2% accuracy rate'
    },
    {
      icon: Eye,
      title: 'Vision AI Agent',
      description: 'Intelligent scene analysis, object detection, and visual content understanding',
      color: 'from-purple-500 to-purple-600',
      delay: 0.4,
      stats: '1.2M objects detected'
    },
    {
      icon: Mic,
      title: 'Audio AI Agent',
      description: 'Professional audio cleanup, enhancement, and intelligent mixing',
      color: 'from-pink-500 to-pink-600',
      delay: 0.5,
      stats: '89 projects enhanced'
    },
    {
      icon: Share2,
      title: 'Social Clip AI Agent',
      description: 'Automated viral moment detection and platform-optimized content creation',
      color: 'from-yellow-500 to-yellow-600',
      delay: 0.6,
      stats: '1.8K clips generated'
    }
  ];

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <AnimatedBackground intensity="dynamic" theme="neural">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <motion.h1 
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <span className="block text-neutral-900 dark:text-white mb-2">
                Nexus
              </span>
              <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent bg-[length:200%_100%]">
                The All-in-One Creative Platform
              </span>
            </motion.h1>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed">
                Create. Automate. Analyze. All in One Place.
              </p>
              <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-3xl mx-auto">
                Powered by Echo AI, your personal creative assistant that learns your style and orchestrates
                specialized agents for content creation, strategy, and analytics.
              </p>
            </motion.div>
          </motion.div>

          {/* Live Stats Bar */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 py-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {[
              { label: 'Echo AI Accuracy', value: '98.7%', color: 'text-indigo-400' },
              { label: 'AI Agents Available', value: '12', color: 'text-blue-400' },
              { label: 'Marketplace Items', value: '250+', color: 'text-emerald-400' },
              { label: 'Projects Completed', value: '15.2K', color: 'text-pink-400' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              >
                <motion.div 
                  className={`text-2xl font-bold ${stat.color}`}
                  animate={{ 
                    textShadow: [
                      "0 0 0px currentColor",
                      "0 0 10px currentColor",
                      "0 0 0px currentColor"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <React.Suspense key={index} fallback={
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl overflow-hidden animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-700 mb-4"></div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-1 w-full"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-1 w-5/6"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-4/6"></div>
                </div>
              }>
                <AnimatedCard
                  delay={feature.delay}
                  className="group relative p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl overflow-hidden"
                >
                  {/* Animated background glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    initial={false}
                  />
                  
                  {/* Floating particles on hover */}
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-60"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                  
                  <motion.div 
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    <feature.icon size={24} className="text-white" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Stats */}
                  <motion.div 
                    className="mt-4 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: feature.delay + 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {feature.stats}
                      </span>
                      <motion.div
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      />
                    </div>
                  </motion.div>
                </AnimatedCard>
              </React.Suspense>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button 
              onClick={() => window.location.hash = '#marketplace'}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(99, 102, 241, 0.3)",
                  "0 0 40px rgba(99, 102, 241, 0.6)",
                  "0 0 20px rgba(99, 102, 241, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative flex items-center space-x-2">
                <span>Explore Marketplace</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </span>
            </motion.button>
            
            <motion.button 
              className="group px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold rounded-2xl backdrop-blur-sm relative"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center space-x-2">
                <Sparkles size={16} />
                <span>Meet Echo AI</span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
      </AnimatedBackground>
    </Suspense>
  );
}