"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, error, signIn, clearError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const hasRedirected = useRef(false);

  // Redirect if already authenticated (only once)
  useEffect(() => {
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/admin/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      const success = await signIn(email, password);

      if (success) {
        // Navigate to dashboard on successful login
        hasRedirected.current = true;
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render form if already authenticated
  if (!loading && user) {
    return null;
  }

  return (
    <>
      <PageHero
        title="Admin Login"
        description="Please sign in to access the admin dashboard"
        backgroundImage="/images/code-bg.jpg"
      />

      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the contact form submissions dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isProcessing || loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isProcessing || loading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isProcessing || loading || !email || !password}
                  className="w-full sm:w-auto"
                >
                  {isProcessing || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              This area is restricted to administrators only
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
