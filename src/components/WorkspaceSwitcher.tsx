import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  ChevronDown, 
  Plus, 
  Settings, 
  Users, 
  Building, 
  CreditCard,
  Check
} from 'lucide-react';

export function WorkspaceSwitcher() {
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    createWorkspace 
  } = useWorkspace();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsCreating(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div className="relative">
      {/* Workspace Selector Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md flex items-center justify-center text-white font-semibold">
          {activeWorkspace.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-neutral-900 dark:text-white truncate">
            {activeWorkspace.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
            {activeWorkspace.role}
          </p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Workspaces List */}
            <div className="max-h-60 overflow-y-auto py-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md flex items-center justify-center text-white font-semibold">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {workspace.role}
                    </p>
                  </div>
                  {workspace.id === activeWorkspace.id && (
                    <Check size={16} className="text-primary-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Create New Workspace Form */}
            <AnimatePresence>
              {isCreating ? (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 dark:border-neutral-700 p-3"
                  onSubmit={handleCreateWorkspace}
                >
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 mb-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWorkspaceName.trim() || isSubmitting}
                      className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-neutral-200 dark:border-neutral-700"
                >
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center space-x-2 px-4 py-3 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-primary-600 dark:text-primary-400"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-medium">Create New Workspace</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Workspace Actions */}
            {!isCreating && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 py-2">
                <a
                  href="/settings/team"
                  className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Users size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Team Settings</span>
                </a>
                <a
                  href="/settings/workspace"
                  className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Building size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Workspace Settings</span>
                </a>
                <a
                  href="/settings/billing"
                  className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <CreditCard size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Billing & Plan</span>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}