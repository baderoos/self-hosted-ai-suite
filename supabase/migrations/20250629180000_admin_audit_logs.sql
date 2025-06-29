-- Migration: admin_audit_logs table for persistent admin action logging
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  user_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_audit_logs_created_at on admin_audit_logs(created_at desc);
