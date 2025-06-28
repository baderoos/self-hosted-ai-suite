/*
  # Fix workspace_admin_manage policy recursion

  1. Changes
     - Drop the problematic workspace_admin_manage policy
     - Recreate the policy with corrected join conditions to prevent infinite recursion
     - The issue was in the self-referencing condition: workspace_members_1.workspace_id = workspace_members_1.workspace_id
     - Fixed by properly referencing the outer table: workspace_members_1.workspace_id = workspace_members.workspace_id

  2. Security
     - Maintains the same security model but fixes the recursion issue
     - Admins can still manage members of workspaces they belong to
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "workspace_admin_manage" ON workspace_members;

-- Recreate the policy with the corrected logic
CREATE POLICY "workspace_admin_manage"
  ON workspace_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members workspace_members_1
      WHERE workspace_members_1.workspace_id = workspace_members.workspace_id
      AND workspace_members_1.user_id = auth.uid()
      AND workspace_members_1.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members workspace_members_1
      WHERE workspace_members_1.workspace_id = workspace_members.workspace_id
      AND workspace_members_1.user_id = auth.uid()
      AND workspace_members_1.role = 'admin'
    )
  );