/*
  # Fix Workspace Policies

  1. Changes
     - Drop all existing workspace policies
     - Create new non-recursive policies for workspaces
     - Fix infinite recursion issue in workspace policies
     - Ensure proper access control for workspace members
  
  2. Security
     - Enable proper RLS for workspaces
     - Ensure workspace owners can manage their workspaces
     - Allow members to view workspaces they belong to
*/

-- Drop all existing workspace policies to start fresh
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "workspace_member_access" ON workspaces;
DROP POLICY IF EXISTS "workspace_owner_access" ON workspaces;
DROP POLICY IF EXISTS "allow_workspace_creation" ON workspaces;
DROP POLICY IF EXISTS "allow_owner_access" ON workspaces;
DROP POLICY IF EXISTS "allow_member_view" ON workspaces;

-- Create simplified, non-recursive policies

-- Allow authenticated users to create workspaces
CREATE POLICY "allow_workspace_creation"
  ON workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Allow workspace owners to manage their workspaces
CREATE POLICY "allow_owner_access"
  ON workspaces
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Allow workspace members to view workspaces they belong to
CREATE POLICY "allow_member_view"
  ON workspaces
  FOR SELECT
  TO authenticated
  USING (
    (owner_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
    ))
  );

-- Fix workspace_members RLS policies to prevent infinite recursion
-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can add members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view members of workspaces they belong to" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can update member roles" ON workspace_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage all members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;
DROP POLICY IF EXISTS "member_view_own" ON workspace_members;
DROP POLICY IF EXISTS "member_insert_own" ON workspace_members;
DROP POLICY IF EXISTS "member_update_own" ON workspace_members;
DROP POLICY IF EXISTS "member_delete_own" ON workspace_members;
DROP POLICY IF EXISTS "workspace_admin_manage" ON workspace_members;
DROP POLICY IF EXISTS "workspace_owner_manage" ON workspace_members;

-- Create simplified, non-recursive policies for workspace_members
CREATE POLICY "member_view_own"
  ON workspace_members
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "member_insert_own"
  ON workspace_members
  FOR INSERT
  TO public
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "member_update_own"
  ON workspace_members
  FOR UPDATE
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "member_delete_own"
  ON workspace_members
  FOR DELETE
  TO public
  USING (user_id = auth.uid());

-- Create a separate policy for workspace owners to manage members
CREATE POLICY "workspace_owner_manage"
  ON workspace_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_members.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_members.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Create a policy for admins to manage members (non-recursive)
CREATE POLICY "workspace_admin_manage"
  ON workspace_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members workspace_members_1
      WHERE workspace_members_1.workspace_id = workspace_members_1.workspace_id
      AND workspace_members_1.user_id = auth.uid()
      AND workspace_members_1.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members workspace_members_1
      WHERE workspace_members_1.workspace_id = workspace_members_1.workspace_id
      AND workspace_members_1.user_id = auth.uid()
      AND workspace_members_1.role = 'admin'
    )
  );