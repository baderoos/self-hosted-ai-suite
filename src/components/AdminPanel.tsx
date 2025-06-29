import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role?: string;
}
interface Workspace {
  id: string;
  name: string;
}
interface Role {
  id: string;
  name: string;
}
interface AuditLog {
  id: string;
  action: string;
  user_id: string | null;
  details: any;
  created_at: string;
  user_email?: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [newWorkspace, setNewWorkspace] = useState('');
  const [newRole, setNewRole] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [persistentAuditLogs, setPersistentAuditLogs] = useState<AuditLog[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((users) => {
        setUsers(users);
        // For demo, assume first user is current admin
        setCurrentAdmin(users[0] || null);
      })
      .catch((error) => {
        console.error('Failed to fetch users:', error);
        notify('Failed to load users');
      });

    fetch('/api/admin/workspaces')
      .then((res) => res.json())
      .then(setWorkspaces);
    // TODO: Fetch roles from API
    setRoles([
      { id: 'admin', name: 'admin' },
      { id: 'member', name: 'member' },
    ]);
    // Fetch persistent audit logs
    fetch('/api/admin/audit-log')
      .then((res) => res.json())
      .then((logs: AuditLog[]) => setPersistentAuditLogs(logs));
  }, []);
  // Helper to log audit actions
  const logAuditAction = (action: string, details: any = {}) => {
    setAuditLogs((logs) => [`${new Date().toLocaleString()}: ${action}`, ...logs.slice(0, 99)]);
    fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        user_id: currentAdmin?.id || null,
        details,
      }),
    });
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
    logAuditAction(msg);
  };

  const confirmAction = (msg: string) => window.confirm(msg);

  const handleRoleChange = (userId: string, newRole: string) => {
    if (!confirmAction('Change user role?')) return;
    fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    }).then(() => {
      setUsers((users) => users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      notify(`Changed role for user ${userId} to ${newRole}`);
      logAuditAction(`Changed role for user ${userId} to ${newRole}`);
    });
  };

  const handleAddUserToWorkspace = (userId: string, workspaceId: string) => {
    if (!confirmAction('Add user to workspace?')) return;
    fetch(`/api/admin/workspaces/${workspaceId}/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).then(() => {
      notify(`Added user ${userId} to workspace ${workspaceId}`);
      logAuditAction(`Added user ${userId} to workspace ${workspaceId}`);
    });
  };

  const handleCreateWorkspace = () => {
    fetch('/api/admin/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWorkspace, owner_id: users[0]?.id }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewWorkspace('');
        fetch('/api/admin/workspaces')
          .then((res) => res.json())
          .then(setWorkspaces);
        notify(`Created workspace: ${newWorkspace}`);
        // Log to persistent audit log
        fetch('/api/admin/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Created workspace: ${newWorkspace}`,
            user_id: null, // Optionally set current admin user id
            details: {},
          }),
        });
      });
  };

  const handleRenameWorkspace = (id: string, name: string) => {
    if (!confirmAction('Rename workspace?')) return;
    fetch(`/api/admin/workspaces/${id}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(() => {
      fetch('/api/admin/workspaces')
        .then((res) => res.json())
        .then(setWorkspaces);
      notify(`Renamed workspace ${id} to ${name}`);
      // Log to persistent audit log
      fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Renamed workspace ${id} to ${name}`,
          user_id: null, // Optionally set current admin user id
          details: {},
        }),
      });
    });
  };

  const handleDeleteWorkspace = (id: string) => {
    if (!confirmAction('Delete workspace? This cannot be undone.')) return;
    fetch(`/api/admin/workspaces/${id}`, { method: 'DELETE' })
      .then(() =>
        fetch('/api/admin/workspaces')
          .then((res) => res.json())
          .then(setWorkspaces),
      )
      .then(() => {
        notify(`Deleted workspace ${id}`);
        // Log to persistent audit log
        fetch('/api/admin/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Deleted workspace ${id}`,
            user_id: null, // Optionally set current admin user id
            details: {},
          }),
        });
      });
  };

  const handleDeactivateUser = (id: string) => {
    if (!confirmAction('Deactivate user?')) return;
    fetch(`/api/admin/users/${id}/deactivate`, { method: 'POST' })
      .then(() =>
        fetch('/api/admin/users')
          .then((res) => res.json())
          .then(setUsers),
      )
      .then(() => {
        notify(`Deactivated user ${id}`);
        // Log to persistent audit log
        fetch('/api/admin/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Deactivated user ${id}`,
            user_id: null, // Optionally set current admin user id
            details: {},
          }),
        });
      });
  };
  const handleReactivateUser = (id: string) => {
    if (!confirmAction('Reactivate user?')) return;
    fetch(`/api/admin/users/${id}/reactivate`, { method: 'POST' })
      .then(() =>
        fetch('/api/admin/users')
          .then((res) => res.json())
          .then(setUsers),
      )
      .then(() => {
        notify(`Reactivated user ${id}`);
        // Log to persistent audit log
        fetch('/api/admin/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `Reactivated user ${id}`,
            user_id: null, // Optionally set current admin user id
            details: {},
          }),
        });
      });
  };

  const handleCreateRole = () => {
    fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRole }),
    }).then(() => {
      setNewRole('');
      notify(`Created role: ${newRole}`);
      // Optionally refetch roles
      // Log to persistent audit log
      fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Created role: ${newRole}`,
          user_id: null, // Optionally set current admin user id
          details: {},
        }),
      });
    });
  };
  const handleRenameRole = (id: string, name: string) => {
    if (!confirmAction('Rename role?')) return;
    fetch(`/api/admin/roles/${id}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(() => {
      notify(`Renamed role ${id} to ${name}`);
      // Log to persistent audit log
      fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Renamed role ${id} to ${name}`,
          user_id: null, // Optionally set current admin user id
          details: {},
        }),
      });
    });
  };
  const handleDeleteRole = (id: string) => {
    if (!confirmAction('Delete role? This cannot be undone.')) return;
    fetch(`/api/admin/roles/${id}`, { method: 'DELETE' }).then(() => {
      notify(`Deleted role ${id}`);
      // Log to persistent audit log
      fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `Deleted role ${id}`,
          user_id: null, // Optionally set current admin user id
          details: {},
        }),
      });
    });
  };

  return (
    <div className="p-8">
      {notification && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded border border-green-300">
          {notification}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="mb-2">
              {user.email} (ID: {user.id})
              <select
                value={user.role || ''}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value="">Add to workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleAddUserToWorkspace(user.id, selectedWorkspace)}
                disabled={!selectedWorkspace}
              >
                Add
              </button>
              <button
                className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded"
                onClick={() => handleDeactivateUser(user.id)}
              >
                Deactivate
              </button>
              <button
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                onClick={() => handleReactivateUser(user.id)}
              >
                Reactivate
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workspaces</h2>
        <input
          type="text"
          value={newWorkspace}
          onChange={(e) => setNewWorkspace(e.target.value)}
          placeholder="New workspace name"
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded"
          onClick={handleCreateWorkspace}
          disabled={!newWorkspace}
        >
          Create
        </button>
        <ul>
          {workspaces.map((ws) => (
            <li key={ws.id} className="mb-2">
              {ws.name} (ID: {ws.id})
              <button
                className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded"
                onClick={() => {
                  const newName = prompt('Rename workspace:', ws.name);
                  if (newName) handleRenameWorkspace(ws.id, newName);
                }}
              >
                Rename
              </button>
              <button
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDeleteWorkspace(ws.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Roles</h2>
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="New role name"
          className="border rounded px-2 py-1 mr-2"
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded"
          onClick={handleCreateRole}
          disabled={!newRole}
        >
          Create
        </button>
        <ul>
          {roles.map((role) => (
            <li key={role.id} className="mb-2">
              {role.name} (ID: {role.id})
              <button
                className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded"
                onClick={() => {
                  const newName = prompt('Rename role:', role.name);
                  if (newName) handleRenameRole(role.id, newName);
                }}
              >
                Rename
              </button>
              <button
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDeleteRole(role.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Audit Log (Session)</h2>
        <div className="bg-gray-100 border rounded p-2 max-h-48 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <div>No actions yet.</div>
          ) : (
            auditLogs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Audit Log (Persistent)</h2>
        <div className="bg-gray-100 border rounded p-2 max-h-48 overflow-y-auto text-xs">
          {persistentAuditLogs.length === 0 ? (
            <div>No actions yet.</div>
          ) : (
            persistentAuditLogs.map((log) => (
              <div key={log.id}>
                <span className="font-mono">[{new Date(log.created_at).toLocaleString()}]</span>
                <span className="font-semibold">
                  {users.find((u) => u.id === log.user_id)?.email || 'Unknown'}
                </span>
                :{log.action}
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}
