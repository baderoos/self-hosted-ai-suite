import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from './PersonaProvider';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Scissors,
  Copy,
  Trash2,
  Plus,
  Layers,
  Music,
  Video,
  Image,
  Mic,
  Wand2,
  Clock,
  Zap
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

interface VideoTimelineProps {
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

export function VideoTimeline({
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
}: VideoTimelineProps) {
  const { trackFeedback } = usePersona();
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const tracks = [
    { id: 0, name: 'Video Track 1', type: 'video', color: 'bg-blue-500' },
    { id: 1, name: 'Video Track 2', type: 'video', color: 'bg-purple-500' },
    { id: 2, name: 'Audio Track 1', type: 'audio', color: 'bg-green-500' },
    { id: 3, name: 'Audio Track 2', type: 'audio', color: 'bg-orange-500' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timelineWidth = rect.width - 200; // Account for track labels
    const clickTime = (x / timelineWidth) * duration * zoom;
    
    onSeek(Math.max(0, Math.min(duration, clickTime)));
  }, [duration, zoom, onSeek]);

  const getClipIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Mic;
      case 'image': return Image;
      case 'generated': return Wand2;
      default: return Video;
    }
  };

  const getClipColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-600';
      case 'audio': return 'bg-green-600';
      case 'image': return 'bg-purple-600';
      case 'generated': return 'bg-gradient-to-r from-cyan-600 to-purple-600';
      default: return 'bg-neutral-600';
    }
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-700 overflow-hidden">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">Video Timeline</h3>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Clock size={16} />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white text-sm transition-colors"
          >
            -
          </button>
          <span className="text-sm text-neutral-400 min-w-[60px] text-center">
            {zoom}x
          </span>
          <button
            onClick={() => setZoom(Math.min(5, zoom + 0.5))}
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white text-sm transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/30">
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => onSeek(0)}
            className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipBack size={18} />
          </motion.button>
          
          <motion.button
            onClick={isPlaying ? onPause : onPlay}
            className="p-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>
          
          <motion.button
            onClick={() => onSeek(duration)}
            className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipForward size={18} />
          </motion.button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => onClipAdd({ type: 'video', track: 0 })}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wand2 size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div 
        ref={timelineRef}
        className="relative overflow-x-auto"
        onClick={handleTimelineClick}
      >
        {/* Time Ruler */}
        <div className="flex border-b border-neutral-700 bg-neutral-800/20">
          <div className="w-48 flex-shrink-0 p-3 border-r border-neutral-700">
            <span className="text-sm font-medium text-neutral-400">Time</span>
          </div>
          <div className="flex-1 relative h-8">
            {Array.from({ length: Math.ceil(duration * zoom / 5) }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-neutral-600"
                style={{ left: `${(i * 5) / (duration * zoom) * 100}%` }}
              >
                <span className="absolute top-1 left-1 text-xs text-neutral-500">
                  {formatTime(i * 5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        {tracks.map((track) => (
          <div key={track.id} className="flex border-b border-neutral-700/50">
            <div className="w-48 flex-shrink-0 p-3 border-r border-neutral-700 bg-neutral-800/30">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${track.color}`} />
                <span className="text-sm font-medium text-neutral-300">{track.name}</span>
              </div>
            </div>
            
            <div className="flex-1 relative h-16 bg-neutral-800/10">
              {clips
                .filter(clip => clip.track === track.id)
                .map((clip) => {
                  const ClipIcon = getClipIcon(clip.type);
                  const left = (clip.startTime / (duration * zoom)) * 100;
                  const width = ((clip.endTime - clip.startTime) / (duration * zoom)) * 100;
                  
                  return (
                    <motion.div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 rounded-lg border-2 cursor-pointer ${
                        selectedClip === clip.id 
                          ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' 
                          : 'border-transparent hover:border-neutral-500'
                      } ${getClipColor(clip.type)}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClip(clip.id);
                      }}
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="flex items-center justify-between h-full px-2">
                        <div className="flex items-center space-x-1 min-w-0">
                          <ClipIcon size={12} className="text-white flex-shrink-0" />
                          <span className="text-xs text-white truncate font-medium">
                            {clip.name}
                          </span>
                        </div>
                        
                        {clip.type === 'generated' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap size={10} className="text-cyan-300" />
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Waveform for audio clips */}
                      {clip.type === 'audio' && clip.waveform && (
                        <div className="absolute bottom-1 left-2 right-2 h-2 flex items-end space-x-px">
                          {clip.waveform.slice(0, 20).map((amplitude, i) => (
                            <div
                              key={i}
                              className="bg-white/60 rounded-sm"
                              style={{ height: `${amplitude * 100}%`, minHeight: '2px' }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: `${200 + (currentTime / (duration * zoom)) * (100)}%` }}
        >
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* Clip Inspector */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div
            className="border-t border-neutral-700 bg-neutral-800/50 p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {(() => {
              const clip = clips.find(c => c.id === selectedClip);
              if (!clip) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Clip Properties</h4>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                        <Scissors size={16} />
                      </button>
                      <button 
                        onClick={() => onClipDelete(clip.id)}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={clip.name}
                        onChange={(e) => onClipEdit(clip.id, { name: e.target.value })}
                        onBlur={(e) => trackFeedback('rename_clip', 'timeline_editor', e.target.value, 'VideoTimeline')}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formatTime(clip.duration)}
                        readOnly
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-400 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Start Time</label>
                      <input
                        type="number"
                        value={clip.startTime}
                        onChange={(e) => onClipEdit(clip.id, { startTime: parseFloat(e.target.value) })}
                        onBlur={(e) => trackFeedback('adjust_start_time', 'timeline_editor', parseFloat(e.target.value), 'VideoTimeline')}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Track</label>
                      <select
                        value={clip.track}
                        onChange={(e) => onClipEdit(clip.id, { track: parseInt(e.target.value) })}
                        onBlur={(e) => trackFeedback('change_track', 'timeline_editor', parseInt(e.target.value), 'VideoTimeline')}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {tracks.map(track => (
                          <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {clip.metadata && (
                    <div className="bg-neutral-700/50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-neutral-300 mb-2">Metadata</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(clip.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-neutral-400 capitalize">{key}:</span>
                            <span className="text-white ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}