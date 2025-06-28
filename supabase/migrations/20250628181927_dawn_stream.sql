/*
  # Fix Workspace RLS Policy Infinite Recursion

  This migration fixes the infinite recursion issue in workspace policies by:
  1. Dropping conflicting policies that create circular dependencies
  2. Creating simplified, non-recursive policies
  3. Ensuring workspace creation works without policy conflicts

  ## Changes Made
  - Remove duplicate and conflicting policies
  - Simplify workspace access policies
  - Fix workspace creation policy to avoid recursion
*/

-- Drop all existing workspace policies to start fresh
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "workspace_member_access" ON workspaces;
DROP POLICY IF EXISTS "workspace_owner_access" ON workspaces;

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
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
    )
  );