import React from 'react';
import { motion } from 'framer-motion';
import { FileUploadZone } from '../components/FileUploadZone';

export function FileUploadPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          File Upload Center
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Upload media files for MCP processing and content creation
        </p>
      </motion.div>
      <FileUploadZone />
    </div>
  );
}