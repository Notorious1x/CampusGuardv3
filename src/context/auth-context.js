import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setUser(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id);
      else { setUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (email, password) => {
    const result = await api.loginUser(email, password);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  };

  const register = async (email, password, fullName, studentId, phone, role = "student", securityCode) => {
    const result = await api.registerUser(email, password, fullName, studentId, phone, role, securityCode);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  };

  const logout = async () => { await api.logoutUser(); setUser(null); };

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadProfile(session.user.id);
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
