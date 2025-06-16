import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus, useEchoTracking } from '../../core/NexusContext';
import { apiLayer, SocialMetrics, ContentPerformance, CompetitorData } from '../../services/APILayer';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Sparkles
} from 'lucide-react';

export function Analytics() {
  const [metrics, setMetrics] = useState<SocialMetrics[]>([]);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['YouTube', 'Instagram', 'TikTok']);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const [activeTab, setActiveTab] = useState('overview');

  const { getPersonalizedSuggestions } = useNexus();
  const { track } = useEchoTracking('analytics');

  const platforms = [
    { id: 'YouTube', name: 'YouTube', color: 'red', icon: '📺' },
    { id: 'Instagram', name: 'Instagram', color: 'pink', icon: '📷' },
    { id: 'TikTok', name: 'TikTok', color: 'purple', icon: '🎵' },
    { id: 'Twitter', name: 'Twitter', color: 'blue', icon: '🐦' },
    { id: 'LinkedIn', name: 'LinkedIn', color: 'blue', icon: '💼' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'content', name: 'Content Performance', icon: TrendingUp },
    { id: 'competitors', name: 'Competitor Analysis', icon: Target },
    { id: 'insights', name: 'AI Insights', icon: Sparkles }
  ];

  useEffect(() => {
    loadAnalyticsData();
    track('view_analytics', { platforms: selectedPlatforms, dateRange });
  }, [selectedPlatforms, dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, contentData, competitorAnalysis] = await Promise.all([
        apiLayer.getSocialMetrics(selectedPlatforms, dateRange),
        apiLayer.getContentPerformance(dateRange),
        apiLayer.getCompetitorData(['Competitor A', 'Competitor B', 'Competitor C'])
      ]);

      setMetrics(metricsData);
      setContentPerformance(contentData);
      setCompetitorData(competitorAnalysis);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalMetrics = () => {
    return metrics.reduce((total, metric) => ({
      followers: total.followers + metric.followers,
      engagement: total.engagement + metric.engagement.likes + metric.engagement.comments + metric.engagement.shares,
      reach: total.reach + metric.reach,
      impressions: total.impressions + metric.impressions
    }), { followers: 0, engagement: 0, reach: 0, impressions: 0 });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentColor = (sentiment: { positive: number; neutral: number; negative: number }) => {
    if (sentiment.positive > 70) return 'text-emerald-500';
    if (sentiment.positive > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const suggestions = getPersonalizedSuggestions('analytics');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 40px rgba(59, 130, 246, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BarChart3 size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Strategic Analytics & Social Listening
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Deep insights into your social media performance and competitor analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* Echo AI Insights */}
      {suggestions.length > 0 && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Echo's Analytics Insights
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {suggestion.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div 
        className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Platform Selection */}
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => {
                  const newPlatforms = selectedPlatforms.includes(platform.id)
                    ? selectedPlatforms.filter(p => p !== platform.id)
                    : [...selectedPlatforms, platform.id];
                  setSelectedPlatforms(newPlatforms);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedPlatforms.includes(platform.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{platform.icon}</span>
                <span className="text-sm">{platform.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Date Range and Refresh */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-neutral-500" />
              <select
                value={`${dateRange.start}_${dateRange.end}`}
                onChange={(e) => {
                  const [start, end] = e.target.value.split('_');
                  setDateRange({ start, end });
                }}
                className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              >
                <option value="2024-01-01_2024-01-31">Last 30 Days</option>
                <option value="2024-01-01_2024-01-07">Last 7 Days</option>
                <option value="2024-01-01_2024-01-14">Last 14 Days</option>
                <option value="2023-12-01_2024-01-31">Last 90 Days</option>
              </select>
            </div>
            
            <motion.button
              onClick={loadAnalyticsData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-lg'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={18} />
            <span className="text-sm font-semibold">{tab.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Total Followers',
                    value: formatNumber(getTotalMetrics().followers),
                    change: '+12.5%',
                    icon: Users,
                    color: 'blue'
                  },
                  {
                    label: 'Total Engagement',
                    value: formatNumber(getTotalMetrics().engagement),
                    change: '+8.3%',
                    icon: Heart,
                    color: 'pink'
                  },
                  {
                    label: 'Total Reach',
                    value: formatNumber(getTotalMetrics().reach),
                    change: '+15.7%',
                    icon: Eye,
                    color: 'purple'
                  },
                  {
                    label: 'Total Impressions',
                    value: formatNumber(getTotalMetrics().impressions),
                    change: '+22.1%',
                    icon: TrendingUp,
                    color: 'emerald'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                        <metric.icon size={24} className={`text-${metric.color}-600 dark:text-${metric.color}-400`} />
                      </div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        {metric.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                        {metric.value}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {metric.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Platform Breakdown */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                  Platform Performance
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.platform}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          {metric.platform}
                        </h4>
                        <span className="text-2xl">
                          {platforms.find(p => p.id === metric.platform)?.icon}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Followers:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {formatNumber(metric.followers)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Engagement Rate:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {metric.engagement.rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Reach:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {formatNumber(metric.reach)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Content Performance Analysis
                </h3>
                <motion.button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  <span>Export Report</span>
                </motion.button>
              </div>
              
              <div className="space-y-6">
                {contentPerformance.map((content, index) => (
                  <motion.div
                    key={content.id}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                          {content.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>{content.platform}</span>
                          <span>•</span>
                          <span>{new Date(content.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(content.sentiment)} bg-current bg-opacity-10`}>
                        {content.sentiment.positive}% Positive
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {formatNumber(content.metrics.views)}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {formatNumber(content.metrics.engagement)}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {formatNumber(content.metrics.clicks)}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {content.metrics.conversions}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Conversions</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="space-y-6">
              {competitorData.map((competitor, index) => (
                <motion.div
                  key={competitor.id}
                  className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {competitor.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {competitor.platforms.map((platform) => (
                        <span key={platform} className="text-lg">
                          {platforms.find(p => p.id === platform)?.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-4">
                        Platform Metrics
                      </h4>
                      <div className="space-y-3">
                        {competitor.metrics.map((metric) => (
                          <div key={metric.platform} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span>{platforms.find(p => p.id === metric.platform)?.icon}</span>
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {metric.platform}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-neutral-900 dark:text-white">
                                {formatNumber(metric.followers)}
                              </div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                {metric.engagement.rate.toFixed(1)}% engagement
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-4">
                        Recent Activity
                      </h4>
                      <div className="space-y-3">
                        {competitor.recentPosts.map((post) => (
                          <div key={post.id} className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                {post.platform}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              {post.content}
                            </p>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {formatNumber(post.engagement)} engagement
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
              <div className="text-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={48} className="text-blue-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  AI-Powered Insights Coming Soon
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Echo AI is analyzing your data to provide personalized insights and recommendations
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}