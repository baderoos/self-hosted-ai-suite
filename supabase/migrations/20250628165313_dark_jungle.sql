/*
  # Fix workspace RLS policies to prevent infinite recursion

  1. Security Changes
    - Drop existing problematic policies
    - Create new simplified policies without recursion
    - Ensure proper workspace access control

  2. Policy Updates
    - workspace_view_access: Allow users to view workspaces they own or are members of
    - Users can create workspaces: Allow authenticated users to create workspaces
    - Workspace owners can update their workspaces: Allow owners to update
    - Workspace owners can delete their workspaces: Allow owners to delete
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "workspace_view_access" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;

-- Create new simplified policies
CREATE POLICY "workspace_view_access" 
  ON workspaces 
  FOR SELECT 
  TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" 
  ON workspaces 
  FOR INSERT 
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces" 
  ON workspaces 
  FOR UPDATE 
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces" 
  ON workspaces 
  FOR DELETE 
  TO authenticated
  USING (owner_id = auth.uid());