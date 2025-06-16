import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { geminiService } from '../services/GeminiService';
import { 
  Share2, 
  Heart, 
  Image as ImageIcon, 
  Send, 
  X, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function SocialCommandPage() {
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { trackInteraction } = useNexus();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept images
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setMediaFile(file);
    setError(null);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    
    // Track interaction
    trackInteraction({
      userId: 'current_user',
      module: 'social',
      action: 'upload_media',
      context: { fileType: file.type, fileSize: file.size }
    });
  };
  
  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setGeneratedCaptions([]);
    setSelectedCaption(null);
  };
  
  const generateCaptions = async () => {
    if (!mediaFile) {
      setError('Please upload an image first');
      return;
    }
    
    if (!geminiService.hasApiKey()) {
      setError('Gemini API key not set. Please configure it in Settings.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedCaptions([]);
    setSelectedCaption(null);
    
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'social',
        action: 'generate_captions',
        context: { hasText: !!postText.trim() }
      });
      
      // Prepare the file data
      const fileData = {
        mimeType: mediaFile.type,
        data: mediaFile
      };
      
      // Create the prompt
      let prompt = 'Generate 5 engaging, clever captions for this image that would work well on social media.';
      
      if (postText.trim()) {
        prompt += ` Incorporate these ideas or themes: "${postText}"`;
      }
      
      prompt += ' Format your response as a JSON array of caption strings.';
      
      const response = await geminiService.generateContentWithMultiModal(
        prompt,
        [fileData],
        {
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }
      );
      
      const responseText = geminiService.extractTextFromResponse(response);
      
      try {
        // Parse the JSON response
        const captions = JSON.parse(responseText);
        
        if (Array.isArray(captions) && captions.length > 0) {
          setGeneratedCaptions(captions);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to parse captions:', error, responseText);
        
        // Fallback: try to extract captions from text
        const captionMatches = responseText.match(/["'](.+?)["']/g);
        if (captionMatches && captionMatches.length > 0) {
          const extractedCaptions = captionMatches.map(match => 
            match.replace(/^["']|["']$/g, '')
          );
          setGeneratedCaptions(extractedCaptions);
        } else {
          setError('Failed to generate captions. Please try again.');
        }
      }
    } catch (error) {
      console.error('Caption generation failed:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(236, 72, 153, 0.5)",
              "0 0 40px rgba(236, 72, 153, 0.8)",
              "0 0 20px rgba(236, 72, 153, 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Share2 size={32} className="text-white" />
        </motion.div>
        
        {/* Headline Variations */}
        <motion.h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="block text-neutral-900 dark:text-white mb-2">
            Your AI Social Media Team
          </span>
          <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            is Ready
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Stop managing tasks and start directing strategy. Social Hub is the world's first open-source platform that deploys a team of AI agents to run your social media, from planning and content creation to publishing and analytics. And it's completely free.
        </motion.p>
        
        {/* Email Signup */}
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <motion.button 
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Activate My AI Team
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Social Post Creator with Gemini */}
      <motion.div 
        className="mb-16 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
            <Sparkles size={20} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Gemini-Powered Caption Generator
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Post Ideas (Optional)
              </label>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Enter any ideas, themes, or keywords you want to include in your captions..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Image Upload
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block w-full p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-center hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
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
                    <div className="py-8">
                      <ImageIcon size={32} className="mx-auto text-neutral-400 mb-2" />
                      <p>Click to upload image or meme</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            {/* Generate Button */}
            <motion.button
              onClick={generateCaptions}
              disabled={!mediaFile || isGenerating}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <>
                  <motion.div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Generating Captions...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Clever Captions</span>
                </>
              )}
            </motion.button>
            
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
          
          {/* Results Section */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Generated Captions
            </h3>
            
            {isGenerating ? (
              <div className="flex items-center justify-center h-64 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Gemini is analyzing your image...
                  </p>
                </div>
              </div>
            ) : generatedCaptions.length > 0 ? (
              <div className="space-y-3">
                {generatedCaptions.map((caption, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      selectedCaption === caption
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-700/50 hover:border-pink-300 dark:hover:border-pink-700'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedCaption(caption)}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-neutral-900 dark:text-white">
                        {caption}
                      </p>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(caption);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-pink-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {copied && selectedCaption === caption ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.button
                  onClick={generateCaptions}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw size={16} />
                  <span>Generate More Options</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                <div className="text-center">
                  <ImageIcon size={32} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Upload an image and generate captions
                  </p>
                </div>
              </div>
            )}
            
            {selectedCaption && (
              <motion.div
                className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                  Selected Caption
                </h4>
                <p className="text-neutral-800 dark:text-neutral-200 mb-3">
                  {selectedCaption}
                </p>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => copyToClipboard(selectedCaption)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center space-x-2 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy size={16} />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={16} />
                    <span>Use Caption</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* AI Agent Team Section */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Meet Your Autonomous AI Team
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Each agent specializes in a different aspect of social media management, working together seamlessly to execute your vision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Strategist Agent",
              role: "Plans Your Calendar",
              description: "Analyzes trends, schedules content, and develops comprehensive social media strategies tailored to your goals.",
              icon: "Brain",
              color: "from-blue-500 to-blue-600",
              delay: 0.1
            },
            {
              name: "Creative Agent", 
              role: "Writes & Designs",
              description: "Generates compelling copy, suggests visuals, and creates engaging content that resonates with your audience.",
              icon: "Sparkles",
              color: "from-purple-500 to-purple-600",
              delay: 0.2
            },
            {
              name: "Analyst Agent",
              role: "Tracks Performance", 
              description: "Monitors engagement, analyzes performance metrics, and provides actionable insights for optimization.",
              icon: "BarChart3",
              color: "from-emerald-500 to-emerald-600",
              delay: 0.3
            }
          ].map((agent, index) => (
            <motion.div
              key={agent.name}
              className="group p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + agent.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <motion.div 
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${agent.color} mb-4`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {/* Dynamic icon rendering would go here */}
                <div className="text-white" style={{ width: '24px', height: '24px' }} />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {agent.name}
              </h3>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-3">
                {agent.role}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {agent.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            {
              title: "Delegate Your Social Media to a Full AI Team",
              description: "Meet your new team. A Strategist Agent plans your calendar, a Creative Agent writes posts and suggests visuals, and an Analyst Agent tracks your performance. They work together seamlessly, turning your goals into a complete, executed social media campaign.",
              icon: "Users",
              color: "from-pink-500 to-purple-500"
            },
            {
              title: "Your Hub for Total Control",
              description: "When you want to take the wheel, the intuitive interface gives you full control. Manually publish, approve agent-created content, and schedule posts across all platforms with a single click.",
              icon: "Settings",
              color: "from-cyan-500 to-blue-500"
            },
            {
              title: "Transparent, Powerful, and Radically Free",
              description: "AI this powerful needs to be open. We're building Social Hub in public, giving you full transparency and a voice in its development. Join the community and help build the future of marketing.",
              icon: "Eye",
              color: "from-emerald-500 to-green-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Dynamic icon rendering would go here */}
                <div className="text-white" style={{ width: '24px', height: '24px' }} />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.div 
        className="text-center bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-pink-200 dark:border-pink-800"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
      >
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Our Mission
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed mb-6">
          We believe the power of advanced AI should belong to everyone, not just the big players. We're making Social Hub open-source to demystify AI and build a transparent, community-driven platform. This isn't a black box; it's a glass box you can help shape.
        </p>
        <motion.div 
          className="inline-flex items-center space-x-2 text-pink-600 dark:text-pink-400 font-semibold"
          whileHover={{ scale: 1.05 }}
        >
          <Heart size={20} />
          <span>Join us and let's build the future of marketing, together.</span>
        </motion.div>
      </motion.div>

      {/* Final CTA */}
      <motion.div 
        className="text-center mt-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <motion.button 
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Control of the Agents
            </motion.button>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
            No credit card required • Free forever • Open source
          </p>
        </div>
      </motion.div>
    </div>
  );
}