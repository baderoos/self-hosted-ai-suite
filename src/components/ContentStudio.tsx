import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { geminiService, FileData } from '../services/GeminiService';
import { 
  Brain, 
  Image, 
  Video, 
  Wand2, 
  Upload, 
  Download,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Send,
  Mic,
  Eye,
  Share2,
  Zap,
  FileText,
  Camera,
  Music,
  Palette,
  Sparkles,
  Clock,
  Sliders,
  Film,
  Monitor,
  X
} from 'lucide-react';

export function ContentStudio() {
  const [activeStudio, setActiveStudio] = useState('video-generation');
  const [textPrompt, setTextPrompt] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('hunyuan-video');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');
  
  const { trackInteraction } = useNexus();

  const studios = [
    { 
      id: 'video-generation', 
      label: 'AI Video Generation', 
      icon: Film, 
      color: 'primary',
      description: 'Text-to-video with cutting-edge AI models'
    },
    { 
      id: 'mcp-directive', 
      label: 'MCP Directive', 
      icon: Brain, 
      color: 'secondary',
      description: 'Natural language creative commands'
    },
    { 
      id: 'multi-cam', 
      label: 'Multi-Cam Production', 
      icon: Video, 
      color: 'accent',
      description: 'Intelligent camera switching and sync'
    },
    { 
      id: 'social-clips', 
      label: 'Social Clip Factory', 
      icon: Share2, 
      color: 'purple',
      description: 'Viral moment extraction and optimization'
    },
    { 
      id: 'audio-master', 
      label: 'Audio Mastery', 
      icon: Mic, 
      color: 'pink',
      description: 'Professional audio enhancement'
    },
  ];

  const videoModels = [
    {
      id: 'hunyuan-video',
      name: 'HunyuanVideo',
      description: 'State-of-the-art text-to-video generation',
      capabilities: ['Text-to-Video', 'High Resolution', 'Long Duration'],
      maxDuration: 10,
      resolution: '1280x720'
    },
    {
      id: 'open-sora',
      name: 'Open-Sora',
      description: 'Open-source video generation model',
      capabilities: ['Text-to-Video', 'Style Transfer', 'Fast Generation'],
      maxDuration: 8,
      resolution: '1024x576'
    },
    {
      id: 'mochi',
      name: 'Mochi',
      description: 'Lightweight and efficient video AI',
      capabilities: ['Text-to-Video', 'Image-to-Video', 'Quick Preview'],
      maxDuration: 6,
      resolution: '768x768'
    }
  ];

  const videoStyles = [
    { id: 'cinematic', name: 'Cinematic', description: 'Film-like quality with depth of field' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic rendering' },
    { id: 'artistic', name: 'Artistic', description: 'Stylized and creative interpretation' },
    { id: 'documentary', name: 'Documentary', description: 'Natural, documentary-style footage' },
    { id: 'gemini', name: 'Gemini Enhanced', description: 'Enhanced with Google Gemini AI' }
  ];

  const workflowPresets = [
    {
      id: 'podcast-complete',
      name: 'The Podcast Workflow',
      description: 'Complete podcast production pipeline',
      command: 'MCP, execute "The Podcast Workflow": sync multi-cam, remove filler words, generate 3 teaser clips with animated captions',
      steps: ['Ingest Assets', 'Sync Multi-Cam', 'Transcribe', 'Remove Fillers', 'Master Audio', 'Generate Clips'],
      estimatedTime: '2h 15m'
    },
    {
      id: 'viral-extraction',
      name: 'Viral Moment Hunter',
      description: 'Extract and optimize viral moments',
      command: 'MCP, analyze this content and extract the 5 most engaging moments for social media with platform-specific optimization',
      steps: ['Content Analysis', 'Emotion Detection', 'Moment Extraction', 'Platform Optimization', 'Caption Generation'],
      estimatedTime: '45m'
    },
    {
      id: 'live-switch',
      name: 'Live-Switch Director',
      description: 'Intelligent multi-camera switching',
      command: 'MCP, create a live-switched edit favoring the wide shot during crosstalk and close-ups for emotional moments',
      steps: ['Camera Sync', 'Speaker Detection', 'Emotion Analysis', 'Switch Logic', 'Final Assembly'],
      estimatedTime: '1h 30m'
    },
    {
      id: 'style-transfer',
      name: 'Style Transformer',
      description: 'Creative style transformation',
      command: 'MCP, re-edit this content in the style of a sci-fi trailer with dramatic pacing and color grading',
      steps: ['Style Analysis', 'Pacing Adjustment', 'Color Grading', 'Audio Design', 'Final Polish'],
      estimatedTime: '3h 45m'
    }
  ];

  const aiAgentStatus = [
    { name: 'Video Generation AI', status: 'ready', load: 8, icon: Film, color: 'emerald' },
    { name: 'Transcriber AI', status: 'ready', load: 12, icon: FileText, color: 'blue' },
    { name: 'Vision AI', status: 'ready', load: 15, icon: Eye, color: 'purple' },
    { name: 'Audio AI', status: 'ready', load: 18, icon: Mic, color: 'orange' },
    { name: 'Multi-Cam AI', status: 'ready', load: 22, icon: Camera, color: 'pink' },
    { name: 'Social Clip AI', status: 'ready', load: 5, icon: Share2, color: 'cyan' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'content-studio',
        action: 'generate_content',
        context: { 
          prompt: textPrompt, 
          hasMedia: !!mediaFile,
          mediaType: mediaFile?.type,
          model: activeStudio === 'video-generation' ? selectedModel : geminiModel
        }
      });
      
      if (activeStudio === 'video-generation') {
        // Simulate video generation process
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        // Use Gemini for content generation
        if (!geminiService.hasApiKey()) {
          throw new Error('Gemini API key not set. Please configure it in Settings.');
        }
        
        let response;
        
        if (mediaFile) {
          // Multimodal generation with media
          const fileData: FileData = {
            mimeType: mediaFile.type,
            data: mediaFile
          };
          
          response = await geminiService.generateContentWithMultiModal(
            textPrompt,
            [fileData],
            {
              model: geminiModel,
              systemPrompt: "You are Echo, an expert AI assistant for content creation. Analyze the provided media and respond to the user's prompt with detailed, creative, and helpful content."
            }
          );
        } else {
          // Text-only generation
          response = await geminiService.generateContent(
            textPrompt,
            {
              model: geminiModel,
              systemPrompt: "You are Echo, an expert AI assistant for content creation. Provide detailed, creative, and helpful content based on the user's prompt."
            }
          );
        }
        
        const generatedText = geminiService.extractTextFromResponse(response);
        setGeneratedContent(generatedText);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedContent(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const executeWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow.id);
    setTextPrompt(workflow.command);
    setIsGenerating(true);
    
    // Simulate workflow execution
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedWorkflow(null);
    }, 8000);
  };

  const selectedModelData = videoModels.find(m => m.id === selectedModel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.5)",
                "0 0 40px rgba(99, 102, 241, 0.8)",
                "0 0 20px rgba(99, 102, 241, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wand2 size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              AI Video Master Studio
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Create professional video content with cutting-edge AI models and intelligent workflows
            </p>
          </div>
        </div>
      </motion.div>

      {/* Studio Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {studios.map((studio, index) => (
          <motion.button
            key={studio.id}
            onClick={() => setActiveStudio(studio.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeStudio === studio.id
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-lg'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <studio.icon size={18} />
            <div className="text-left">
              <div className="text-sm font-semibold">{studio.label}</div>
              <div className="text-xs opacity-70">{studio.description}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Input Panel */}
        <motion.div 
          className="xl:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              {activeStudio === 'video-generation' && 'AI Video Generation Studio'}
              {activeStudio === 'mcp-directive' && 'MCP Command Interface'}
              {activeStudio === 'multi-cam' && 'Multi-Camera Production'}
              {activeStudio === 'social-clips' && 'Social Clip Generation'}
              {activeStudio === 'audio-master' && 'Audio Mastery Suite'}
            </h2>

            {activeStudio === 'video-generation' && (
              <div className="space-y-6">
                {/* Video Prompt */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Video Description
                    {activeStudio === 'video-generation' && (
                      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                        (Text prompt only)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="A majestic dragon soaring through clouds at sunset, cinematic lighting, 4K quality..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    AI Model
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {videoModels.map((model) => (
                      <motion.button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedModel === model.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {model.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Monitor size={14} className="text-neutral-500" />
                            <span className="text-xs text-neutral-500">{model.resolution}</span>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                          {model.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Video Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Duration (seconds)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max={selectedModelData?.maxDuration || 10}
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>1s</span>
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          {videoDuration}s
                        </span>
                        <span>{selectedModelData?.maxDuration}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Aspect Ratio
                    </label>
                    <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:3">4:3 (Classic)</option>
                    </select>
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Video Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {videoStyles.map((style) => (
                      <motion.button
                        key={style.id}
                        onClick={() => setVideoStyle(style.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                          videoStyle === style.id
                            ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-secondary-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h4 className="font-medium text-neutral-900 dark:text-white text-sm">
                          {style.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          {style.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeStudio === 'mcp-directive' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Natural Language Directive
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="MCP, execute 'The Podcast Workflow': sync multi-cam, remove filler words, generate 3 teaser clips with animated captions..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Primary Agent
                    </label>
                    <select className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white">
                      <option>Master Control Program</option>
                      <option>Video Generation AI</option>
                      <option>Transcriber AI</option>
                      <option>Vision AI</option>
                      <option>Audio AI</option>
                      <option>Multi-Cam AI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Creativity Level
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="0.7"
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>Conservative</span>
                        <span>Experimental</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStudio === 'multi-cam' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Multi-Cam Setup
                  </label>
                  <motion.div 
                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-secondary-400 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Upload size={32} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Drop camera angles here
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                      MCP will auto-sync and create multi-cam sequence
                    </p>
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Edit Style
                    </label>
                    <select className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white">
                      <option>Live-Switched (Auto)</option>
                      <option>Active Speaker Focus</option>
                      <option>Wide Shot Preference</option>
                      <option>Reaction Shots</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Camera Count
                    </label>
                    <select className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white">
                      <option>2 Cameras</option>
                      <option>3 Cameras</option>
                      <option>4+ Cameras</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeStudio !== 'video-generation' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Content Prompt
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Describe what content you want to generate. You can also upload an image or video for context..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Upload Media (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="cursor-pointer block w-full p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    >
                      {mediaPreview ? (
                        <div className="relative">
                          <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                          <button
                            onClick={(e) => { e.preventDefault(); clearMedia(); }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="py-8"><Upload size={32} className="mx-auto text-neutral-400 mb-2" /><p>Click to upload image or video</p></div>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* Gemini Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Gemini Model
                  </label>
                  <select 
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Best for complex tasks)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Faster responses)</option>
                  </select>
                </div>
              </div>
            )}

            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full mt-6 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                isGenerating
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:scale-[1.02]'
              }`}
              whileHover={!isGenerating ? { scale: 1.02 } : {}}
              whileTap={!isGenerating ? { scale: 0.98 } : {}}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div 
                    className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>
                    {activeStudio === 'video-generation' ? 'Generating Video...' : 'Executing Directive...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {activeStudio === 'video-generation' ? <Film size={20} /> : <Wand2 size={20} />}
                  <span>
                    {activeStudio === 'video-generation' ? 'Generate Video' : 'Execute Directive'}
                  </span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Workflow Presets */}
          {activeStudio === 'mcp-directive' && (
            <motion.div 
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Workflow Presets
              </h3>
              <div className="space-y-3">
                {workflowPresets.map((workflow) => (
                  <motion.button
                    key={workflow.id}
                    onClick={() => executeWorkflow(workflow)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedWorkflow === workflow.id
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-accent-300 dark:hover:border-accent-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {workflow.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-neutral-500" />
                        <span className="text-xs text-neutral-500">{workflow.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {workflow.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.steps.map((step) => (
                        <span
                          key={step}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Output Panel */}
        <motion.div 
          className="xl:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* AI Agent Status */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              AI Agent Status
            </h3>
            <div className="space-y-3">
              {aiAgentStatus.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-${agent.color}-100 dark:bg-${agent.color}-900/30 flex items-center justify-center`}>
                      <agent.icon size={16} className={`text-${agent.color}-600 dark:text-${agent.color}-400`} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white text-sm">
                        {agent.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Load: {agent.load}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-${agent.color}-500`} />
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Content */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Generated Content
            </h3>
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div 
                  className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  {activeStudio === 'video-generation' ? 'Generating your video...' : 'Processing your request...'}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 text-center mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50">
                  <pre className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-white">
                    {generatedContent}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-neutral-400" />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your generated content will appear here
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                  Enter a prompt and click generate to get started
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}