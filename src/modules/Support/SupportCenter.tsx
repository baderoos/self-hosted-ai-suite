import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexus, useEchoTracking } from '../../core/NexusContext';
import { apiLayer, SupportTicket } from '../../services/APILayer';
import {
  HelpCircle,
  MessageSquare,
  Book,
  Users,
  Search,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Play,
  FileText,
  Video,
  Headphones,
  Zap,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export function SupportCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const { getPersonalizedSuggestions } = useNexus();
  const { track } = useEchoTracking('support');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: HelpCircle },
    { id: 'tickets', name: 'Support Tickets', icon: MessageSquare },
    { id: 'tutorials', name: 'Tutorials', icon: Book },
    { id: 'community', name: 'Community', icon: Users }
  ];

  const quickActions = [
    {
      title: 'Video Generation Help',
      description: 'Learn how to create stunning AI videos',
      icon: Video,
      color: 'blue',
      action: () => track('quick_action', { type: 'video_help' })
    },
    {
      title: 'Workflow Automation',
      description: 'Set up intelligent automation workflows',
      icon: Zap,
      color: 'purple',
      action: () => track('quick_action', { type: 'workflow_help' })
    },
    {
      title: 'Echo AI Training',
      description: 'Optimize your AI persona for better results',
      icon: Sparkles,
      color: 'pink',
      action: () => track('quick_action', { type: 'echo_help' })
    },
    {
      title: 'Marketplace Guide',
      description: 'Discover and install new AI models',
      icon: Star,
      color: 'emerald',
      action: () => track('quick_action', { type: 'marketplace_help' })
    }
  ];

  const tutorials = [
    {
      id: 'getting-started',
      title: 'Getting Started with Nexus',
      description: 'Complete beginner\'s guide to the platform',
      duration: '15 min',
      type: 'video',
      difficulty: 'Beginner',
      views: '12.5K'
    },
    {
      id: 'ai-workflows',
      title: 'Creating Your First AI Workflow',
      description: 'Step-by-step workflow automation tutorial',
      duration: '22 min',
      type: 'video',
      difficulty: 'Intermediate',
      views: '8.3K'
    },
    {
      id: 'echo-training',
      title: 'Training Echo AI for Your Style',
      description: 'Personalize your AI assistant for optimal results',
      duration: '18 min',
      type: 'video',
      difficulty: 'Advanced',
      views: '6.7K'
    },
    {
      id: 'marketplace-mastery',
      title: 'Marketplace Mastery Guide',
      description: 'Find, purchase, and integrate marketplace items',
      duration: '12 min',
      type: 'article',
      difficulty: 'Beginner',
      views: '9.1K'
    }
  ];

  const communityStats = {
    totalMembers: '24.8K',
    activeToday: '1.2K',
    questionsAnswered: '156',
    averageResponseTime: '2.3 hours'
  };

  useEffect(() => {
    loadSupportData();
    track('view_support_center', { tab: activeTab });
  }, [activeTab]);

  const loadSupportData = async () => {
    setIsLoading(true);
    try {
      const userTickets = await apiLayer.getSupportTickets('current_user');
      setTickets(userTickets);
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTicket = async () => {
    try {
      const newTicket = await apiLayer.createSupportTicket({
        subject: 'New Support Request',
        description: 'Please describe your issue...',
        status: 'open',
        priority: 'medium',
        category: 'General',
        userId: 'current_user'
      });
      setTickets(prev => [newTicket, ...prev]);
      setSelectedTicket(newTicket);
      track('create_ticket', { category: 'General' });
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const message = await apiLayer.addSupportMessage(selectedTicket.id, {
        senderId: 'current_user',
        senderName: 'You',
        senderType: 'user',
        content: newMessage
      });

      setTickets(prev => prev.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, messages: [...ticket.messages, message] }
          : ticket
      ));

      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);

      setNewMessage('');
      track('send_message', { ticketId: selectedTicket.id });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'closed': return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-neutral-600';
    }
  };

  const suggestions = getPersonalizedSuggestions('support');

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
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.5)",
                "0 0 40px rgba(99, 102, 241, 0.8)",
                "0 0 20px rgba(99, 102, 241, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HelpCircle size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Nexus Academy & Support Center
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get help, learn new skills, and connect with the community
            </p>
          </div>
        </div>
      </motion.div>

      {/* Echo AI Suggestions */}
      {suggestions.length > 0 && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                Echo's Learning Recommendations
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

      {/* Navigation Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-lg'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={18} />
            <span className="text-sm font-semibold">{tab.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    className="group p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon size={24} className={`text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {action.description}
                    </p>
                    <div className="flex items-center mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Learn more</span>
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Popular Tutorials */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Popular Tutorials
                  </h2>
                  <motion.button
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center space-x-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>View all</span>
                    <ExternalLink size={14} />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.slice(0, 4).map((tutorial, index) => (
                    <motion.div
                      key={tutorial.id}
                      className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          {tutorial.type === 'video' ? (
                            <Video size={16} className="text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                            {tutorial.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {tutorial.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{tutorial.duration}</span>
                            <span>•</span>
                            <span>{tutorial.difficulty}</span>
                            <span>•</span>
                            <span>{tutorial.views} views</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tickets List */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Support Tickets
                    </h2>
                    <motion.button
                      onClick={createNewTicket}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  
                  <div className="space-y-3">
                    {tickets.map((ticket, index) => (
                      <motion.button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                            : 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                            {ticket.subject}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ticket Detail */}
              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                          {selectedTicket.subject}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                            {selectedTicket.status}
                          </span>
                          <span className={getPriorityColor(selectedTicket.priority)}>
                            {selectedTicket.priority} priority
                          </span>
                          <span>Created {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-xl ${
                            message.senderType === 'user'
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 ml-8'
                              : 'bg-neutral-100 dark:bg-neutral-700/50 mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300">
                            {message.content}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Reply */}
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                      <motion.button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-400 text-white rounded-xl transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                    <div className="text-center py-16">
                      <MessageSquare size={48} className="text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        Select a Ticket
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Choose a support ticket to view the conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tutorials' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search tutorials..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Getting Started', 'Content Creation', 'AI Workflows', 'Echo AI', 'Marketplace'].map((category, index) => (
                  <motion.button
                    key={category}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      category === 'All'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              {/* Tutorials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial, index) => (
                  <motion.div
                    key={tutorial.id}
                    className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      {tutorial.type === 'video' ? (
                        <Play size={48} className="text-white opacity-80" />
                      ) : (
                        <FileText size={48} className="text-white opacity-80" />
                      )}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                        {tutorial.duration}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                          {tutorial.difficulty}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {tutorial.views} views
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-8">
              {/* Community Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Community Members',
                    value: communityStats.totalMembers,
                    icon: Users,
                    color: 'indigo'
                  },
                  {
                    label: 'Active Today',
                    value: communityStats.activeToday,
                    icon: Clock,
                    color: 'emerald'
                  },
                  {
                    label: 'Questions Answered',
                    value: communityStats.questionsAnswered,
                    icon: CheckCircle,
                    color: 'blue'
                  },
                  {
                    label: 'Avg. Response Time',
                    value: communityStats.averageResponseTime,
                    icon: Zap,
                    color: 'purple'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                        <stat.icon size={24} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Community Forum Preview */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Community Forum
                  </h2>
                  <motion.button
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink size={16} />
                    <span>Visit Forum</span>
                  </motion.button>
                </div>
                
                <div className="text-center py-16">
                  <Users size={48} className="text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Community Forum Coming Soon
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Connect with other Nexus users, share tips, and get help from the community
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}