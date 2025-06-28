import React from 'react';

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
}

export function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSignIn,
  onSignUp
}: AuthFormProps) {
  return (
    <form onSubmit={onSignIn}>
      <input
        className="block w-full mb-2 p-2 border rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="block w-full mb-2 p-2 border rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={onSignUp}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}