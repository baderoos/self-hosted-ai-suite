-- supabase/seed.sql
-- Example seed data for self-hosted-ai-suite
-- Add your own seed data as needed

-- Insert a default workspace
insert into workspaces (id, name, description) values ('00000000-0000-0000-0000-000000000001', 'Demo Workspace', 'Default workspace for development and testing') on conflict do nothing;

-- Insert roles
insert into roles (id, name) values ('00000000-0000-0000-0000-000000000010', 'admin') on conflict do nothing;
insert into roles (id, name) values ('00000000-0000-0000-0000-000000000011', 'member') on conflict do nothing;

-- Insert a default user (replace with your own test email/password if needed)
-- insert into auth.users (email, encrypted_password) values ('test@example.com', crypt('password', gen_salt('bf')));
-- For Supabase, use the dashboard or auth API to create users, not direct SQL.

-- Insert a default workspace membership
-- insert into workspace_memberships (workspace_id, user_id, role_id) values (...);
-- You may need to look up IDs or use additional SQL for this.

-- Insert demo knowledge base category
insert into knowledge_base_categories (id, name, slug, description, position, is_active, workspace_id)
values ('00000000-0000-0000-0000-000000000100', 'General', 'general', 'General articles', 1, true, '00000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Insert demo knowledge base article
insert into knowledge_base_articles (id, category_id, title, slug, content, status, workspace_id)
values ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000100', 'Welcome', 'welcome', 'Welcome to the knowledge base!', 'published', '00000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Insert demo community tag
insert into community_tags (id, name, slug, description, workspace_id)
values ('00000000-0000-0000-0000-000000000300', 'help', 'help', 'Help and support', '00000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Add more seed data as needed for your app's tables.
