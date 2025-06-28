/*
  # Fix Workspace Policies

  1. Changes
    - Fix infinite recursion in workspace policies
    - Simplify workspace member access policies
    - Update workspace owner policies
*/

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "workspace_view_access" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;

-- Create simplified policies that avoid recursion
CREATE POLICY "workspace_owner_access" 
ON workspaces
FOR ALL
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "workspace_member_access" 
ON workspaces
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Fix workspace_members policies
DROP POLICY IF EXISTS "admin_manage_members" ON workspace_members;
DROP POLICY IF EXISTS "owner_manage_all" ON workspace_members;

CREATE POLICY "workspace_admin_manage" 
ON workspace_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE 
      workspace_id = workspace_members.workspace_id AND 
      user_id = auth.uid() AND 
      role = 'admin'
  )
);

CREATE POLICY "workspace_owner_manage" 
ON workspace_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM workspaces 
    WHERE 
      id = workspace_members.workspace_id AND 
      owner_id = auth.uid()
  )
);