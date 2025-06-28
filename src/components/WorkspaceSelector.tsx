import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../hooks/useAuth';
import { 
  Building, 
  Plus, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';

export function WorkspaceSelector() {
  const { user } = useAuth();
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    createWorkspace, 
    isLoading 
  } = useWorkspace();
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user has no workspaces, show the creation form
  useEffect(() => {
    if (!isLoading && workspaces.length === 0 && !isCreating) {
      setIsCreating(true);
    }
  }, [isLoading, workspaces.length, isCreating]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const workspace = await createWorkspace(newWorkspaceName);
      console.log('Workspace created successfully:', workspace);
      setNewWorkspaceName('');
      setIsCreating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      console.error('Workspace creation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading workspaces...
          </p>
        </div>
      </div>
    );
  }

  // If user has at least one workspace and one is active, don't show this modal
  if (workspaces.length > 0 && activeWorkspace) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-4">
      <motion.div
        className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {workspaces.length === 0 ? 'Create Your First Workspace' : 'Select a Workspace'}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {workspaces.length === 0 
              ? 'Create a workspace to get started with Nexus' 
              : 'Choose a workspace to continue'}
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace List */}
        {workspaces.length > 0 && !isCreating && (
          <div className="mb-6 space-y-2 max-h-60 overflow-y-auto">
            {workspaces.map((workspace) => (
              <motion.button
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace)}
                className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {workspace.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {workspace.role}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Create Workspace Form */}
        <AnimatePresence>
          {isCreating ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              onSubmit={handleCreateWorkspace}
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Awesome Workspace"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                {workspaces.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <motion.button
                  type="submit"
                  disabled={!newWorkspaceName.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>{isSubmitting ? 'Creating...' : 'Create Workspace'}</span>
                </motion.button>
              </div>
            </motion.form>
          ) : workspaces.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                <span>Create New Workspace</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}