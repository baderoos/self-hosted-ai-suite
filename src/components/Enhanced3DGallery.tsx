import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, Share2, Trash2, Calendar, Tag } from 'lucide-react';
import React, { lazy, Suspense } from 'react';

// Lazy load AnimatedCard
const AnimatedCard = lazy(() => import('./AnimatedCard').then(module => ({ default: module.AnimatedCard })));

interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'text';
  title: string;
  description: string;
  date: string;
  size: string;
  tags: string[];
  thumbnail?: string;
}

interface Enhanced3DGalleryProps {
  items: ContentItem[];
}

export function Enhanced3DGallery({ items }: Enhanced3DGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Suspense key={item.id} fallback={
          <div className="bg-white/80 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg animate-pulse">
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
            </div>
          </div>
        }>
          <AnimatedCard
            key={item.id}
            delay={index * 0.1}
            className="group relative"
          >
            <motion.div
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg"
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              whileHover={{ 
                y: -10,
                rotateX: 5,
                rotateY: 5,
                scale: 1.02
              }}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: 1000
              }}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 relative overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="400"
                    height="225"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Eye size={32} className="text-neutral-400" />
                    </motion.div>
                  </div>
                )}
                
                {/* Hover Actions */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center space-x-2">
                        {[
                          { icon: Eye, color: 'bg-blue-500' },
                          { icon: Download, color: 'bg-green-500' },
                          { icon: Share2, color: 'bg-purple-500' },
                          { icon: Trash2, color: 'bg-red-500' }
                        ].map(({ icon: Icon, color }, actionIndex) => (
                          <motion.button
                            key={actionIndex}
                            className={`p-3 ${color} rounded-full text-white shadow-lg`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: actionIndex * 0.1 }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Icon size={16} />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <div className="p-4">
                <motion.div
                  className="flex items-center justify-between mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    item.type === 'image' ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' :
                    item.type === 'video' ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' :
                    'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  }`}>
                    {item.type}
                  </span>
                </motion.div>
                
                <motion.h3 
                  className="font-semibold text-neutral-900 dark:text-white mb-1 truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {item.title}
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {item.description}
                </motion.p>
                
                <motion.div 
                  className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <span>{item.size}</span>
                </motion.div>
                
                {item.tags && (
                  <motion.div 
                    className="flex flex-wrap gap-1 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                      <motion.span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + tagIndex * 0.1 }}
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </motion.span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatedCard>
        </Suspense>
      ))}
    </div>
  );
}