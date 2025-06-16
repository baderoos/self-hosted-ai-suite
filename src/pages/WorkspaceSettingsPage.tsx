import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  Building, 
  Save, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X,
  Globe,
  Link
} from 'lucide-react';

export function WorkspaceSettingsPage() {
  const { activeWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !workspaceName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateWorkspace(activeWorkspace.id, { name: workspaceName });
      setSuccess('Workspace updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace || deleteConfirmText !== activeWorkspace.name) return;
    
    setIsDeletingWorkspace(true);
    setError(null);
    
    try {
      await deleteWorkspace(activeWorkspace.id);
      // Redirect will happen automatically when active workspace changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
      setIsDeletingWorkspace(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building size={24} className="text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No Active Workspace
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please select or create a workspace to manage settings.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = activeWorkspace.role === 'owner';

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
            className="w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 40px rgba(59, 130, 246, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Building size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Workspace Settings
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage settings for {activeWorkspace.name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200">{success}</span>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Settings Form */}
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          General Settings
        </h2>
        
        <form onSubmit={handleUpdateWorkspace} className="space-y-6">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              disabled={!isOwner}
            />
            {!isOwner && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Only the workspace owner can change the workspace name.
              </p>
            )}
          </div>
          
          {/* Workspace URL */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Workspace URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                <Globe size={16} className="mr-2" />
                <span>nexus.app/</span>
              </div>
              <div className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {activeWorkspace.slug}
              </div>
              <button
                type="button"
                className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                title="Copy workspace URL"
                onClick={() => {
                  navigator.clipboard.writeText(`https://nexus.app/${activeWorkspace.slug}`);
                  setSuccess('Workspace URL copied to clipboard');
                }}
              >
                <Link size={16} />
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              This is your workspace's unique URL.
            </p>
          </div>
          
          {/* Workspace Logo */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Workspace Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors flex items-center space-x-2"
                  disabled={!isOwner}
                >
                  <Upload size={16} />
                  <span>Upload Logo</span>
                </button>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Recommended size: 512x512px
                </p>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          {isOwner && (
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={!workspaceName.trim() || isSubmitting}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
                  <Save size={16} />
                )}
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-red-300 dark:border-red-700/50 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">
            Danger Zone
          </h2>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              Delete Workspace
            </h3>
            <p className="text-red-700 dark:text-red-400 text-sm mb-4">
              This action cannot be undone. This will permanently delete the workspace, all of its data, and remove all team members.
            </p>
            
            <AnimatePresence>
              {confirmDelete ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Please type <span className="font-semibold">{activeWorkspace.name}</span> to confirm deletion:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={activeWorkspace.name}
                  />
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteWorkspace}
                      disabled={deleteConfirmText !== activeWorkspace.name || isDeletingWorkspace}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isDeletingWorkspace ? (
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span>{isDeletingWorkspace ? 'Deleting...' : 'Delete Workspace'}</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 size={16} />
                  <span>Delete Workspace</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}