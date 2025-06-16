import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { 
  Brain, 
  User, 
  Sparkles, 
  Eye, 
  Palette, 
  Clock, 
  TrendingUp,
  Settings,
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  Layers,
  Scissors,
  Music,
  Video,
  Image,
  FileText,
  Activity,
  Star,
  Heart,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FileUploadZone } from './FileUploadZone';

interface StyleProfile {
  editingStyle: {
    cutType: 'hard' | 'soft' | 'mixed';
    pacing: 'fast' | 'medium' | 'slow';
    transitionPreference: string[];
    averageClipLength: number;
  };
  colorGrading: {
    preferredLUTs: string[];
    colorTemperature: 'warm' | 'cool' | 'neutral';
    saturationLevel: 'high' | 'medium' | 'low';
    contrastStyle: 'high' | 'medium' | 'low';
  };
  audioStyle: {
    musicGenres: string[];
    voiceoverStyle: 'professional' | 'casual' | 'energetic' | 'calm';
    audioLeveling: 'dynamic' | 'compressed' | 'natural';
    silenceTolerance: number;
  };
  contentPreferences: {
    topics: string[];
    toneOfVoice: 'formal' | 'casual' | 'humorous' | 'educational' | 'inspirational';
    contentLength: 'short' | 'medium' | 'long';
    storytellingStyle: 'linear' | 'non-linear' | 'documentary' | 'narrative';
  };
  platformOptimization: {
    primaryPlatforms: string[];
    aspectRatioPreference: string[];
    captionStyle: 'minimal' | 'detailed' | 'engaging' | 'informative';
    hashtagStrategy: 'trending' | 'niche' | 'branded' | 'mixed';
  };
}

interface LearningInsight {
  id: string;
  category: 'editing' | 'color' | 'audio' | 'content' | 'platform';
  insight: string;
  confidence: number;
  examples: string[];
  timestamp: string;
  applied: boolean;
}

interface FeedbackEvent {
  id: string;
  action: string;
  context: string;
  value: any;
  timestamp: string;
  component: string;
}

