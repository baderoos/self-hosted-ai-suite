import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus, useEchoTracking } from '../../core/NexusContext';
import { apiLayer, MarketplaceItem, MarketplaceReview } from '../../services/APILayer';
import {
  Store,
  Search,
  Filter,
  Star,
  Download,
  ShoppingCart,
  Verified,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  ExternalLink,
  Package,
  Workflow,
  Brain,
  FileText,
  Sparkles
} from 'lucide-react';

export function Marketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'price'>('popular');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { getPersonalizedSuggestions } = useNexus();
  const { track } = useEchoTracking('marketplace');

  const categories = [
    { id: 'all', name: 'All Items', icon: Store },
    { id: 'model', name: 'AI Models', icon: Brain },
    { id: 'workflow', name: 'Workflows', icon: Workflow },
    { id: 'agent', name: 'Agents', icon: Package },
    { id: 'template', name: 'Templates', icon: FileText }
  ];

  useEffect(() => {
    loadMarketplaceItems();
    track('view_marketplace', { category: selectedCategory, sort: sortBy });
  }, [selectedCategory, sortBy]);

  const loadMarketplaceItems = async () => {
    setIsLoading(true);
    try {
      const response = await apiLayer.getMarketplaceItems(
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery,
        sortBy
      );
      setItems(response.items);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (item: MarketplaceItem) => {
    setSelectedItem(item);
    track('view_item', { itemId: item.id, category: item.category });
    
    try {
      const itemReviews = await apiLayer.getMarketplaceReviews(item.id);
      setReviews(itemReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    setIsPurchasing(true);
    track('purchase_attempt', { itemId: item.id, price: item.price.amount });
    
    try {
      const result = await apiLayer.purchaseMarketplaceItem(item.id);
      if (result.success) {
        track('purchase_success', { itemId: item.id });
        // Show success message and download link
      }
    } catch (error) {
      track('purchase_failure', { itemId: item.id, error: error.message });
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'model': return Brain;
      case 'workflow': return Workflow;
      case 'agent': return Package;
      case 'template': return FileText;
      default: return Store;
    }
  };

  const formatPrice = (price: MarketplaceItem['price']) => {
    if (price.type === 'free') return 'Free';
    if (price.type === 'subscription') {
      return `$${price.amount}/${price.period}`;
    }
    return `$${price.amount}`;
  };

  const suggestions = getPersonalizedSuggestions('marketplace');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.5)",
                "0 0 40px rgba(16, 185, 129, 0.8)",
                "0 0 20px rgba(16, 185, 129, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Store size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Nexus Marketplace
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Discover, purchase, and integrate AI models, workflows, and agents
            </p>
          </div>
        </div>
      </motion.div>

      {/* Personalized Suggestions */}
      {suggestions.length > 0 && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Echo's Recommendations
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {suggestion.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div 
        className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <category.icon size={16} />
                <span className="text-sm">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Marketplace Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-neutral-800/80 rounded-2xl p-6 animate-pulse">
              <div className="w-full h-48 bg-neutral-200 dark:bg-neutral-700 rounded-xl mb-4" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {items.map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.category);
            
            return (
              <motion.div
                key={item.id}
                className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleItemClick(item)}
              >
                {/* Item Image/Icon */}
                <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
                  {item.screenshots?.[0] ? (
                    <img 
                      src={item.screenshots[0]} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CategoryIcon size={48} className="text-neutral-400" />
                  )}
                  
                  {item.featured && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                      Featured
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-medium">{item.rating.average}</span>
                  </div>
                </div>

                {/* Item Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          by {item.creator.name}
                        </span>
                        {item.creator.verified && (
                          <Verified size={14} className="text-blue-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-neutral-900 dark:text-white">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Download size={14} />
                        <span>{item.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={14} />
                        <span>{item.rating.count}</span>
                      </div>
                    </div>
                    <span className="text-xs">v{item.version}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(item);
                    }}
                    disabled={isPurchasing}
                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.price.type === 'free' ? (
                      <>
                        <Download size={16} />
                        <span>Install</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>{isPurchasing ? 'Processing...' : 'Purchase'}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {selectedItem.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      by {selectedItem.creator.name}
                    </span>
                    {selectedItem.creator.verified && (
                      <Verified size={16} className="text-blue-500" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-xl mb-4 flex items-center justify-center">
                    {selectedItem.screenshots?.[0] ? (
                      <img 
                        src={selectedItem.screenshots[0]} 
                        alt={selectedItem.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package size={48} className="text-neutral-400" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Description
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {selectedItem.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Compatibility
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.compatibility.map((comp) => (
                          <span
                            key={comp}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-6 mb-6">
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                      {formatPrice(selectedItem.price)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span>{selectedItem.rating.average} ({selectedItem.rating.count} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download size={16} />
                        <span>{selectedItem.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => handlePurchase(selectedItem)}
                      disabled={isPurchasing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedItem.price.type === 'free' ? (
                        <>
                          <Download size={20} />
                          <span>Install Now</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          <span>{isPurchasing ? 'Processing...' : 'Purchase Now'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Reviews */}
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                      Reviews
                    </h3>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {review.userName}
                              </span>
                              {review.verified && (
                                <Verified size={14} className="text-blue-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-neutral-900 dark:text-white mb-1">
                            {review.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}