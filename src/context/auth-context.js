import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const u = api.getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = (email, password) => {
    const result = api.loginUser(email, password);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  };

  const register = (email, password, fullName, studentId, phone, role = "student", securityCode) => {
    const result = api.registerUser(email, password, fullName, studentId, phone, role, securityCode);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  };

  const logout = () => { api.logoutUser(); setUser(null); };

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