export function AIPersona() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { echoState, analyzePatterns } = useNexus();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEvent[]>([]);
  const [personaStrength, setPersonaStrength] = useState(0);
  const { user } = useAuth();

  // Mock style profile for demo
  const mockStyleProfile: StyleProfile = {
    editingStyle: {
      cutType: 'mixed',
      pacing: 'medium',
      transitionPreference: ['Cross Dissolve', 'Hard Cut', 'Fade to Black'],
      averageClipLength: 4.2
    },
    colorGrading: {
      preferredLUTs: ['Cinematic Warm', 'Natural Daylight', 'Moody Blue'],
      colorTemperature: 'warm',
      saturationLevel: 'medium',
      contrastStyle: 'high'
    },
    audioStyle: {
      musicGenres: ['Ambient', 'Cinematic', 'Electronic'],
      voiceoverStyle: 'professional',
      audioLeveling: 'compressed',
      silenceTolerance: 0.8
    },
    contentPreferences: {
      topics: ['Technology', 'Education', 'Lifestyle'],
      toneOfVoice: 'educational',
      contentLength: 'medium',
      storytellingStyle: 'documentary'
    },
    platformOptimization: {
      primaryPlatforms: ['YouTube', 'LinkedIn', 'TikTok'],
      aspectRatioPreference: ['16:9', '9:16'],
      captionStyle: 'detailed',
      hashtagStrategy: 'mixed'
    }
  };

  const mockInsights: LearningInsight[] = [
    {
      id: 'insight-1',
      category: 'editing',
      insight: 'You consistently shorten AI-generated pauses by 0.3 seconds on average',
      confidence: 92,
      examples: ['Podcast Episode #12', 'Interview with Sarah', 'Tech Review Video'],
      timestamp: '2024-01-15T10:30:00Z',
      applied: true
    },
    {
      id: 'insight-2',
      category: 'color',
      insight: 'You apply "Cinematic Warm" LUT to 85% of outdoor scenes',
      confidence: 88,
      examples: ['Nature Documentary', 'Travel Vlog', 'Product Showcase'],
      timestamp: '2024-01-15T09:15:00Z',
      applied: true
    },
    {
      id: 'insight-3',
      category: 'audio',
      insight: 'You prefer ambient music at -18dB for background tracks',
      confidence: 95,
      examples: ['Tutorial Series', 'Explainer Videos', 'Interviews'],
      timestamp: '2024-01-15T08:45:00Z',
      applied: false
    },
    {
      id: 'insight-4',
      category: 'content',
      insight: 'Your educational content performs 40% better with 3-part structure',
      confidence: 87,
      examples: ['How-to Guides', 'Tutorials', 'Explainers'],
      timestamp: '2024-01-14T16:20:00Z',
      applied: true
    }
  ];

  useEffect(() => {
    // Simulate loading existing persona data
    setTimeout(() => {
      setStyleProfile(mockStyleProfile);
      setLearningInsights(mockInsights);
      setPersonaStrength(78);
    }, 1000);
  }, []);

  const analyzeExistingProjects = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      // Start Echo AI analysis
      await analyzePatterns();
      
      // Simulate progress updates
      const updateProgress = () => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      };
      
      const progressInterval = setInterval(updateProgress, 500);
      
      // Update persona strength based on Echo insights
      setPersonaStrength(Math.min(100, 60 + echoState.insights.length * 5));
      
      // Add Echo insights to learning insights
      const newInsights = echoState.insights.slice(0, 3).map(insight => ({
        id: insight.id,
        category: insight.type === 'workflow' ? 'editing' : 
                 insight.type === 'preference' ? 'content' : 
                 insight.type === 'optimization' ? 'platform' : 'color',
        insight: insight.description,
        confidence: Math.round(insight.confidence * 100),
        examples: insight.metadata.examples || ['Recent Project', 'Timeline Edit', 'Content Creation'],
        timestamp: insight.timestamp,
        applied: false
      }));
      
      setLearningInsights(prev => [...newInsights, ...prev]);
      
      // Cleanup
      setTimeout(() => {
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setIsAnalyzing(false);
      }, 5000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const trackFeedback = (action: string, context: string, value: any, component: string) => {
    const feedbackEvent: FeedbackEvent = {
      id: `feedback-${Date.now()}`,
      action,
      context,
      value,
      timestamp: new Date().toISOString(),
      component
    };

    setFeedbackEvents(prev => [feedbackEvent, ...prev.slice(0, 99)]); // Keep last 100 events

    // Simulate learning from feedback
    if (feedbackEvents.length > 0 && feedbackEvents.length % 5 === 0) {
      setPersonaStrength(prev => Math.min(prev + 1, 100));
    }
  };

  const applyInsight = (insightId: string) => {
    setLearningInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, applied: true } : insight
    ));
  };

  const getPersonaStrengthColor = (strength: number) => {
    if (strength >= 80) return 'from-emerald-500 to-green-600';
    if (strength >= 60) return 'from-yellow-500 to-orange-600';
    if (strength >= 40) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-red-700';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'editing': return Scissors;
      case 'color': return Palette;
      case 'audio': return Music;
      case 'content': return FileText;
      case 'platform': return Target;
      default: return Activity;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'editing': return 'text-blue-500';
      case 'color': return 'text-purple-500';
      case 'audio': return 'text-green-500';
      case 'content': return 'text-orange-500';
      case 'platform': return 'text-pink-500';
      default: return 'text-neutral-500';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'style-profile', name: 'Style Profile', icon: Palette },
    { id: 'learning', name: 'Learning Insights', icon: Lightbulb },
    { id: 'feedback', name: 'Feedback Loop', icon: Activity },
    { id: 'training', name: 'Training Data', icon: Upload },
    { id: 'fine-tuning', name: 'Fine-Tuning', icon: Brain }
  ];

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
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(139, 92, 246, 0.5)",
                "0 0 40px rgba(139, 92, 246, 0.8)",
                "0 0 20px rgba(139, 92, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              AI Director's Persona
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your personal AI that learns and adapts to your unique creative style
            </p>
          </div>
        </div>

        {/* Persona Strength Indicator */}
        <motion.div 
          className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-neutral-600 dark:text-neutral-400" />
              <span className="font-semibold text-neutral-900 dark:text-white">
                {user?.full_name || user?.username}'s Creative Persona
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Strength:</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {personaStrength}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 mb-2">
            <motion.div 
              className={`h-3 bg-gradient-to-r ${getPersonaStrengthColor(personaStrength)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${personaStrength}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {personaStrength >= 80 ? 'Your AI persona is highly trained and provides excellent personalized suggestions.' :
             personaStrength >= 60 ? 'Your AI persona is well-trained and learning your preferences.' :
             personaStrength >= 40 ? 'Your AI persona is developing. More interaction will improve personalization.' :
             'Your AI persona is just getting started. Upload projects and provide feedback to improve.'}
          </p>
        </motion.div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
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
            transition={{ delay: 0.5 + index * 0.1 }}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                  <Zap size={20} className="mr-2" />
                  Quick Actions
                </h2>
                
                <div className="space-y-4">
                  <motion.button
                    onClick={analyzeExistingProjects}
                    disabled={isAnalyzing}
                    className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div 
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Analyzing Projects... {Math.round(analysisProgress)}%</span>
                      </>
                    ) : (
                      <>
                        <Eye size={20} />
                        <span>Analyze My Past Projects</span>
                      </>
                    )}
                  </motion.button>

                  {isAnalyzing && (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors flex items-center space-x-2">
                      <Download size={16} className="text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Export Profile</span>
                    </button>
                    <button className="p-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors flex items-center space-x-2">
                      <RotateCcw size={16} className="text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Reset Learning</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Insights */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                  <Sparkles size={20} className="mr-2" />
                  Recent Insights
                </h2>
                
                <div className="space-y-3">
                  {learningInsights.slice(0, 4).map((insight, index) => {
                    const CategoryIcon = getCategoryIcon(insight.category);
                    return (
                      <motion.div
                        key={insight.id}
                        className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <CategoryIcon size={16} className={getCategoryColor(insight.category)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                              {insight.insight}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {insight.confidence}% confidence
                              </span>
                              {insight.applied ? (
                                <CheckCircle size={14} className="text-emerald-500" />
                              ) : (
                                <button 
                                  onClick={() => applyInsight(insight.id)}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                >
                                  Apply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Editing Style */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                  <Scissors size={20} className="mr-2 text-blue-500" />
                  Editing Style
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Cut Type
                      </label>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                        {styleProfile.editingStyle.cutType}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Pacing
                      </label>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                        {styleProfile.editingStyle.pacing}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Preferred Transitions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {styleProfile.editingStyle.transitionPreference.map((transition) => (
                        <span
                          key={transition}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-sm"
                        >
                          {transition}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Average Clip Length
                    </label>
                    <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {styleProfile.editingStyle.averageClipLength}s
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Grading */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                  <Palette size={20} className="mr-2 text-purple-500" />
                  Color Grading
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Temperature
                      </label>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                        {styleProfile.colorGrading.colorTemperature}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Contrast
                      </label>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                        {styleProfile.colorGrading.contrastStyle}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Preferred LUTs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {styleProfile.colorGrading.preferredLUTs.map((lut) => (
                        <span
                          key={lut}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-sm"
                        >
                          {lut}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}