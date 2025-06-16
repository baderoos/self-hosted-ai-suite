import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNexus } from '../core/NexusContext';
import { 
  Brain, 
  Zap, 
  Sparkles, 
  Eye, 
  Mic, 
  Video, 
  Image,
  Wand2,
  Send,
  Cpu,
  Activity,
  Command,
  ArrowRight,
  Layers,
  Orbit,
  Atom,
  Waves
} from 'lucide-react';

interface NeuralNode {
  id: string;
  type: 'input' | 'processing' | 'output' | 'memory';
  position: { x: number; y: number };
  connections: string[];
  activity: number;
  label: string;
  icon: any;
}

interface NeuralCommand {
  id: string;
  text: string;
  confidence: number;
  intent: string;
  entities: Array<{ type: string; value: string; confidence: number }>;
  suggestions: string[];
}

export function NeuralCommandInterface() {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackInteraction, getPersonalizedSuggestions } = useNexus();
  const [neuralActivity, setNeuralActivity] = useState(0);
  const [parsedCommand, setParsedCommand] = useState<NeuralCommand | null>(null);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Neural network nodes
  const [neuralNodes] = useState<NeuralNode[]>([
    // Input layer
    { id: 'input-1', type: 'input', position: { x: 50, y: 100 }, connections: ['proc-1', 'proc-2'], activity: 0, label: 'Text Input', icon: Command },
    { id: 'input-2', type: 'input', position: { x: 50, y: 200 }, connections: ['proc-1', 'proc-3'], activity: 0, label: 'Context', icon: Brain },
    { id: 'input-3', type: 'input', position: { x: 50, y: 300 }, connections: ['proc-2', 'proc-3'], activity: 0, label: 'Intent', icon: Eye },
    
    // Processing layer
    { id: 'proc-1', type: 'processing', position: { x: 200, y: 80 }, connections: ['proc-4', 'mem-1'], activity: 0, label: 'NLP Engine', icon: Cpu },
    { id: 'proc-2', type: 'processing', position: { x: 200, y: 160 }, connections: ['proc-4', 'proc-5'], activity: 0, label: 'Intent Parser', icon: Zap },
    { id: 'proc-3', type: 'processing', position: { x: 200, y: 240 }, connections: ['proc-5', 'mem-2'], activity: 0, label: 'Entity Extractor', icon: Layers },
    { id: 'proc-4', type: 'processing', position: { x: 350, y: 120 }, connections: ['output-1'], activity: 0, label: 'Command Synthesizer', icon: Wand2 },
    { id: 'proc-5', type: 'processing', position: { x: 350, y: 200 }, connections: ['output-2'], activity: 0, label: 'Confidence Scorer', icon: Activity },
    
    // Memory layer
    { id: 'mem-1', type: 'memory', position: { x: 200, y: 320 }, connections: ['proc-4'], activity: 0, label: 'Context Memory', icon: Orbit },
    { id: 'mem-2', type: 'memory', position: { x: 350, y: 280 }, connections: ['proc-5'], activity: 0, label: 'Pattern Memory', icon: Atom },
    
    // Output layer
    { id: 'output-1', type: 'output', position: { x: 500, y: 120 }, connections: [], activity: 0, label: 'Command Output', icon: Send },
    { id: 'output-2', type: 'output', position: { x: 500, y: 200 }, connections: [], activity: 0, label: 'Suggestions', icon: Sparkles },
  ]);

  const [nodeActivities, setNodeActivities] = useState<Record<string, number>>({});

  // Advanced command parsing with AI simulation
  const parseCommand = useCallback(async (text: string): Promise<NeuralCommand> => {
    setIsProcessing(true);
    setNeuralActivity(0.8);
    
    // Simulate neural network processing
    const processingSteps = [
      { nodes: ['input-1', 'input-2'], delay: 200 },
      { nodes: ['proc-1', 'proc-2'], delay: 300 },
      { nodes: ['proc-3', 'mem-1'], delay: 250 },
      { nodes: ['proc-4', 'proc-5'], delay: 400 },
      { nodes: ['mem-2', 'output-1', 'output-2'], delay: 300 },
    ];

    for (const step of processingSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setNodeActivities(prev => {
        const newActivities = { ...prev };
        step.nodes.forEach(nodeId => {
          newActivities[nodeId] = Math.random() * 0.8 + 0.2;
        });
        return newActivities;
      });
    }

    // Advanced intent recognition
    const intents = {
      'generate': /generate|create|make|produce|build/i,
      'edit': /edit|modify|change|adjust|alter/i,
      'analyze': /analyze|examine|study|review|inspect/i,
      'enhance': /enhance|improve|optimize|upgrade|refine/i,
      'transform': /transform|convert|change|morph|adapt/i,
    };

    let detectedIntent = 'unknown';
    let confidence = 0.5;

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(text)) {
        detectedIntent = intent;
        confidence = 0.85 + Math.random() * 0.1;
        break;
      }
    }

    // Entity extraction
    const entities = [];
    const videoModels = ['hunyuan', 'sora', 'mochi'];
    const styles = ['cinematic', 'anime', 'realistic', 'artistic'];
    const durations = text.match(/(\d+)\s*(second|minute|hour)s?/gi);
    
    videoModels.forEach(model => {
      if (text.toLowerCase().includes(model)) {
        entities.push({ type: 'model', value: model, confidence: 0.9 });
      }
    });

    styles.forEach(style => {
      if (text.toLowerCase().includes(style)) {
        entities.push({ type: 'style', value: style, confidence: 0.85 });
      }
    });

    if (durations) {
      entities.push({ type: 'duration', value: durations[0], confidence: 0.8 });
    }

    // Generate intelligent suggestions
    const suggestions = [
      `${detectedIntent} a cinematic video with dramatic lighting`,
      `${detectedIntent} using HunyuanVideo model for high quality`,
      `${detectedIntent} with 16:9 aspect ratio for social media`,
      `${detectedIntent} and apply color grading for professional look`,
    ];

    setIsProcessing(false);
    setNeuralActivity(0.2);

    return {
      id: `cmd_${Date.now()}`,
      text,
      confidence,
      intent: detectedIntent,
      entities,
      suggestions: suggestions.slice(0, 3),
    };
  }, []);

  // Handle command input
  const handleCommandChange = useCallback(async (value: string) => {
    setCommand(value);
    
    // Track interaction with Echo AI
    if (value.length > 3) {
      trackInteraction({
        userId: 'current_user',
        module: 'neural',
        action: 'input_command',
        context: { command: value }
      });
    }
    
    if (value.length > 3) {
      const parsed = await parseCommand(value);
      setParsedCommand(parsed);
    } else {
      setParsedCommand(null);
      setNodeActivities({});
    }
  }, [parseCommand]);

  // Neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showNeuralNetwork) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      neuralNodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const targetNode = neuralNodes.find(n => n.id === connectionId);
          if (targetNode) {
            const activity = (nodeActivities[node.id] || 0) * (nodeActivities[connectionId] || 0);
            
            ctx.beginPath();
            ctx.moveTo(node.position.x, node.position.y);
            ctx.lineTo(targetNode.position.x, targetNode.position.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 + activity * 0.6})`;
            ctx.lineWidth = 1 + activity * 3;
            ctx.stroke();
            
            // Animated particles along connections
            if (activity > 0.3) {
              const progress = (Date.now() / 1000) % 1;
              const x = node.position.x + (targetNode.position.x - node.position.x) * progress;
              const y = node.position.y + (targetNode.position.y - node.position.y) * progress;
              
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(20, 184, 166, ${activity})`;
              ctx.fill();
            }
          }
        });
      });
      
      // Draw nodes
      neuralNodes.forEach(node => {
        const activity = nodeActivities[node.id] || 0;
        const baseRadius = 8;
        const radius = baseRadius + activity * 6;
        
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, radius, 0, Math.PI * 2);
        
        const colors = {
          input: `rgba(34, 197, 94, ${0.3 + activity * 0.7})`,
          processing: `rgba(99, 102, 241, ${0.3 + activity * 0.7})`,
          memory: `rgba(168, 85, 247, ${0.3 + activity * 0.7})`,
          output: `rgba(239, 68, 68, ${0.3 + activity * 0.7})`,
        };
        
        ctx.fillStyle = colors[node.type];
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + activity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [showNeuralNetwork, nodeActivities, neuralNodes]);

  // Mouse tracking for neural field effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Get personalized suggestions from Echo AI
  const echoSuggestions = getPersonalizedSuggestions('neural');
  
  // Combine with default suggestions
  const commandSuggestions = echoSuggestions.length > 0 
    ? echoSuggestions.map(s => s.title || s.description).slice(0, 3).concat([
      "Generate a cinematic video of a dragon soaring through clouds",
      "Create an anime-style character transformation sequence"
    ]).slice(0, 5)
    : [
    "Generate a cinematic video of a dragon soaring through clouds",
    "Create an anime-style character transformation sequence",
    "Produce a realistic product showcase with dramatic lighting",
    "Make a sci-fi trailer with epic music and color grading",
    "Generate a nature documentary scene with wildlife",
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-purple-950 to-indigo-950 overflow-hidden">
      {/* Neural Field Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        onMouseMove={handleMouseMove}
        style={{
          background: `radial-gradient(circle at ${springX}px ${springY}px, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating Neural Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-4 mb-6"
            animate={{
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.5)",
                "0 0 40px rgba(99, 102, 241, 0.8)",
                "0 0 20px rgba(99, 102, 241, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Echo Neural Interface
              </h1>
              <p className="text-purple-300">
                Advanced natural language interface for Echo AI
              </p>
            </div>
          </motion.div>
          
          <motion.p
            className="text-lg text-purple-200 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Communicate with your AI using natural language. The neural network understands context, 
            intent, and learns from your interactions to provide personalized suggestions.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Command Input Panel */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Neural Command Input</h2>
                <motion.button
                  onClick={() => setShowNeuralNetwork(!showNeuralNetwork)}
                  className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-xl text-purple-200 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Waves size={16} />
                  <span>{showNeuralNetwork ? 'Hide' : 'Show'} Neural Network</span>
                </motion.button>
              </div>

              {/* Command Input */}
              <div className="relative mb-6">
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: isProcessing ? [
                      "0 0 0 0 rgba(99, 102, 241, 0.4)",
                      "0 0 0 20px rgba(99, 102, 241, 0)",
                    ] : "0 0 0 0 rgba(99, 102, 241, 0)"
                  }}
                  transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={(e) => handleCommandChange(e.target.value)}
                    placeholder="Describe what you want to create using natural language..."
                    className="w-full px-6 py-4 bg-white/10 border border-purple-400/30 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-lg"
                  />
                  <motion.div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    animate={{ rotate: isProcessing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
                  >
                    <Brain size={24} className={`${isProcessing ? 'text-cyan-400' : 'text-purple-400'} transition-colors`} />
                  </motion.div>
                </motion.div>
              </div>

              {/* Neural Activity Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">Neural Activity</span>
                  <span className="text-sm text-cyan-400">{Math.round(neuralActivity * 100)}%</span>
                </div>
                <div className="w-full bg-purple-900/30 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${neuralActivity * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Parsed Command Display */}
              <AnimatePresence>
                {parsedCommand && (
                  <motion.div
                    className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Zap size={20} className="text-cyan-400" />
                      <span>Neural Analysis</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-purple-300 mb-1">Intent</div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-cyan-600/30 rounded-full text-cyan-200 text-sm font-medium">
                            {parsedCommand.intent}
                          </span>
                          <span className="text-xs text-purple-400">
                            {Math.round(parsedCommand.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-purple-300 mb-1">Entities</div>
                        <div className="flex flex-wrap gap-1">
                          {parsedCommand.entities.map((entity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-600/30 rounded-md text-purple-200 text-xs"
                            >
                              {entity.type}: {entity.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <div className="text-sm text-purple-300 mb-2">AI Suggestions</div>
                      <div className="space-y-2">
                        {parsedCommand.suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleCommandChange(suggestion)}
                            className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-purple-100 text-sm transition-colors flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <ArrowRight size={14} className="text-cyan-400" />
                            <span>{suggestion}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Suggestions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Commands</h3>
                <div className="grid grid-cols-1 gap-2">
                  {commandSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleCommandChange(suggestion)}
                      className="text-left px-4 py-3 bg-gradient-to-r from-purple-800/20 to-cyan-800/20 hover:from-purple-700/30 hover:to-cyan-700/30 rounded-xl text-purple-200 transition-all duration-300 border border-purple-500/20 hover:border-cyan-500/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Sparkles size={16} className="text-cyan-400" />
                        <span>{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Neural Network Visualization */}
          <motion.div
            className="xl:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Atom size={20} className="text-cyan-400" />
                <span>Neural Network</span>
              </h3>
              
              <AnimatePresence>
                {showNeuralNetwork && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={300}
                      className="w-full h-auto bg-black/20 rounded-xl border border-purple-500/20"
                    />
                    
                    {/* Node Legend */}
                    <div className="mt-4 space-y-2">
                      {[
                        { type: 'input', color: 'bg-emerald-500', label: 'Input Layer' },
                        { type: 'processing', color: 'bg-blue-500', label: 'Processing Layer' },
                        { type: 'memory', color: 'bg-purple-500', label: 'Memory Layer' },
                        { type: 'output', color: 'bg-red-500', label: 'Output Layer' },
                      ].map((item) => (
                        <div key={item.type} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 ${item.color} rounded-full`} />
                          <span className="text-sm text-purple-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!showNeuralNetwork && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain size={48} className="text-purple-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-purple-300">
                    Click "Show Neural Network" to visualize AI processing
                  </p>
                </div>
              )}

              {/* Processing Stats */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-purple-300">Processing Stats</h4>
                {[
                  { label: 'Tokens Processed', value: command.split(' ').length },
                  { label: 'Neural Pathways', value: Object.keys(nodeActivities).length },
                  { label: 'Confidence Score', value: Math.round((parsedCommand?.confidence || 0) * 100) },
                  { label: 'Processing Speed', value: '2.4ms' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <span className="text-sm text-purple-400">{stat.label}</span>
                    <span className="text-sm font-medium text-cyan-400">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}