import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Download, 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Eye,
  Video,
  Image,
  Mic,
  Palette,
  Scissors,
  Wand2,
  Cloud,
  Server,
  Smartphone
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'video-generation' | 'audio-processing' | 'image-generation' | 'text-processing' | 'editing';
  provider: string;
  description: string;
  capabilities: string[];
  requirements: {
    gpu: string;
    ram: string;
    storage: string;
    vram: string;
  };
  performance: {
    speed: number;
    quality: number;
    efficiency: number;
  };
  status: 'available' | 'downloading' | 'installed' | 'running' | 'error';
  downloadProgress?: number;
  size: string;
  license: 'open-source' | 'commercial' | 'research';
  rating: number;
  downloads: string;
  lastUpdated: string;
  icon: any;
  color: string;
  featured?: boolean;
}

export function ModelHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'updated'>('rating');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const models: AIModel[] = [
    {
      id: 'hunyuan-video',
      name: 'HunyuanVideo',
      version: '1.0',
      type: 'video-generation',
      provider: 'Tencent',
      description: 'State-of-the-art text-to-video generation with exceptional quality and temporal consistency',
      capabilities: ['Text-to-Video', 'High Resolution', 'Long Duration', 'Temporal Consistency'],
      requirements: {
        gpu: 'RTX 4090 / A100',
        ram: '32GB',
        storage: '50GB',
        vram: '24GB'
      },
      performance: {
        speed: 85,
        quality: 95,
        efficiency: 80
      },
      status: 'installed',
      size: '12.5GB',
      license: 'open-source',
      rating: 4.8,
      downloads: '125K',
      lastUpdated: '2024-01-15',
      icon: Video,
      color: 'blue',
      featured: true
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      version: '1.5',
      type: 'text-processing',
      provider: 'Google',
      description: 'The most capable multimodal model with 1M token context window for complex reasoning and analysis',
      capabilities: ['Text Generation', 'Multimodal Understanding', 'Long Context', 'Function Calling'],
      requirements: {
        gpu: 'Cloud-based',
        ram: 'N/A',
        storage: 'N/A',
        vram: 'N/A'
      },
      performance: {
        speed: 90,
        quality: 98,
        efficiency: 95
      },
      status: 'available',
      size: 'Cloud API',
      license: 'commercial',
      rating: 4.9,
      downloads: '2.1M',
      lastUpdated: '2024-01-20',
      icon: Brain,
      color: 'purple',
      featured: true
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      version: '1.5',
      type: 'text-processing',
      provider: 'Google',
      description: 'Fast and efficient model optimized for quick responses and real-time applications',
      capabilities: ['Text Generation', 'Fast Response', 'Multimodal', 'Real-time Processing'],
      requirements: {
        gpu: 'Cloud-based',
        ram: 'N/A',
        storage: 'N/A',
        vram: 'N/A'
      },
      performance: {
        speed: 98,
        quality: 92,
        efficiency: 98
      },
      status: 'available',
      size: 'Cloud API',
      license: 'commercial',
      rating: 4.7,
      downloads: '1.8M',
      lastUpdated: '2024-01-20',
      icon: Zap,
      color: 'cyan',
      featured: true
    },
    {
      id: 'open-sora',
      name: 'Open-Sora',
      version: '1.2',
      type: 'video-generation',
      provider: 'HPC-AI Tech',
      description: 'Open-source video generation model with excellent performance and community support',
      capabilities: ['Text-to-Video', 'Style Transfer', 'Fast Generation', 'Community Models'],
      requirements: {
        gpu: 'RTX 3080 / V100',
        ram: '16GB',
        storage: '25GB',
        vram: '16GB'
      },
      performance: {
        speed: 90,
        quality: 88,
        efficiency: 92
      },
      status: 'available',
      size: '8.2GB',
      license: 'open-source',
      rating: 4.6,
      downloads: '89K',
      lastUpdated: '2024-01-10',
      icon: Video,
      color: 'green',
      featured: true
    },
    {
      id: 'mochi',
      name: 'Mochi',
      version: '0.9',
      type: 'video-generation',
      provider: 'Genmo',
      description: 'Lightweight and efficient video AI model optimized for consumer hardware',
      capabilities: ['Text-to-Video', 'Image-to-Video', 'Quick Preview', 'Mobile Friendly'],
      requirements: {
        gpu: 'RTX 3060 / GTX 1080',
        ram: '8GB',
        storage: '15GB',
        vram: '8GB'
      },
      performance: {
        speed: 95,
        quality: 82,
        efficiency: 95
      },
      status: 'downloading',
      downloadProgress: 65,
      size: '4.8GB',
      license: 'open-source',
      rating: 4.4,
      downloads: '156K',
      lastUpdated: '2024-01-08',
      icon: Video,
      color: 'purple'
    },
    {
      id: 'whisper-large',
      name: 'Whisper Large v3',
      version: '3.0',
      type: 'audio-processing',
      provider: 'OpenAI',
      description: 'Advanced speech recognition with multilingual support and high accuracy',
      capabilities: ['Speech-to-Text', 'Multilingual', 'Speaker ID', 'Noise Robust'],
      requirements: {
        gpu: 'RTX 2060 / GTX 1660',
        ram: '8GB',
        storage: '5GB',
        vram: '6GB'
      },
      performance: {
        speed: 88,
        quality: 96,
        efficiency: 90
      },
      status: 'installed',
      size: '3.1GB',
      license: 'open-source',
      rating: 4.9,
      downloads: '2.1M',
      lastUpdated: '2023-12-20',
      icon: Mic,
      color: 'emerald'
    },
    {
      id: 'stable-diffusion-xl',
      name: 'Stable Diffusion XL',
      version: '1.0',
      type: 'image-generation',
      provider: 'Stability AI',
      description: 'High-resolution image generation with exceptional detail and artistic control',
      capabilities: ['Text-to-Image', 'Image-to-Image', 'Inpainting', 'ControlNet'],
      requirements: {
        gpu: 'RTX 3070 / RTX 2080',
        ram: '16GB',
        storage: '12GB',
        vram: '10GB'
      },
      performance: {
        speed: 85,
        quality: 93,
        efficiency: 87
      },
      status: 'available',
      size: '6.9GB',
      license: 'open-source',
      rating: 4.7,
      downloads: '890K',
      lastUpdated: '2023-11-15',
      icon: Image,
      color: 'pink'
    },
    {
      id: 'auto-editor',
      name: 'Auto-Editor Pro',
      version: '2.1',
      type: 'editing',
      provider: 'WyattBlue',
      description: 'Intelligent video editing with silence removal and scene detection',
      capabilities: ['Silence Removal', 'Scene Detection', 'Auto-Cut', 'Batch Processing'],
      requirements: {
        gpu: 'GTX 1050 / Integrated',
        ram: '4GB',
        storage: '2GB',
        vram: '2GB'
      },
      performance: {
        speed: 92,
        quality: 85,
        efficiency: 98
      },
      status: 'installed',
      size: '850MB',
      license: 'open-source',
      rating: 4.5,
      downloads: '234K',
      lastUpdated: '2024-01-05',
      icon: Scissors,
      color: 'orange'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Models', icon: Brain },
    { id: 'video-generation', name: 'Video Generation', icon: Video },
    { id: 'audio-processing', name: 'Audio Processing', icon: Mic },
    { id: 'image-generation', name: 'Image Generation', icon: Image },
    { id: 'editing', name: 'Video Editing', icon: Scissors },
    { id: 'text-processing', name: 'Text Processing', icon: Wand2 }
  ];

  const filteredModels = models
    .filter(model => 
      (selectedCategory === 'all' || model.type === selectedCategory) &&
      (model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       model.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return b.rating - a.rating;
        case 'downloads': return parseInt(b.downloads.replace(/[^\d]/g, '')) - parseInt(a.downloads.replace(/[^\d]/g, ''));
        case 'updated': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default: return 0;
      }
    });

  const handleModelAction = (modelId: string, action: 'download' | 'install' | 'run' | 'stop') => {
    // Simulate model actions
    console.log(`${action} model:`, modelId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return CheckCircle;
      case 'downloading': return Download;
      case 'running': return Play;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-emerald-500';
      case 'downloading': return 'text-blue-500';
      case 'running': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-neutral-500';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-500';
    if (value >= 80) return 'bg-yellow-500';
    if (value >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

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
            className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 40px rgba(59, 130, 246, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              AI Model Hub
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Discover, download, and manage cutting-edge AI models for video creation
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <category.icon size={16} />
                <span className="text-sm">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="rating">Sort by Rating</option>
              <option value="downloads">Sort by Downloads</option>
              <option value="updated">Sort by Updated</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Featured Models */}
      {selectedCategory === 'all' && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Star size={24} className="mr-2 text-yellow-500" />
            Featured Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.filter(model => model.featured).map((model, index) => (
              <motion.div
                key={model.id}
                className="bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-800/90 dark:to-neutral-800/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-${model.color}-100 dark:bg-${model.color}-900/30`}>
                      <model.icon size={24} className={`text-${model.color}-600 dark:text-${model.color}-400`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white">{model.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {model.rating}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {model.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{model.size}</span>
                    <span>{model.downloads}</span>
                  </div>
                  
                  <motion.button
                    onClick={() => handleModelAction(model.id, 'download')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      model.status === 'installed' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {model.status === 'installed' ? 'Installed' : 'Download'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Model Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {filteredModels.map((model, index) => {
          const StatusIcon = getStatusIcon(model.status);
          
          return (
            <motion.div
              key={model.id}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Model Header */}
              <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${model.color}-100 dark:bg-${model.color}-900/30`}>
                      <model.icon size={20} className={`text-${model.color}-600 dark:text-${model.color}-400`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white">{model.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {model.provider} • v{model.version}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusIcon size={16} className={getStatusColor(model.status)} />
                    <span className={`text-xs font-medium ${getStatusColor(model.status)}`}>
                      {model.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {model.description}
                </p>
                
                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {model.capabilities.slice(0, 3).map((capability) => (
                    <span
                      key={capability}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    >
                      {capability}
                    </span>
                  ))}
                  {model.capabilities.length > 3 && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                      +{model.capabilities.length - 3} more
                    </span>
                  )}
                </div>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Speed', value: model.performance.speed },
                    { label: 'Quality', value: model.performance.quality },
                    { label: 'Efficiency', value: model.performance.efficiency }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        {metric.label}
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                        <motion.div 
                          className={`h-2 rounded-full ${getPerformanceColor(metric.value)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                        {metric.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Model Footer */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-4 text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center space-x-1">
                      <HardDrive size={14} />
                      <span>{model.size}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{model.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>{model.rating}</span>
                    </div>
                  </div>
                </div>
                
                {/* Download Progress */}
                {model.status === 'downloading' && model.downloadProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-neutral-600 dark:text-neutral-400">Downloading...</span>
                      <span className="text-neutral-600 dark:text-neutral-400">{model.downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                      <motion.div 
                        className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${model.downloadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {model.status === 'available' && (
                    <motion.button
                      onClick={() => handleModelAction(model.id, 'download')}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </motion.button>
                  )}
                  
                  {model.status === 'installed' && (
                    <>
                      <motion.button
                        onClick={() => handleModelAction(model.id, 'run')}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play size={16} />
                        <span>Run</span>
                      </motion.button>
                      <motion.button
                        onClick={() => setSelectedModel(model.id)}
                        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Settings size={16} />
                      </motion.button>
                    </>
                  )}
                  
                  {model.status === 'running' && (
                    <motion.button
                      onClick={() => handleModelAction(model.id, 'stop')}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Square size={16} />
                      <span>Stop</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Model Details Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedModel(null)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const model = models.find(m => m.id === selectedModel);
                if (!model) return null;
                
                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl bg-${model.color}-100 dark:bg-${model.color}-900/30`}>
                          <model.icon size={24} className={`text-${model.color}-600 dark:text-${model.color}-400`} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {model.name}
                          </h2>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {model.provider} • Version {model.version}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedModel(null)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                          Description
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {model.description}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                          System Requirements
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(model.requirements).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                                {key}:
                              </span>
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                          Capabilities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {model.capabilities.map((capability) => (
                            <span
                              key={capability}
                              className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}