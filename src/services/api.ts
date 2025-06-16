// Enhanced API Service for MCP Backend Integration with Authentication, File Upload, and WebSocket
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.mcpsuite.com';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface MCPCommand {
  command: string;
  workflow_type?: string;
  parameters?: Record<string, any>;
  model?: string;
  duration?: number;
  style?: string;
  aspect_ratio?: string;
}

interface MCPResponse {
  task_id: string;
  status: string;
  message: string;
  estimated_duration?: string;
  agents_deployed?: string[];
}

export interface TaskStatus {
  task_id: string;
  status: string;
  progress: number;
  current_step: string;
  logs: string[];
  result?: {
    primary_edit?: string;
    social_clips?: string[];
    audio_master?: string;
    metadata?: Record<string, any>;
  };
}

export interface SystemStatus {
  api_status: string;
  redis_status: string;
  active_task_count: number;
  redis_memory_usage: string;
  redis_connected_clients: string;
  uptime: string;
  websocket_connections?: {
    total_users: number;
    total_connections: number;
    users_online: string[];
  };
  storage_stats?: {
    total_files: number;
    total_size: number;
    categories: Record<string, { count: number; size: number }>;
  };
}

export interface User {
  username: string;
  email: string;
  full_name?: string;
  disabled?: boolean;
  scopes: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FileUploadResponse {
  file_id: string;
  original_name: string;
  content_type: string;
  file_size: number;
  upload_time: string;
  metadata: Record<string, any>;
}

interface VideoGenerationRequest {
  prompt: string;
  model: string;
  duration: number;
  style: string;
  aspect_ratio: string;
}

interface VideoGenerationResponse {
  task_id: string;
  status: string;
  message: string;
  estimated_duration: string;
  video_url?: string;
  thumbnail_url?: string;
}

export interface WebSocketMessage {
  type: 'task_update' | 'file_uploaded' | 'files_uploaded' | 'file_deleted' | 'system_alert' | 'connection_established' | 'pong';
  data?: any;
  timestamp?: number;
}

// AI Persona interfaces
interface PersonaFeedback {
  id: string;
  action: string;
  context: string;
  value: any;
  timestamp: string;
  component: string;
  userId: string;
}

interface StyleProfile {
  editingStyle: Record<string, any>;
  colorGrading: Record<string, any>;
  audioStyle: Record<string, any>;
  contentPreferences: Record<string, any>;
  platformOptimization: Record<string, any>;
}

interface PersonaInsight {
  id: string;
  category: string;
  insight: string;
  confidence: number;
  examples: string[];
  applied: boolean;
  timestamp: string;
}

// Google AI Studio Integration interfaces
export interface GoogleAIModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface SafetySettings {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE';
}

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  responseSchema?: any;
}

