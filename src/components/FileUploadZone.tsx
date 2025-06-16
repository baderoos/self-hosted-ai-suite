import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  X, 
  Check, 
  AlertCircle,
  Download,
  Trash2,
  Cloud
} from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';

interface FileUploadZoneProps {
  onFileUploaded?: (file: any) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
}

export function FileUploadZone({ 
  onFileUploaded, 
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxFiles = 10,
  className = ''
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { 
    isUploading, 
    uploadProgress, 
    error, 
    uploadedFiles, 
    uploadMultipleFiles, 
    deleteFile, 
    clearError 
  } = useFileUpload();
  const { canWrite } = useAuth();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files.slice(0, maxFiles));
  }, [maxFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files.slice(0, maxFiles));
  }, [maxFiles]);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length || !canWrite()) return;

    try {
      const result = await uploadMultipleFiles(selectedFiles);
      setSelectedFiles([]);
      
      if (onFileUploaded) {
        result.uploaded_files.forEach(onFileUploaded);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [selectedFiles, uploadMultipleFiles, onFileUploaded, canWrite]);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!canWrite()) {
    return (
      <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
        <Upload size={48} className="mx-auto mb-4 opacity-50" />
        <p>You don't have permission to upload files</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <motion.div
          animate={{ 
            y: isDragOver ? -10 : 0,
            scale: isDragOver ? 1.1 : 1
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Upload size={48} className={`mx-auto mb-4 ${
            isDragOver ? 'text-primary-500' : 'text-neutral-400'
          }`} />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Media Files'}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Upload to secure cloud storage • Supports images, videos, and audio files (max {maxFiles} files)
        </p>
      </motion.div>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white">
                Upload to Cloud ({selectedFiles.length} files)
              </h4>
              <motion.button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Cloud size={16} />
                <span>{isUploading ? 'Uploading to Cloud...' : 'Upload to Cloud'}</span>
              </motion.button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <span>Uploading to cloud storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* File List */}
            <div className="space-y-2">
              {selectedFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FileIcon size={20} className="text-neutral-600 dark:text-neutral-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                      disabled={isUploading}
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
            Cloud Storage ({uploadedFiles.length} files)
          </h4>
          <div className="space-y-2">
            {uploadedFiles.slice(0, 5).map((file, index) => {
              const FileIcon = getFileIcon(file.content_type);
              return (
                <motion.div
                  key={file.file_id}
                  className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FileIcon size={20} className="text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {file.original_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(file.file_size)} • {new Date(file.upload_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`https://api.mcpsuite.com/files/${file.file_id}/download`}
                      className="text-neutral-400 hover:text-blue-500 transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => deleteFile(file.file_id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Check size={16} className="text-emerald-500" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}