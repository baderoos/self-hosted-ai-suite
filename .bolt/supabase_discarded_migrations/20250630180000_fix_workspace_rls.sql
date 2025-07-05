-- Drop all existing workspace policies to prevent recursion and ensure clean state
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "workspace_member_access" ON workspaces;
DROP POLICY IF EXISTS "workspace_owner_access" ON workspaces;
DROP POLICY IF EXISTS "allow_workspace_creation" ON workspaces;
DROP POLICY IF EXISTS "allow_owner_access" ON workspaces;
DROP POLICY IF EXISTS "allow_member_view" ON workspaces;

-- Ensure RLS is enabled on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create non-recursive workspace policies
CREATE POLICY "allow_workspace_creation"
  ON workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "allow_owner_access"
  ON workspaces
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

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

-- Drop all existing workspace_members policies
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

-- Ensure RLS is enabled on workspace_members
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Create non-recursive workspace_members policies
CREATE POLICY "member_view_own"
  ON workspace_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "member_insert_own"
  ON workspace_members
  FOR INSERT
  TO authenticated
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
  TO authenticated
  USING (user_id = auth.uid());CREATE POLICY "workspace_owner_manage"
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

-- Create a SECURITY DEFINER function to check if a user is an admin in a workspace, bypassing RLS
CREATE OR REPLACE FUNCTION is_workspace_admin(workspace_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = is_workspace_admin.workspace_id
      AND workspace_members.user_id = is_workspace_admin.user_id
      AND workspace_members.role = 'admin'
  );
END;
$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_workspace_admin(uuid, uuid) TO authenticated;

-- Update workspace_admin_manage policy to use the function
DROP POLICY IF EXISTS "workspace_admin_manage" ON workspace_members;
CREATE POLICY "workspace_admin_manage"
  ON workspace_members
  FOR ALL
  TO authenticated
  USING (
    is_workspace_admin(workspace_members.workspace_id, auth.uid())
  )
  WITH CHECK (
    is_workspace_admin(workspace_members.workspace_id, auth.uid())
  );