export interface AgentConfiguration {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  generationConfig: GenerationConfig;
  safetySettings: SafetySettings[];
  functions?: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FineTuningJob {
  id: string;
  baseModel: string;
  displayName: string;
  state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  createTime: string;
  completeTime?: string;
  trainingExamples: number;
  validationExamples: number;
  epochs: number;
  learningRate: number;
}

export interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
        functionCall?: {
          name: string;
          args: Record<string, any>;
        };
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

// Proactive Content Pipeline interfaces
export interface ProactiveGoal {
  id: string;
  topic: string;
  platforms: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  lastBriefGenerated?: string;
}

export interface ContentBrief {
  id: string;
  goalId: string;
  title: string;
  description: string;
  trendData: {
    searchVolume: string;
    competition: string;
    viralityScore: number;
    trendingKeywords: string[];
  };
  suggestedFormat: string;
  estimatedEngagement: string;
  urgency: 'high' | 'medium' | 'low';
  generatedAt: string;
  deployed: boolean;
}

export interface ProactiveBriefNotification {
  id: string;
  message: string;
  briefCount: number;
  timestamp: string;
  dismissed: boolean;
}

// Mock data for demo purposes since we're removing self-hosting
const MOCK_USERS = {
  director: {
    username: 'director',
    email: 'director@mcpsuite.com',
    full_name: 'AI Director',
    scopes: ['read', 'write', 'admin']
  },
  operator: {
    username: 'operator',
    email: 'operator@mcpsuite.com',
    full_name: 'MCP Operator',
    scopes: ['read', 'write']
  }
};

// Mutable mock tasks array to ensure consistency
let MOCK_TASKS: TaskStatus[] = [
  {
    task_id: 'demo-task-1',
    status: 'completed',
    progress: 100,
    current_step: 'Complete',
    logs: [
      '[14:32:15] MCP directive received: The Podcast Workflow',
      '[14:32:16] Deploying Multi-Cam AI agent...',
      '[14:32:18] Analyzing video streams for sync points...',
      '[14:32:45] Audio processing with Transcriber AI...',
      '[14:33:12] Generating social clips with Social Clip AI...',
      '[14:34:28] Task completed successfully'
    ],
    result: {
      primary_edit: 'podcast_edit_v1.mp4',
      social_clips: ['clip_1.mp4', 'clip_2.mp4', 'clip_3.mp4'],
      audio_master: 'podcast_audio_master.wav',
      metadata: {
        duration: '1:23:45',
        resolution: '4K',
        format: 'MP4'
      }
    }
  }
];

// Mock proactive content data
let MOCK_PROACTIVE_GOALS: ProactiveGoal[] = [];
let MOCK_CONTENT_BRIEFS: ContentBrief[] = [];

class APIService {
  private token: string | null = null;
  private websocket: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private wsMessageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private mockMode = true; // Enable mock mode for demo

  // Google AI API Key management
  private googleAIApiKey: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    this.googleAIApiKey = localStorage.getItem('google_ai_api_key');
  }

  // Google AI API Key methods
  setGoogleAIApiKey(apiKey: string): void {
    this.googleAIApiKey = apiKey;
    localStorage.setItem('google_ai_api_key', apiKey);
  }

  getGoogleAIApiKey(): string | null {
    return this.googleAIApiKey;
  }

  clearGoogleAIApiKey(): void {
    this.googleAIApiKey = null;
    localStorage.removeItem('google_ai_api_key');
  }

