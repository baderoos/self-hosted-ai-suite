import { useState, useCallback } from 'react';
import { apiService, FileUploadResponse } from '../services/api';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

  const uploadSingleFile = useCallback(async (file: File): Promise<FileUploadResponse> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await apiService.uploadSingleFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFiles(prev => [result, ...prev]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const result = await apiService.uploadMultipleFiles(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFiles(prev => [...result.uploaded_files, ...prev]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await apiService.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.file_id !== fileId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadedFiles,
    uploadSingleFile,
    uploadMultipleFiles,
    deleteFile,
    clearError
  };
}