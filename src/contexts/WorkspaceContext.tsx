import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  email: string;
  name: string | null;
  role: 'owner' | 'admin' | 'member';
  avatar_url: string | null;
  joined_at: string;
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  expires_at: string;
  created_at: string;
  created_by: {
    name: string | null;
    email: string;
  };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  isLoading: boolean;
  error: string | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: 'admin' | 'member') => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<boolean>;
  refreshWorkspaces: () => Promise<void>;
  subscription: any | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);

  // Load user's workspaces
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoading(false);
      return;
    }

    loadWorkspaces();
  }, [user, isAuthenticated]);

  // Load workspace members when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) {
      setMembers([]);
      setInvitations([]);
      setSubscription(null);
      return;
    }

    loadWorkspaceMembers();
    loadWorkspaceSubscription();
    if (['owner', 'admin'].includes(activeWorkspace.role)) {
      loadWorkspaceInvitations();
    }
  }, [activeWorkspace]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('get_user_workspaces', { user_uuid: user!.id });

      if (error) throw error;

      setWorkspaces(data || []);

      // Set active workspace from localStorage or use the first one
      const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
      if (savedWorkspaceId && data.some(w => w.id === savedWorkspaceId)) {
        setActiveWorkspace(data.find(w => w.id === savedWorkspaceId) || null);
      } else if (data && data.length > 0) {
        setActiveWorkspace(data[0]);
        localStorage.setItem('activeWorkspaceId', data[0].id);
      }
    } catch (err) {
      console.error('Error loading workspaces:', err);
      setError('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaceMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            name,
            avatar_url
          ),
          auth_users:user_id (
            email,
            name,
            avatar_url
          )
        `)
        .eq('workspace_id', activeWorkspace!.id);

      if (error) throw error;

      const formattedMembers = data.map(item => ({
        id: item.user_id,
        email: item.auth_users?.email || '',
        name: item.profiles?.name || item.auth_users?.name || null,
        role: item.role,
        avatar_url: item.profiles?.avatar_url || item.auth_users?.avatar_url || null,
        joined_at: item.created_at
      }));

      setMembers(formattedMembers);
    } catch (err) {
      console.error('Error loading members:', err);
      // Fallback query without joins if the above fails
      try {
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('user_id, role, created_at')
          .eq('workspace_id', activeWorkspace!.id);

        if (membersError) throw membersError;

        // Get user details separately
        const memberPromises = membersData.map(async (member) => {
          const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', member.user_id)
            .single();

          return {
            id: member.user_id,
            email: userData.user?.email || '',
            name: profileData?.name || userData.user?.user_metadata?.name || null,
            role: member.role,
            avatar_url: profileData?.avatar_url || userData.user?.user_metadata?.avatar_url || null,
            joined_at: member.created_at
          };
        });

        const members = await Promise.all(memberPromises);
        setMembers(members);
      } catch (fallbackErr) {
        console.error('Fallback member loading also failed:', fallbackErr);
      }
    }
  };

  const loadWorkspaceSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }

      setSubscription(data || null);
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const loadWorkspaceInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
          id,
          email,
          role,
          expires_at,
          created_at,
          created_by,
          users:created_by (
            email,
            name
          )
        `)
        .eq('workspace_id', activeWorkspace!.id);

      if (error) throw error;

      const formattedInvitations = data.map(item => ({
        id: item.id,
        email: item.email,
        role: item.role,
        expires_at: item.expires_at,
        created_at: item.created_at,
        created_by: {
          name: item.users?.name,
          email: item.users?.email
        }
      }));

      setInvitations(formattedInvitations);
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  // Set active workspace and save to localStorage
  const handleSetActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('activeWorkspaceId', workspace.id);
  };

  // Create a new workspace
  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Add to workspaces list
      const newWorkspace = {
        ...data,
        role: 'owner' as const
      };
      
      setWorkspaces(prev => [newWorkspace, ...prev]);
      
      // Set as active workspace
      handleSetActiveWorkspace(newWorkspace);
      
      return newWorkspace;
    } catch (err) {
      console.error('Error creating workspace:', err);
      throw err;
    }
  };

  // Update workspace details
  const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: data.name,
          logo_url: data.logo_url
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setWorkspaces(prev => 
        prev.map(w => w.id === id ? { ...w, ...data } : w)
      );
      
      if (activeWorkspace?.id === id) {
        setActiveWorkspace(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (err) {
      console.error('Error updating workspace:', err);
      throw err;
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      
      // If active workspace was deleted, set a new active workspace
      if (activeWorkspace?.id === id) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== id);
        if (remainingWorkspaces.length > 0) {
          handleSetActiveWorkspace(remainingWorkspaces[0]);
        } else {
          setActiveWorkspace(null);
          localStorage.removeItem('activeWorkspaceId');
        }
      }
    } catch (err) {
      console.error('Error deleting workspace:', err);
      throw err;
    }
  };

  // Invite a user to the workspace
  const inviteMember = async (email: string, role: 'admin' | 'member'): Promise<void> => {
    if (!activeWorkspace || !user) throw new Error('No active workspace or user not authenticated');

    try {
      const { error } = await supabase
        .rpc('invite_user_to_workspace', {
          workspace_uuid: activeWorkspace.id,
          user_email: email,
          user_role: role,
          inviter_uuid: user.id
        });

      if (error) throw error;

      // Refresh invitations
      loadWorkspaceInvitations();
    } catch (err) {
      console.error('Error inviting member:', err);
      throw err;
    }
  };

  // Remove a member from the workspace
  const removeMember = async (userId: string): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace');

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  // Update a member's role
  const updateMemberRole = async (userId: string, role: 'admin' | 'member'): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace');

    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('workspace_id', activeWorkspace.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setMembers(prev => 
        prev.map(m => m.id === userId ? { ...m, role } : m)
      );
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  // Cancel an invitation
  const cancelInvitation = async (invitationId: string): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace');

    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('workspace_id', activeWorkspace.id);

      if (error) throw error;

      // Update local state
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
    } catch (err) {
      console.error('Error canceling invitation:', err);
      throw err;
    }
  };

  // Accept an invitation
  const acceptInvitation = async (token: string): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .rpc('accept_workspace_invitation', {
          invitation_token: token,
          user_uuid: user.id
        });

      if (error) throw error;

      // Refresh workspaces if invitation was accepted
      if (data) {
        await loadWorkspaces();
      }

      return !!data;
    } catch (err) {
      console.error('Error accepting invitation:', err);
      throw err;
    }
  };

  // Refresh workspaces
  const refreshWorkspaces = async (): Promise<void> => {
    await loadWorkspaces();
  };

  const contextValue: WorkspaceContextType = {
    workspaces,
    activeWorkspace,
    members,
    invitations,
    subscription,
    isLoading,
    error,
    setActiveWorkspace: handleSetActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
    cancelInvitation,
    acceptInvitation,
    refreshWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}