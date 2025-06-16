import React from 'react';
import { motion } from 'framer-motion';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut,
  Home,
  LayoutDashboard,
  Atom,
  Workflow,
  Package,
  Brain,
  Wand2,
  Clock,
  FolderOpen,
  Upload,
  Share2,
  Settings,
  UserCog
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  navigation: NavigationItem[];
  currentView: string;
  setCurrentView: (view: string) => void;
  user: any;
  isConnected: boolean;
  logout: () => void;
}

export function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  navigation,
  currentView,
  setCurrentView,
  user,
  isConnected,
  logout
}: SidebarProps) {
  return (
    <motion.aside 
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-700/50 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } hidden lg:block`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="p-4 relative">
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 p-1.5 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-110 hover:shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
        
        {/* Navigation Header */}
        {!sidebarCollapsed && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <WorkspaceSwitcher />
          </motion.div>
        )}
        
        {!sidebarCollapsed && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Navigation
            </h2>
            <div className="h-px bg-gradient-to-r from-primary-500/20 to-transparent" />
          </motion.div>
        )}
      </div>
      
      <nav className="px-4 pb-4">
        {/* User Info */}
        {!sidebarCollapsed && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-br from-neutral-100/80 to-neutral-50/80 dark:from-neutral-700/80 dark:to-neutral-800/80 rounded-xl border border-neutral-200/50 dark:border-neutral-600/50 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <User size={18} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  {user?.scopes?.includes('admin') ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <motion.div 
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <motion.button
                onClick={logout}
                className="text-neutral-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Logout"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="space-y-1">
          {navigation.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`group relative w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm overflow-hidden ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-primary-100/80 to-secondary-100/80 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-700 dark:text-primary-400 shadow-lg border border-primary-200/50 dark:border-primary-700/50' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-neutral-100/70 hover:to-neutral-50/70 dark:hover:from-neutral-700/70 dark:hover:to-neutral-800/70 hover:text-neutral-900 dark:hover:text-white hover:shadow-md'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: sidebarCollapsed ? 2 : 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {currentView === item.id && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Icon with enhanced states */}
              <motion.div
                className={`flex-shrink-0 ${currentView === item.id ? 'text-primary-600 dark:text-primary-400' : ''}`}
                whileHover={{ scale: 1.1, rotate: currentView === item.id ? 0 : 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon size={20} />
              </motion.div>
              
              {/* Label with tooltip for collapsed state */}
              {!sidebarCollapsed && (
                <motion.span 
                  className="font-semibold truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {item.label}
                </motion.span>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <motion.div
                  className="absolute left-full ml-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap"
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-900 dark:bg-neutral-100 rotate-45" />
                </motion.div>
              )}
              
              {/* Hover effect background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                initial={false}
              />
            </motion.button>
          ))}
        </div>
        
        {/* Navigation Footer */}
        {!sidebarCollapsed && (
          <motion.div
            className="mt-8 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              <p className="font-medium">MCP Suite v2.0</p>
              <p className="mt-1">AI Director's Console</p>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.aside>
  );
}