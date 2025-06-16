import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace, WorkspaceMember } from '../contexts/WorkspaceContext';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  User, 
  MoreHorizontal, 
  X, 
  Check, 
  AlertTriangle,
  Clock,
  Trash2
} from 'lucide-react';

export function TeamSettingsPage() {
  const { 
    activeWorkspace, 
    members, 
    invitations, 
    inviteMember, 
    removeMember, 
    updateMemberRole, 
    cancelInvitation 
  } = useWorkspace();
  
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [memberActionsOpen, setMemberActionsOpen] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await inviteMember(email, role);
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      setIsInviting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string | null) => {
    try {
      await removeMember(userId);
      setSuccess(`${userName || 'User'} has been removed from the workspace`);
      setConfirmRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      await updateMemberRole(userId, newRole);
      setSuccess('Member role updated successfully');
      setMemberActionsOpen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    try {
      await cancelInvitation(invitationId);
      setSuccess(`Invitation to ${email} has been canceled`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No Active Workspace
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please select or create a workspace to manage team members.
          </p>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = activeWorkspace.role === 'owner' || activeWorkspace.role === 'admin';

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
            className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(79, 70, 229, 0.5)",
                "0 0 40px rgba(79, 70, 229, 0.8)",
                "0 0 20px rgba(79, 70, 229, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users size={32} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Team Settings
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage members and permissions for {activeWorkspace.name}
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

      {/* Team Members */}
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Team Members
          </h2>
          {isOwnerOrAdmin && (
            <motion.button
              onClick={() => setIsInviting(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isInviting}
            >
              <UserPlus size={16} />
              <span>Invite Member</span>
            </motion.button>
          )}
        </div>

        {/* Invite Form */}
        <AnimatePresence>
          {isInviting && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl"
              onSubmit={handleInvite}
            >
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                      required
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInviting(false)}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!email.trim() || isSubmitting}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Members List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Joined</th>
                {isOwnerOrAdmin && (
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr 
                  key={member.id} 
                  className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.name || member.email} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {member.name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' ? (
                        <Shield size={16} className="text-primary-500" />
                      ) : member.role === 'admin' ? (
                        <Shield size={16} className="text-secondary-500" />
                      ) : (
                        <User size={16} className="text-neutral-500" />
                      )}
                      <span className="capitalize text-neutral-900 dark:text-white">
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </td>
                  {isOwnerOrAdmin && (
                    <td className="px-4 py-4 text-right">
                      {/* Can't modify owner */}
                      {member.role === 'owner' ? (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Workspace Owner
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => setMemberActionsOpen(memberActionsOpen === member.id ? null : member.id)}
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <MoreHorizontal size={16} className="text-neutral-500" />
                          </button>
                          
                          {/* Member Actions Dropdown */}
                          <AnimatePresence>
                            {memberActionsOpen === member.id && (
                              <motion.div
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                {/* Change Role */}
                                {activeWorkspace.role === 'owner' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                                      className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                      <Shield size={16} className="text-neutral-500" />
                                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                        {member.role === 'admin' ? 'Change to Member' : 'Change to Admin'}
                                      </span>
                                    </button>
                                    <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
                                  </>
                                )}
                                
                                {/* Remove Member */}
                                {confirmRemove === member.id ? (
                                  <div className="p-3">
                                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                                      Are you sure you want to remove this member?
                                    </p>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => setConfirmRemove(null)}
                                        className="flex-1 px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleRemoveMember(member.id, member.name)}
                                        className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setConfirmRemove(member.id);
                                      setMemberActionsOpen(null);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 size={16} />
                                    <span className="text-sm">Remove Member</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {isOwnerOrAdmin && invitations.length > 0 && (
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Pending Invitations
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Invited By</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr 
                    key={invitation.id} 
                    className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-neutral-500" />
                        <span className="text-neutral-900 dark:text-white">{invitation.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {invitation.role === 'admin' ? (
                          <Shield size={16} className="text-secondary-500" />
                        ) : (
                          <User size={16} className="text-neutral-500" />
                        )}
                        <span className="capitalize text-neutral-900 dark:text-white">
                          {invitation.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                      {invitation.created_by.name || invitation.created_by.email}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Cancel Invitation"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}