import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from './AnimatedCard';
import { apiService } from '../services/api';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Share2, 
  Trash2, 
  Eye,
  Calendar,
  Tag,
  FileText,
  Image,
  Video,
  Sparkles,
  Grid3X3,
  List
} from 'lucide-react';

import { Enhanced3DGallery } from './Enhanced3DGallery';

export function ContentLibrary() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load files on component mount
  React.useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.listFiles();
        setFiles(response.files);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, []);

  // Fallback content items for demo
  const fallbackContentItems = [
    {
      id: '1',
      type: 'image',
      title: 'Cyberpunk Cityscape',
      description: 'Futuristic city with neon lights',
      date: '2024-01-15',
      size: '2.4 MB',
      tags: ['cyberpunk', 'city', 'neon'],
      thumbnail: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      type: 'video',
      title: 'Product Showcase',
      description: 'Dynamic product montage',
      date: '2024-01-14',
      size: '15.7 MB',
      tags: ['product', 'showcase', 'commercial'],
      thumbnail: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      type: 'text',
      title: 'Tech Blog Post',
      description: 'AI and Future of Work',
      date: '2024-01-13',
      size: '12 KB',
      tags: ['blog', 'tech', 'ai'],
      thumbnail: null
    },
    {
      id: '4',
      type: 'image',
      title: 'Abstract Art',
      description: 'Digital abstract composition',
      date: '2024-01-12',
      size: '1.8 MB',
      tags: ['abstract', 'art', 'digital'],
      thumbnail: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '5',
      type: 'video',
      title: 'Travel Montage',
      description: 'Cinematic travel video',
      date: '2024-01-11',
      size: '23.1 MB',
      tags: ['travel', 'cinematic', 'nature'],
      thumbnail: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '6',
      type: 'text',
      title: 'Marketing Copy',
      description: 'Product description copy',
      date: '2024-01-10',
      size: '8 KB',
      tags: ['marketing', 'copy', 'product'],
      thumbnail: null
    },
  ];

  // Convert API files to content items format
  const contentItems = [
    ...files.map(file => ({
      id: file.file_id,
      type: file.content_type.startsWith('video/') ? 'video' : 
            file.content_type.startsWith('image/') ? 'image' : 'text',
      title: file.metadata?.generated ? 
        `AI Generated: ${file.metadata.model || 'Unknown Model'}` : 
        file.original_name,
      description: file.metadata?.generated ? 
        `${file.metadata.prompt?.substring(0, 100)}...` || 'AI generated content' :
        `Uploaded ${file.content_type}`,
      date: file.upload_time,
      size: formatFileSize(file.file_size),
      tags: file.metadata?.generated ? 
        [file.metadata.model, file.metadata.style, 'ai-generated'].filter(Boolean) :
        ['uploaded'],
      thumbnail: file.metadata?.thumbnail_url || 
        (file.content_type.startsWith('video/') ? 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400' : null),
      isGenerated: file.metadata?.generated || false
    })),
    ...fallbackContentItems
  ];

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'text': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400';
      case 'video': return 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400';
      case 'text': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400';
      default: return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Content Library
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your AI-generated videos and uploaded content in the cloud
        </p>
      </motion.div>

      {/* Filters and Search */}
      <AnimatedCard className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-neutral-100/50 dark:bg-neutral-700/50 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white/80 dark:bg-neutral-600/80 text-neutral-900 dark:text-white shadow-sm backdrop-blur-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white/80 dark:bg-neutral-600/80 text-neutral-900 dark:text-white shadow-sm backdrop-blur-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <motion.div 
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-neutral-600 dark:text-neutral-400">Loading your content...</p>
        </div>
      )}

      {/* Content Grid/List */}
      {!isLoading && (viewMode === 'grid' ? (
        <Enhanced3DGallery items={filteredItems} />
      ) : (
        <AnimatedCard className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center space-x-4 p-6 hover:bg-neutral-50/50 dark:hover:bg-neutral-700/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ x: 10 }}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon size={20} className="text-neutral-400" />
                      </div>
                    )}
                    {item.isGenerated && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <Sparkles size={8} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      {item.isGenerated && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-400">
                          <Sparkles size={10} className="mr-1" />
                          AI Generated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-500">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>{item.size}</span>
                      {item.tags && (
                        <div className="flex items-center space-x-1">
                          <Tag size={12} />
                          <span>{item.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                      <Eye size={16} className="text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                      <Download size={16} className="text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                      <Share2 size={16} className="text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                      <Trash2 size={16} className="text-neutral-400 hover:text-red-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatedCard>
      ))}

      {!isLoading && filteredItems.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No content found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
}