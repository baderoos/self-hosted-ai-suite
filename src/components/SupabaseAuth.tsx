import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/auth-js";
import { AuthForm } from "./auth/AuthForm";
import { UserProfile } from "./auth/UserProfile";

export default function SupabaseAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
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
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    const subscription = data?.subscription || data;

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <div className="max-w-sm mx-auto p-4 border rounded shadow">
      {user ? (
        <UserProfile
          user={user}
          onSignOut={async () => {
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
          }}
        />
      ) : (
        <AuthForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          onSignIn={async (e) => {
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
          }}
          onSignUp={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
            });
            if (error) {
              setError(error.message);
            } else if (data.user) {
              setUser(data.user);
            } else {
              // If user is null, confirmation may be required
              setError(
                "Sign-up successful! Please check your email to confirm your account before signing in."
              );
            }
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
