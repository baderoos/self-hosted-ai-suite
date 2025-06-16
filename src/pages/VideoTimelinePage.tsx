import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/GeminiService';
import { useNexus } from '../core/NexusContext';
import { VideoTimeline } from '../components/VideoTimeline';
import { 
  Clock, 
  FileText, 
  Video, 
  Upload, 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  AlertCircle 
} from 'lucide-react';

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'image' | 'generated';
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  track: number;
  thumbnail?: string;
  waveform?: number[];
  metadata?: {
    model?: string;
    prompt?: string;
    style?: string;
  };
}

interface VideoTimelinePageProps {
  clips: TimelineClip[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onClipAdd: (clip: Partial<TimelineClip>) => void;
  onClipEdit: (clipId: string, updates: Partial<TimelineClip>) => void;
  onClipDelete: (clipId: string) => void;
}

export function VideoTimelinePage({
  clips,
  duration,
  currentTime,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onClipAdd,
  onClipEdit,
  onClipDelete
}: VideoTimelinePageProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    transcript?: string;
    summary?: string;
    chapters?: Array<{ title: string; startTime: number; endTime?: number }>;
    error?: string;
  } | null>(null);
  
  const { trackInteraction } = useNexus();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }
    
    setVideoFile(file);
    
    trackInteraction({
      userId: 'current_user',
      module: 'timeline',
      action: 'upload_video',
      context: { fileType: file.type, fileSize: file.size }
    });
  };
  
  const clearVideo = () => {
    setVideoFile(null);
    setAnalysisResult(null);
  };
  
  const analyzeVideo = async () => {
    if (!videoFile) return;
    
    if (!geminiService.hasApiKey()) {
      setAnalysisResult({
        error: 'Gemini API key not set. Please configure it in Settings.'
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      trackInteraction({
        userId: 'current_user',
        module: 'timeline',
        action: 'analyze_video',
        context: { fileName: videoFile.name }
      });
      
      // For video analysis, we'll use the video file directly
      const fileData = {
        mimeType: videoFile.type,
        data: videoFile
      };
      
      const prompt = `You are Echo AI, an expert video analyst. Please analyze this video and provide:

1. A complete transcript of all spoken content
2. A concise summary (max 3 paragraphs)
3. Suggested chapter markers with timestamps in the format [MM:SS]

Format your response as a JSON object with 'transcript', 'summary', and 'chapters' fields.`;
      
      const response = await geminiService.generateContentWithMultiModal(
        prompt,
        [fileData],
        {
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        }
      );
      
      const responseText = geminiService.extractTextFromResponse(response);
      
      // Parse the JSON response
      try {
        const parsedResult = JSON.parse(responseText);
        
        // Process chapter timestamps into seconds
        if (parsedResult.chapters) {
          parsedResult.chapters = parsedResult.chapters.map((chapter: any) => {
            // Convert timestamp string like "01:23" to seconds
            const timestampMatch = chapter.timestamp?.match(/(\d+):(\d+)/);
            let startTime = 0;
            
            if (timestampMatch) {
              const minutes = parseInt(timestampMatch[1]);
              const seconds = parseInt(timestampMatch[2]);
              startTime = minutes * 60 + seconds;
            }
            
            return {
              title: chapter.title,
              startTime
            };
          });
        }
        
        setAnalysisResult(parsedResult);
      } catch (error) {
        console.error('Failed to parse Gemini response:', error, responseText);
        setAnalysisResult({
          error: 'Failed to parse analysis results. Please try again.'
        });
      }
    } catch (error) {
      console.error('Video analysis failed:', error);
      setAnalysisResult({
        error: `Analysis failed: ${error.message}`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Professional Video Timeline
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Advanced timeline editor with multi-track support and AI-generated content integration
        </p>
      </motion.div>
      
      {/* Gemini Video Analysis Panel */}
      <motion.div 
        className="mb-8 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Gemini Video Intelligence
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <Upload size={16} />
              <span>Upload Video</span>
            </label>
            
            <motion.button
              onClick={analyzeVideo}
              disabled={!videoFile || isAnalyzing}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnalyzing ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Intel</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
        
        {videoFile && (
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Video size={16} className="text-neutral-600 dark:text-neutral-400" />
                <span className="font-medium text-neutral-900 dark:text-white">
                  {videoFile.name}
                </span>
              </div>
              <button
                onClick={clearVideo}
                className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {analysisResult.error ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-400">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} />
                    <span>{analysisResult.error}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabs for different analysis results */}
                  <div className="flex space-x-2 border-b border-neutral-200 dark:border-neutral-700">
                    <button className="px-4 py-2 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium">
                      Results
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Summary */}
                    {analysisResult.summary && (
                      <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center space-x-2">
                          <FileText size={16} />
                          <span>Summary</span>
                        </h3>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          {analysisResult.summary}
                        </p>
                      </div>
                    )}
                    
                    {/* Chapters */}
                    {analysisResult.chapters && analysisResult.chapters.length > 0 && (
                      <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Chapter Markers</span>
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {analysisResult.chapters.map((chapter, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer"
                              onClick={() => onSeek(chapter.startTime)}
                            >
                              <div className="flex items-center space-x-2">
                                <Play size={14} className="text-indigo-500" />
                                <span className="text-sm text-neutral-900 dark:text-white">
                                  {chapter.title}
                                </span>
                              </div>
                              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                                {formatTimestamp(chapter.startTime)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Transcript */}
                    {analysisResult.transcript && (
                      <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 lg:col-span-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center space-x-2">
                          <FileText size={16} />
                          <span>Transcript</span>
                        </h3>
                        <div className="max-h-60 overflow-y-auto">
                          <pre className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {analysisResult.transcript}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <VideoTimeline
        clips={clips}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
        onClipAdd={onClipAdd}
        onClipEdit={onClipEdit}
        onClipDelete={onClipDelete}
      />
    </div>
  );
}