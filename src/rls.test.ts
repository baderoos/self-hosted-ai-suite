import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !serviceRole || !anonKey) {
  throw new Error('Missing required Supabase environment variables');
}
const supabase = createClient(supabaseUrl, anonKey);
const admin = createClient(supabaseUrl, serviceRole);

let workspaceId: string;
let nonMemberUser: { email: string } | undefined;

beforeAll(async () => {
  // Find workspace seeded by scripts
  const { data: ws, error } = await admin
    .from('workspaces')
    .select('id')
    .eq('name', 'Demo Workspace')
    .single();
  if (error || !ws) {
    throw new Error('Demo Workspace not found. Ensure database is properly seeded.');
  }
  workspaceId = ws.id;  // Ensure a non-member user exists for testing
  const { data: users } = await admin.auth.admin.listUsers();
  nonMemberUser = users.users.find((u: any) => u.email === 'nonmember@example.com');
});

describe('Workspace Access Control (RLS)', () => {
  it('should allow access to workspaces for members', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(error).toBeNull();
    expect(data?.session).toBeTruthy();
    const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${data.session.access_token}` } } });
    const { data: ws, error: wsErr } = await client.from('workspaces').select('*').eq('id', workspaceId).single();
    expect(wsErr).toBeNull();
    expect(ws).toBeTruthy();
  });

  it('should deny access to workspaces for non-members', async () => {
    if (!nonMemberUser) {
      throw new Error('Non-member user not found. Ensure seedUsers script has been run.');
    }    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonmember@example.com',
      password: 'password123',
    });
    expect(error).toBeNull();
    expect(data?.session).toBeTruthy();
    const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${data.session.access_token}` } } });
    const { data: ws, error: wsErr } = await client.from('workspaces').select('*').eq('id', workspaceId).single();
    expect(ws).toBeNull();
    expect(wsErr).not.toBeNull();
  });
});
