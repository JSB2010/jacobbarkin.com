"use client";

import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Sign In</h1>
          <p className="text-muted-foreground mt-2">Authorized administrators only</p>
        </div>

        {/* Clerk Sign In */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-border shadow-xl rounded-xl w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-border hover:bg-muted",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerAction: "hidden",
              footer: "hidden",
              formFieldInput: "bg-background border-border",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary hover:text-primary/80",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorBackground: "hsl(var(--card))",
              colorInputBackground: "hsl(var(--background))",
              colorInputText: "hsl(var(--foreground))",
              borderRadius: "0.75rem",
            },
          }}
          fallbackRedirectUrl="/admin/dashboard"
        />
      </div>
    </div>
  );
}

