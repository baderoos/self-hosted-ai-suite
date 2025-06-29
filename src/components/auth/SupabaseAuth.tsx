import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/auth-js';

export default function SupabaseAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup function to unsubscribe from the listener
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        // Clear form on success
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('Unexpected error during sign up');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        // Clear form on success
        setEmail('');
        setPassword('');
      }
        <form onSubmit={handleSignIn} noValidate>
          <input
            className="block w-full mb-2 p-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
            autoComplete="email"
          />
          <input
            className="block w-full mb-2 p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
            autoComplete="current-password"
            minLength={6}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
              aria-label="Sign in to your account"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
              aria-label="Create a new account"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-2" role="alert" aria-live="polite">
              {error}
            </p>
          )}
        </form>      ) : (
        <form onSubmit={handleSignIn}>
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
              onClick={handleSignUp}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}
    </div>
  );
}
