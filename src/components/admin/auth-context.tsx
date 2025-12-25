"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authService, AuthUser } from "@/lib/appwrite/auth";

// Define the authentication context type
interface AdminAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  clearError: () => void;
}

// Create the context with default values
const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => false,
  signOut: async () => false,
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAdminAuth = () => useContext(AdminAuthContext);

// Auth provider component
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialCheckDone = useRef(false);

  // Function to check authentication status on mount
  const checkAuthStatus = useCallback(async () => {
    // Only check once on mount
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error checking authentication:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(email, password);

      if ('type' in result) {
        // This is an error
        setError(result.message);
        setLoading(false);
        return false;
      } else {
        // This is a user
        setUser(result);
        setLoading(false);
        return true;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign in";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const success = await authService.signOut();
      setUser(null);
      setLoading(false);
      return success;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign out";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