  // Google AI Studio Methods
  async listGoogleAIModels(): Promise<GoogleAIModel[]> {
    if (this.mockMode) {
      return [
        {
          name: 'models/gemini-1.5-pro',
          displayName: 'Gemini 1.5 Pro',
          description: 'The most capable multimodal model with 1M token context window',
          inputTokenLimit: 1000000,
          outputTokenLimit: 8192,
          supportedGenerationMethods: ['generateContent', 'streamGenerateContent'],
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        },
        {
          name: 'models/gemini-1.5-flash',
          displayName: 'Gemini 1.5 Flash',
          description: 'Fast and efficient model for quick responses',
          inputTokenLimit: 1000000,
          outputTokenLimit: 8192,
          supportedGenerationMethods: ['generateContent', 'streamGenerateContent'],
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        }
      ];
    }

    if (!this.googleAIApiKey) {
      throw new Error('Google AI API key not configured');
    }

    const response = await fetch(`${GOOGLE_AI_API_URL}/models?key=${this.googleAIApiKey}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Google AI models');
    }

    const data = await response.json();
    return data.models || [];
  }

  async generateContentWithGoogleAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    config: GenerationConfig = {},
    safetySettings: SafetySettings[] = []
  ): Promise<GoogleAIResponse> {
    if (this.mockMode) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      return {
        candidates: [{
          content: {
            parts: [{
              text: `Mock response from ${model}:\n\nSystem: ${systemPrompt}\n\nUser: ${userPrompt}\n\nThis is a simulated response for testing the Studio Mode interface. The actual response would be generated by Google's AI models.`
            }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0,
          safetyRatings: []
        }]
      };
    }

    if (!this.googleAIApiKey) {
      throw new Error('Google AI API key not configured');
    }

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: userPrompt }
          ]
        }
      ],
      generationConfig: config,
      safetySettings
    };

    const response = await fetch(
      `${GOOGLE_AI_API_URL}/models/${model}:generateContent?key=${this.googleAIApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    return response.json();
  }

  // Agent Configuration Management
  async saveAgentConfiguration(config: AgentConfiguration): Promise<{ success: boolean }> {
    if (this.mockMode) {
      // Store in localStorage for demo
      const configs = JSON.parse(localStorage.getItem('agent_configurations') || '[]');
      const existingIndex = configs.findIndex((c: AgentConfiguration) => c.id === config.id);
      
      if (existingIndex >= 0) {
        configs[existingIndex] = config;
      } else {
        configs.push(config);
      }
      
      localStorage.setItem('agent_configurations', JSON.stringify(configs));
      return { success: true };
    }

    return this.request<{ success: boolean }>('/agents/configurations', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getAgentConfiguration(agentId: string): Promise<AgentConfiguration | null> {
    if (this.mockMode) {
      const configs = JSON.parse(localStorage.getItem('agent_configurations') || '[]');
      return configs.find((c: AgentConfiguration) => c.id === agentId) || null;
    }

    try {
      return await this.request<AgentConfiguration>(`/agents/configurations/${agentId}`);
    } catch {
      return null;
    }
  }

  async listAgentConfigurations(): Promise<AgentConfiguration[]> {
    if (this.mockMode) {
      return JSON.parse(localStorage.getItem('agent_configurations') || '[]');
    }

    return this.request<AgentConfiguration[]>('/agents/configurations');
  }

  // Fine-tuning Methods
  async createFineTuningJob(
    baseModel: string,
    displayName: string,
    trainingData: File
  ): Promise<FineTuningJob> {
    if (this.mockMode) {
      const job: FineTuningJob = {
        id: `ft-job-${Date.now()}`,
        baseModel,
        displayName,
        state: 'PENDING',
        createTime: new Date().toISOString(),
        trainingExamples: Math.floor(Math.random() * 1000) + 100,
        validationExamples: Math.floor(Math.random() * 200) + 20,
        epochs: 3,
        learningRate: 0.001
      };

      // Simulate job progression
      setTimeout(() => {
        const jobs = JSON.parse(localStorage.getItem('fine_tuning_jobs') || '[]');
        const jobIndex = jobs.findIndex((j: FineTuningJob) => j.id === job.id);
        if (jobIndex >= 0) {
          jobs[jobIndex].state = 'RUNNING';
          localStorage.setItem('fine_tuning_jobs', JSON.stringify(jobs));
        }
      }, 2000);

      setTimeout(() => {
        const jobs = JSON.parse(localStorage.getItem('fine_tuning_jobs') || '[]');
        const jobIndex = jobs.findIndex((j: FineTuningJob) => j.id === job.id);
        if (jobIndex >= 0) {
          jobs[jobIndex].state = 'SUCCEEDED';
          jobs[jobIndex].completeTime = new Date().toISOString();
          localStorage.setItem('fine_tuning_jobs', JSON.stringify(jobs));
        }
      }, 10000);

      const jobs = JSON.parse(localStorage.getItem('fine_tuning_jobs') || '[]');
      jobs.push(job);
      localStorage.setItem('fine_tuning_jobs', JSON.stringify(jobs));

      return job;
    }

    const formData = new FormData();
    formData.append('base_model', baseModel);
    formData.append('display_name', displayName);
    formData.append('training_data', trainingData);

    return this.request<FineTuningJob>('/fine-tuning/jobs', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
    });
  }

  async listFineTuningJobs(): Promise<FineTuningJob[]> {
    if (this.mockMode) {
      return JSON.parse(localStorage.getItem('fine_tuning_jobs') || '[]');
    }

    return this.request<FineTuningJob[]>('/fine-tuning/jobs');
  }

  async getFineTuningJob(jobId: string): Promise<FineTuningJob> {
    if (this.mockMode) {
      const jobs = JSON.parse(localStorage.getItem('fine_tuning_jobs') || '[]');
      const job = jobs.find((j: FineTuningJob) => j.id === jobId);
      if (!job) {
        throw new Error('Fine-tuning job not found');
      }
      return job;
    }

    return this.request<FineTuningJob>(`/fine-tuning/jobs/${jobId}`);
  }

  // Mock video generation for demo
  private async mockVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const taskId = `video_${Date.now()}`;
    
    // Create a mock video file entry
    const mockVideoFile: FileUploadResponse = {
      file_id: taskId,
      original_name: `generated_video_${request.model}_${Date.now()}.mp4`,
      content_type: 'video/mp4',
      file_size: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
      upload_time: new Date().toISOString(),
      metadata: {
        model: request.model,
        prompt: request.prompt,
        duration: request.duration,
        style: request.style,
        aspect_ratio: request.aspect_ratio,
        resolution: request.model === 'hunyuan-video' ? '1280x720' : 
                   request.model === 'open-sora' ? '1024x576' : '768x768',
        generated: true
      }
    };
    
    // Add to mock files list (simulating cloud storage)
    this.mockGeneratedFiles.push(mockVideoFile);
    
    return {
      task_id: taskId,
      status: 'completed',
      message: 'Video generated successfully',
      estimated_duration: `${request.duration}s`,
      video_url: `https://storage.mcpsuite.com/videos/${taskId}.mp4`,
      thumbnail_url: `https://storage.mcpsuite.com/thumbnails/${taskId}.jpg`
    };
  }

  // Mock proactive content brief generation
  private async mockGenerateContentBriefs(goal: ProactiveGoal): Promise<ContentBrief[]> {
    // Simulate background processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const briefTemplates = [
      {
        titleTemplate: "The Rise of {topic}: What You Need to Know",
        descriptionTemplate: "Explore the latest trends in {topic} and discover why it's becoming the next big thing.",
        format: "Educational Deep-Dive",
        urgency: 'high' as const
      },
      {
        titleTemplate: "{topic} Myths Debunked: The Truth Revealed",
        descriptionTemplate: "Separate fact from fiction in the world of {topic} with this myth-busting analysis.",
        format: "Myth-Busting",
        urgency: 'medium' as const
      },
      {
        titleTemplate: "5 {topic} Trends That Will Change Everything",
        descriptionTemplate: "Discover the emerging trends in {topic} that industry experts are talking about.",
        format: "Trend Analysis",
        urgency: 'medium' as const
      },
      {
        titleTemplate: "Why {topic} is Trending Right Now",
        descriptionTemplate: "Uncover the reasons behind the sudden surge in {topic} popularity and what it means for the future.",
        format: "Trend Explanation",
        urgency: 'high' as const
      }
    ];
    
    const numBriefs = Math.floor(Math.random() * 3) + 2; // 2-4 briefs
    const briefs: ContentBrief[] = [];
    
    for (let i = 0; i < numBriefs; i++) {
      const template = briefTemplates[Math.floor(Math.random() * briefTemplates.length)];
      const brief: ContentBrief = {
        id: `brief_${Date.now()}_${i}`,
        goalId: goal.id,
        title: template.titleTemplate.replace('{topic}', goal.topic),
        description: template.descriptionTemplate.replace('{topic}', goal.topic),
        trendData: {
          searchVolume: ['High', 'Medium', 'Rising'][Math.floor(Math.random() * 3)],
          competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          viralityScore: Math.floor(Math.random() * 40) + 60, // 60-100
          trendingKeywords: [
            `${goal.topic} trends`,
            `${goal.topic} 2024`,
            `best ${goal.topic}`,
            `${goal.topic} tips`,
            `${goal.topic} guide`
          ].slice(0, Math.floor(Math.random() * 3) + 2)
        },
        suggestedFormat: template.format,
        estimatedEngagement: `${Math.floor(Math.random() * 50) + 20}K views`,
        urgency: template.urgency,
        generatedAt: new Date().toISOString(),
        deployed: false
      };
      
      briefs.push(brief);
    }
    
    return briefs;
  }

  private mockGeneratedFiles: FileUploadResponse[] = [];

  private async mockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    // Mock authentication endpoints
    if (endpoint === '/auth/login') {
      const body = JSON.parse(options.body as string);
      const user = MOCK_USERS[body.username as keyof typeof MOCK_USERS];
      
      if (user && body.password === 'secret') {
        return {
          access_token: `mock_token_${body.username}_${Date.now()}`,
          token_type: 'bearer',
          expires_in: 3600
        } as T;
      } else {
        throw new Error('Invalid credentials');
      }
    }

    if (endpoint === '/auth/me') {
      if (!this.token) throw new Error('Authentication required');
      const username = this.token.includes('director') ? 'director' : 'operator';
      return MOCK_USERS[username] as T;
    }

    // Mock proactive content endpoints
    if (endpoint === '/proactive/goals') {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body as string);
        const newGoal: ProactiveGoal = {
          id: `goal_${Date.now()}`,
          topic: body.topic,
          platforms: body.platforms || ['YouTube', 'TikTok', 'Instagram'],
          frequency: body.frequency || 'daily',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        MOCK_PROACTIVE_GOALS.push(newGoal);
        
        // Simulate background brief generation
        setTimeout(async () => {
          const briefs = await this.mockGenerateContentBriefs(newGoal);
          MOCK_CONTENT_BRIEFS.push(...briefs);
          
          // Update goal with last brief generated time
          const goalIndex = MOCK_PROACTIVE_GOALS.findIndex(g => g.id === newGoal.id);
          if (goalIndex !== -1) {
            MOCK_PROACTIVE_GOALS[goalIndex].lastBriefGenerated = new Date().toISOString();
          }
        }, 3000);
        
        return newGoal as T;
      }
      return { goals: MOCK_PROACTIVE_GOALS } as T;
    }
    
    if (endpoint === '/proactive/briefs') {
      return { briefs: MOCK_CONTENT_BRIEFS } as T;
    }
    
    if (endpoint.startsWith('/proactive/briefs/') && endpoint.endsWith('/deploy')) {
      const briefId = endpoint.split('/')[3];
      const briefIndex = MOCK_CONTENT_BRIEFS.findIndex(b => b.id === briefId);
      if (briefIndex !== -1) {
        MOCK_CONTENT_BRIEFS[briefIndex].deployed = true;
      }
      return { success: true } as T;
    }

    // Mock system status
    if (endpoint === '/system-status') {
      return {
        api_status: 'operational',
        redis_status: 'connected',
        active_task_count: MOCK_TASKS.length,
        redis_memory_usage: '45.2MB',
        redis_connected_clients: '3',
        uptime: '7 days, 14 hours',
        websocket_connections: {
          total_users: 1,
          total_connections: 1,
          users_online: ['demo_user']
        },
        storage_stats: {
          total_files: 156,
          total_size: 2847392847,
          categories: {
            videos: { count: 89, size: 2340958473 },
            images: { count: 45, size: 394857392 },
            audio: { count: 22, size: 111577982 }
          }
        }
      } as T;
    }

    // Mock health check
    if (endpoint === '/') {
      return {
        message: 'MCP AI Content Suite API v2.0',
        status: 'operational',
        redis_status: 'connected',
        version: '2.0.0',
        features: ['authentication', 'file_upload', 'websockets', 'cloud_processing']
      } as T;
    }

    // Mock active tasks
    if (endpoint === '/active-tasks') {
      return { active_tasks: MOCK_TASKS } as T;
    }

    // Mock task status by ID
    if (endpoint.startsWith('/task-status/')) {
      const taskId = endpoint.split('/task-status/')[1];
      const task = MOCK_TASKS.find(t => t.task_id === taskId);
      
      if (task) {
        return task as T;
      } else {
        // Return a default task structure with empty logs array if task not found
        return {
          task_id: taskId,
          status: 'not_found',
          progress: 0,
          current_step: 'Task not found',
          logs: []
        } as T;
      }
    }

    // Mock MCP command execution
    if (endpoint === '/mcp-command') {
      const taskId = `task_${Date.now()}`;
      const body = JSON.parse(options.body as string);
      
      // Check if this is a video generation request
      if (body.workflow_type === 'video-generation' || body.model) {
        const videoRequest: VideoGenerationRequest = {
          prompt: body.command,
          model: body.model || 'hunyuan-video',
          duration: body.duration || 5,
          style: body.style || 'cinematic',
          aspect_ratio: body.aspect_ratio || '16:9'
        };
        
        const videoResponse = await this.mockVideoGeneration(videoRequest);
        
        return {
          task_id: videoResponse.task_id,
          status: videoResponse.status,
          message: videoResponse.message,
          estimated_duration: videoResponse.estimated_duration,
          agents_deployed: ['Video Generation AI', 'Style Transfer AI', 'Quality Enhancement AI'],
          result: {
            video_url: videoResponse.video_url,
            thumbnail_url: videoResponse.thumbnail_url,
            metadata: {
              model: videoRequest.model,
              duration: videoRequest.duration,
              style: videoRequest.style,
              aspect_ratio: videoRequest.aspect_ratio
            }
          }
        } as T;
      }
      
      const newTask: TaskStatus = {
        task_id: taskId,
        status: 'initiated',
        progress: 0,
        current_step: 'Initializing MCP directive...',
        logs: [
          `[${new Date().toLocaleTimeString()}] MCP directive received`,
          `[${new Date().toLocaleTimeString()}] Initializing AI agents...`
        ]
      };
      
      // Add the new task to our mock tasks array
      MOCK_TASKS.push(newTask);
      
      return {
        task_id: taskId,
        status: 'initiated',
        message: 'MCP directive received and processing initiated',
        estimated_duration: '2-3 minutes',
        agents_deployed: ['Transcriber AI', 'Vision AI', 'Audio AI']
      } as T;
    }

    // Mock file operations
    if (endpoint.startsWith('/files')) {
      // Include generated videos in file list
      return { files: this.mockGeneratedFiles } as T;
    }

    if (endpoint.startsWith('/storage/stats')) {
      return {
        total_files: 156 + this.mockGeneratedFiles.length,
        total_size: 2847392847 + this.mockGeneratedFiles.reduce((sum, file) => sum + file.file_size, 0),
        categories: {
          videos: { 
            count: 89 + this.mockGeneratedFiles.filter(f => f.content_type.startsWith('video/')).length, 
            size: 2340958473 + this.mockGeneratedFiles.filter(f => f.content_type.startsWith('video/')).reduce((sum, file) => sum + file.file_size, 0)
          },
          images: { count: 45, size: 394857392 },
          audio: { count: 22, size: 111577982 }
        }
      } as T;
    }

    // Default mock response
    return { success: true } as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use mock mode for demo
    if (this.mockMode) {
      return this.mockRequest<T>(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout();
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Enhanced error handling for connection issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          `Unable to connect to the MCP cloud service. Please check your internet connection and try again.`
        );
      }
      
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    try {
      const response = await this.request<AuthToken>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.token = response.access_token;
      localStorage.setItem('auth_token', this.token);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.disconnectWebSocket();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // WebSocket Methods (Mock implementation for demo)
  connectWebSocket(userId: string): void {
    if (this.mockMode) {
      // Simulate WebSocket connection
      setTimeout(() => {
        this.wsMessageHandlers.forEach(handler => 
          handler({
            type: 'connection_established',
            data: { message: 'Connected to MCP cloud service', user_id: userId }
          })
        );
      }, 1000);
      return;
    }

    if (this.websocket?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = `wss://api.mcpsuite.com/ws/${userId}`;
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('WebSocket connected');
      this.wsReconnectAttempts = 0;
      
      // Send ping to keep connection alive
      setInterval(() => {
        if (this.websocket?.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    this.websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.wsMessageHandlers.forEach(handler => handler(message));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(userId);
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(userId: string): void {
    if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
      this.wsReconnectAttempts++;
      console.log(`Attempting WebSocket reconnection ${this.wsReconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connectWebSocket(userId);
      }, Math.pow(2, this.wsReconnectAttempts) * 1000); // Exponential backoff
    }
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  onWebSocketMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.wsMessageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.wsMessageHandlers.indexOf(handler);
      if (index > -1) {
        this.wsMessageHandlers.splice(index, 1);
      }
    };
  }

  subscribeToTask(taskId: string): void {
    if (this.mockMode) {
      // Simulate task updates with proper logs array
      setTimeout(() => {
        const task = MOCK_TASKS.find(t => t.task_id === taskId);
        if (task) {
          task.status = 'processing';
          task.progress = 45;
          task.current_step = 'Processing with AI agents...';
          task.logs = task.logs || []; // Ensure logs array exists
          task.logs.push(`[${new Date().toLocaleTimeString()}] Processing with AI agents...`);
          
          this.wsMessageHandlers.forEach(handler => 
            handler({
              type: 'task_update',
              data: task
            })
          );
        }
      }, 2000);
      return;
    }

    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'subscribe_task',
        task_id: taskId
      }));
    }
  }

  // File Upload Methods (Mock implementation)
  async uploadSingleFile(file: File): Promise<FileUploadResponse> {
    if (this.mockMode) {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        file_id: `file_${Date.now()}`,
        original_name: file.name,
        content_type: file.type,
        file_size: file.size,
        upload_time: new Date().toISOString(),
        metadata: {
          width: file.type.startsWith('image/') ? 1920 : undefined,
          height: file.type.startsWith('image/') ? 1080 : undefined,
          duration: file.type.startsWith('video/') ? 120 : undefined
        }
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[]): Promise<{
    uploaded_files: FileUploadResponse[];
    total_uploaded: number;
    total_requested: number;
  }> {
    if (this.mockMode) {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const uploaded_files = files.map(file => ({
        file_id: `file_${Date.now()}_${Math.random()}`,
        original_name: file.name,
        content_type: file.type,
        file_size: file.size,
        upload_time: new Date().toISOString(),
        metadata: {}
      }));

      return {
        uploaded_files,
        total_uploaded: files.length,
        total_requested: files.length
      };
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async listFiles(category?: string): Promise<{ files: FileUploadResponse[] }> {
    const params = category ? `?category=${category}` : '';
    return this.request<{ files: FileUploadResponse[] }>(`/files${params}`);
  }

  async getFileInfo(fileId: string): Promise<FileUploadResponse> {
    return this.request<FileUploadResponse>(`/files/${fileId}`);
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  getFileDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/files/${fileId}/download`;
  }

  async getStorageStats(): Promise<{
    total_files: number;
    total_size: number;
    categories: Record<string, { count: number; size: number }>;
  }> {
    return this.request('/storage/stats');
  }

  // MCP Command Methods
  async executeMCPCommand(command: MCPCommand): Promise<MCPResponse> {
    return this.request<MCPResponse>('/mcp-command', {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  // Task Management Methods
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.request<TaskStatus>(`/task-status/${taskId}`);
  }

  async getActiveTasks(): Promise<{ active_tasks: TaskStatus[] }> {
    return this.request<{ active_tasks: TaskStatus[] }>('/active-tasks');
  }

  async cancelTask(taskId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/task/${taskId}`, {
      method: 'DELETE',
    });
  }

  // System Status Methods
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/system-status');
  }

  async healthCheck(): Promise<{ 
    message: string; 
    status: string; 
    redis_status: string; 
    version: string;
    features: string[];
  }> {
    return this.request('/');
  }

  async getWebSocketStats(): Promise<{
    total_users: number;
    total_connections: number;
    users_online: string[];
  }> {
    return this.request('/websocket/stats');
  }

  // Video Generation Methods
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (this.mockMode) {
      return this.mockVideoGeneration(request);
    }
    
    return this.request<VideoGenerationResponse>('/generate-video', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Proactive Content Pipeline Methods
  async createProactiveGoal(goal: Omit<ProactiveGoal, 'id' | 'createdAt' | 'isActive'>): Promise<ProactiveGoal> {
    return this.request<ProactiveGoal>('/proactive/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async getProactiveGoals(): Promise<{ goals: ProactiveGoal[] }> {
    return this.request<{ goals: ProactiveGoal[] }>('/proactive/goals');
  }

  async getContentBriefs(goalId?: string): Promise<{ briefs: ContentBrief[] }> {
    const params = goalId ? `?goalId=${goalId}` : '';
    return this.request<{ briefs: ContentBrief[] }>(`/proactive/briefs${params}`);
  }

  async deployContentBrief(briefId: string): Promise<{ success: boolean; task_id: string }> {
    const response = await this.request<{ success: boolean }>(`/proactive/briefs/${briefId}/deploy`, {
      method: 'POST',
    });
    
    // Simulate creating a campaign from the brief
    const brief = MOCK_CONTENT_BRIEFS.find(b => b.id === briefId);
    if (brief) {
      const command: MCPCommand = {
        command: `Create content: ${brief.title}. ${brief.description}`,
        workflow_type: 'proactive-brief'
      };
      
      const mcpResponse = await this.executeMCPCommand(command);
      return { success: true, task_id: mcpResponse.task_id };
    }
    
    return { success: response.success, task_id: `task_${Date.now()}` };
  }

  // AI Persona Methods
  async trackPersonaFeedback(feedback: PersonaFeedback): Promise<{ success: boolean }> {
    if (this.mockMode) {
      // Simulate tracking feedback
      console.log('Tracking persona feedback:', feedback);
      return { success: true };
    }
    
    return this.request<{ success: boolean }>('/persona/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async analyzePersonaStyle(): Promise<{ 
    profile: StyleProfile; 
    insights: PersonaInsight[];
    strength: number;
  }> {
    if (this.mockMode) {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        profile: {
          editingStyle: { cutType: 'mixed', pacing: 'medium' },
          colorGrading: { preferredLUTs: ['Cinematic Warm'] },
          audioStyle: { voiceoverStyle: 'professional' },
          contentPreferences: { toneOfVoice: 'educational' },
          platformOptimization: { primaryPlatforms: ['YouTube'] }
        },
        insights: [],
        strength: 85
      };
    }
    
    return this.request('/persona/analyze');
  }

  async getPersonaProfile(): Promise<StyleProfile> {
    return this.request<StyleProfile>('/persona/profile');
  }

  async updatePersonaProfile(profile: Partial<StyleProfile>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/persona/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getPersonaInsights(): Promise<PersonaInsight[]> {
    return this.request<PersonaInsight[]>('/persona/insights');
  }

  async applyPersonaInsight(insightId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/persona/insights/${insightId}/apply`, {
      method: 'POST',
    });
  }

  async resetPersonaLearning(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/persona/reset', {
      method: 'POST',
    });
  }
}

export const apiService = new APIService();