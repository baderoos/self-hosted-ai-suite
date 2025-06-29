import express from 'express';
-import { supabase } from '../src/lib/supabaseClient';
+import { supabase } from '../lib/supabaseClient';
const router = express.Router();

// Get all users (admin only)
router.get('/users', async (req, res) => {
  // TODO: Add admin auth check
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.users);
});

// Change user role (admin only)
router.post('/users/:id/role', async (req, res) => {
  // TODO: Add admin auth check
  const { id } = req.params;
  const { role, workspace_id } = req.body;
  if (!workspace_id) {
    return res.status(400).json({ error: 'workspace_id is required' });
  }
  // Update role in workspace_members for the specific workspace
  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('user_id', id)
    .eq('workspace_id', workspace_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Add user to workspace
router.post('/workspaces/:id/add-user', async (req, res) => {
  const { id: workspace_id } = req.params;
  const { userId } = req.body;
  // Default role: member
  const { error } = await supabase.from('workspace_members').insert({ workspace_id, user_id: userId, role: 'member' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Get all workspaces
router.get('/workspaces', async (req, res) => {
  const { data, error } = await supabase.from('workspaces').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create workspace
router.post('/workspaces', async (req, res) => {
  const { name, owner_id } = req.body;
  const { data, error } = await supabase.from('workspaces').insert({ name, owner_id });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Rename workspace
router.post('/workspaces/:id/rename', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { error } = await supabase.from('workspaces').update({ name }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Delete workspace
router.delete('/workspaces/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('workspaces').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Deactivate/reactivate user
router.post('/users/:id/deactivate', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.auth.admin.updateUserById(id, { banned: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
router.post('/users/:id/reactivate', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.auth.admin.updateUserById(id, { banned: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Roles CRUD (example: create, rename, delete)
router.post('/roles', async (req, res) => {
  const { name } = req.body;
  const { error } = await supabase.from('roles').insert({ name });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
router.post('/roles/:id/rename', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { error } = await supabase.from('roles').update({ name }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
router.delete('/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Audit Log Table and Endpoints ---
// (Assume a table 'admin_audit_logs' with columns: id, action, user_id, details, created_at)

// Log an admin action
router.post('/audit-log', async (req, res) => {
  const { action, user_id, details } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required for audit log' });
  }

  const { error } = await supabase.from('admin_audit_logs').insert({ action, user_id, details });  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Get recent audit logs
router.get('/audit-log', async (req, res) => {
  const { data, error } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
