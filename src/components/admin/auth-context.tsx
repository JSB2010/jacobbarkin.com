"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService, AuthUser } from "@/lib/appwrite/auth";
import { directAuthService } from "@/lib/appwrite/direct-auth";

// Define the authentication context type
interface AdminAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  clearError: () => void;
  checkSession: () => Promise<void>;
}

// Create the context with default values
const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => false,
  signOut: async () => false,
  clearError: () => {},
  checkSession: async () => {},
});

// Custom hook to use the auth context
export const useAdminAuth = () => useContext(AdminAuthContext);

// Auth provider component
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  // Function to check authentication status
  const checkSession = useCallback(async () => {
    if (sessionChecked) return;

    setLoading(true);

    try {
      // Try with direct auth first (which includes session restoration)
      try {
        const currentUser = await directAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setSessionChecked(true);
          setLoading(false);
          return;
        }
      } catch (directErr) {
        console.warn("Direct auth failed, falling back to original auth:", directErr);
      }

      // Fall back to original auth if direct auth fails
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setSessionChecked(true);
      }
    } catch (err) {
      console.error("Error checking authentication:", err);
    } finally {
      setLoading(false);
      setSessionChecked(true);
    }
  }, [sessionChecked]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Try with direct auth first
      try {
        const result = await directAuthService.signIn(email, password);

        if ('type' in result) {
          // This is an error
          setError(result.message);
          return false;
        } else {
          // This is a user
          setUser(result);
          return true;
        }
      } catch (directErr) {
        console.warn("Direct auth failed, falling back to original auth:", directErr);
      }

      // Fall back to original auth if direct auth fails
      const result = await authService.signIn(email, password);

      if ('type' in result) {
        // This is an error
        setError(result.message);
        return false;
      } else {
        // This is a user
        setUser(result);
        return true;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign in";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<boolean> => {
    setLoading(true);

    try {
      // Try with direct auth first
      try {
        const success = await directAuthService.signOut();
        if (success) {
          setUser(null);
          return success;
        }
      } catch (directErr) {
        console.warn("Direct auth failed, falling back to original auth:", directErr);
      }

      // Fall back to original auth if direct auth fails
      const success = await authService.signOut();
      if (success) {
        setUser(null);
      }
      return success;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign out";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
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
    checkSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
