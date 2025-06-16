/**
 * Google Gemini Service
 * 
 * This service provides a centralized interface for interacting with Google's Gemini family of models.
 * It handles model selection, API communication, and response processing.
 */

import { apiService } from './api';

// Types for Gemini API requests and responses
export interface GeminiContent {
  role?: 'user' | 'model' | 'system';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string; // base64 encoded data
    };
    fileData?: {
      mimeType: string;
      fileUri: string;
    };
  }>;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  candidateCount?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface GeminiSafetySettings {
  category: 'HARM_CATEGORY_HARASSMENT' | 
            'HARM_CATEGORY_HATE_SPEECH' | 
            'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 
            'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 
             'BLOCK_ONLY_HIGH' | 
             'BLOCK_MEDIUM_AND_ABOVE' | 
             'BLOCK_LOW_AND_ABOVE';
}

export interface GeminiResponse {
  candidates: Array<{
    content: GeminiContent;
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
    index?: number;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  version?: string;
}

export interface GeminiModelParams {
  model: string;
  contents: GeminiContent[];
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySettings[];
}

export interface FileData {
  mimeType: string;
  data: File | Blob | string; // File object, Blob, or base64 string
}

export class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private defaultModel = 'gemini-1.5-pro';
  private defaultGenerationConfig: GeminiGenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048
  };
  private defaultSafetySettings: GeminiSafetySettings[] = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  ];

  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem('gemini_api_key');
  }

  /**
   * Set the API key for Gemini API
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
  }

  /**
   * Get the current API key
   */
  public getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Clear the stored API key
   */
  public clearApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem('gemini_api_key');
  }

  /**
   * Check if the API key is set
   */
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * List available Gemini models
   */
  public async listModels(): Promise<GeminiModel[]> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please set an API key before making requests.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for Gemini models only
      return data.models.filter((model: any) => 
        model.name.includes('gemini')
      );
    } catch (error) {
      console.error('Failed to list Gemini models:', error);
      throw error;
    }
  }

  /**
   * Get information about a specific model
   */
  public async getModel(modelName: string): Promise<GeminiModel> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please set an API key before making requests.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${modelName}?key=${this.apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to get model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Generate content using text-only input
   */
  public async generateContent(
    prompt: string,
    options: {
      model?: string;
      systemPrompt?: string;
      generationConfig?: GeminiGenerationConfig;
      safetySettings?: GeminiSafetySettings[];
    } = {}
  ): Promise<GeminiResponse> {
    const contents: GeminiContent[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      contents.push({
        role: 'system',
        parts: [{ text: options.systemPrompt }]
      });
    }
    
    // Add user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
    
    return this.generateContentWithModel({
      model: options.model || this.defaultModel,
      contents,
      generationConfig: options.generationConfig || this.defaultGenerationConfig,
      safetySettings: options.safetySettings || this.defaultSafetySettings
    });
  }

  /**
   * Generate content with multimodal input (text + images/video)
   */
  public async generateContentWithMultiModal(
    prompt: string,
    files: FileData[],
    options: {
      model?: string;
      systemPrompt?: string;
      generationConfig?: GeminiGenerationConfig;
      safetySettings?: GeminiSafetySettings[];
    } = {}
  ): Promise<GeminiResponse> {
    const contents: GeminiContent[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      contents.push({
        role: 'system',
        parts: [{ text: options.systemPrompt }]
      });
    }
    
    // Create multimodal content
    const parts = await Promise.all(
      files.map(async (file) => {
        // If file is already a base64 string
        if (typeof file.data === 'string') {
          return {
            inlineData: {
              mimeType: file.mimeType,
              data: file.data
            }
          };
        }
        
        // Convert File/Blob to base64
        const base64Data = await this.fileToBase64(file.data as File | Blob);
        return {
          inlineData: {
            mimeType: file.mimeType,
            data: base64Data
          }
        };
      })
    );
    
    // Add text prompt
    parts.push({ text: prompt });
    
    contents.push({
      role: 'user',
      parts
    });
    
    // Use Gemini 1.5 Pro for multimodal by default
    const model = options.model || 'gemini-1.5-pro';
    
    return this.generateContentWithModel({
      model,
      contents,
      generationConfig: options.generationConfig || this.defaultGenerationConfig,
      safetySettings: options.safetySettings || this.defaultSafetySettings
    });
  }

  /**
   * Generate content with a conversation history
   */
  public async generateContentWithHistory(
    messages: Array<{
      role: 'user' | 'model' | 'system';
      content: string;
    }>,
    options: {
      model?: string;
      generationConfig?: GeminiGenerationConfig;
      safetySettings?: GeminiSafetySettings[];
    } = {}
  ): Promise<GeminiResponse> {
    const contents: GeminiContent[] = messages.map(message => ({
      role: message.role,
      parts: [{ text: message.content }]
    }));
    
    return this.generateContentWithModel({
      model: options.model || this.defaultModel,
      contents,
      generationConfig: options.generationConfig || this.defaultGenerationConfig,
      safetySettings: options.safetySettings || this.defaultSafetySettings
    });
  }

  /**
   * Core method to generate content with the Gemini API
   */
  private async generateContentWithModel(params: GeminiModelParams): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please set an API key before making requests.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${params.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: params.contents,
            generationConfig: params.generationConfig,
            safetySettings: params.safetySettings
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to generate content with Gemini:', error);
      throw error;
    }
  }

  /**
   * Analyze an image or video and return a description
   */
  public async analyzeMedia(
    file: FileData,
    prompt: string = "Describe this media in detail",
    options: {
      model?: string;
      generationConfig?: GeminiGenerationConfig;
    } = {}
  ): Promise<GeminiResponse> {
    return this.generateContentWithMultiModal(
      prompt,
      [file],
      {
        model: options.model || 'gemini-1.5-pro',
        generationConfig: options.generationConfig
      }
    );
  }

  /**
   * Analyze a document (PDF, text) and answer questions about it
   */
  public async analyzeDocument(
    document: FileData,
    question: string,
    options: {
      model?: string;
      generationConfig?: GeminiGenerationConfig;
    } = {}
  ): Promise<GeminiResponse> {
    return this.generateContentWithMultiModal(
      question,
      [document],
      {
        model: options.model || 'gemini-1.5-pro',
        generationConfig: {
          ...this.defaultGenerationConfig,
          ...options.generationConfig,
          maxOutputTokens: options.generationConfig?.maxOutputTokens || 4096
        }
      }
    );
  }

  /**
   * Utility method to convert a File or Blob to base64
   */
  private async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract text from a Gemini response
   */
  public extractTextFromResponse(response: GeminiResponse): string {
    if (!response.candidates || response.candidates.length === 0) {
      return '';
    }
    
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return '';
    }
    
    return candidate.content.parts
      .map(part => part.text || '')
      .join('\n')
      .trim();
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();