/*
  # Add Workspace Members RPC Function

  1. New Functions
    - Add get_workspace_members RPC function for simplified member loading
*/

-- Create a function to get workspace members with user details
CREATE OR REPLACE FUNCTION get_workspace_members(workspace_uuid UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    wm.user_id AS id,
    u.email,
    p.name,
    wm.role,
    p.avatar_url,
    wm.created_at AS joined_at
  FROM
    workspace_members wm
  LEFT JOIN
    auth.users u ON wm.user_id = u.id
  LEFT JOIN
    profiles p ON wm.user_id = p.user_id
  WHERE
    wm.workspace_id = workspace_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_workspace_members TO authenticated;