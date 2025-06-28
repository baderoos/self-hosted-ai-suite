import React from 'react';
import type { User } from "@supabase/auth-js";

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Welcome</h2>
      <p className="mb-2">
        <strong>Email:</strong> {user.email}
      </p>
      <p className="mb-4">
        <strong>ID:</strong> {user.id.substring(0, 8)}...
      </p>
      <button
        onClick={onSignOut}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}