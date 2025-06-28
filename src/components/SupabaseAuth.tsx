import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/auth-js";

export default function SupabaseAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        console.error("Sign out error:", error.message);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Unexpected error during sign out.");
      console.error("Unexpected sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded shadow">
      {user === null && !loading ? (
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
      ) : user ? (
        <div>
          <p className="mb-4">Signed in as {user.email}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="text-center">Loading...</div>
      )}
    </div>
  );
}

