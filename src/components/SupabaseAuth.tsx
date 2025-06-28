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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
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
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else setUser(data.user);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
