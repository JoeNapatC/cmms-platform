"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Wrench } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        // Check if session is established
        const session = await getSession();
        if (session) {
          router.push(callbackUrl);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "technician" | "manager") => {
    setIsLoading(true);
    setError("");

    const demoCredentials = {
      admin: { email: "admin@cmms.com", password: "admin123" },
      technician: { email: "tech@cmms.com", password: "tech123" },
      manager: { email: "manager@cmms.com", password: "manager123" },
    };

    try {
      const result = await signIn("credentials", {
        email: demoCredentials[role].email,
        password: demoCredentials[role].password,
        redirect: false,
      });

      if (result?.error) {
        setError("Demo login failed. Please try again.");
      } else {
        const session = await getSession();
        if (session) {
          router.push(callbackUrl);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CMMS Platform</h1>
          </div>
          <p className="text-gray-600">Computerized Maintenance Management System</p>
        </div>

        {/* Sign In Form */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sign In</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the CMMS platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Messages */}
            {(error || errorParam) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || (errorParam === "CredentialsSignin" ? "Invalid credentials" : "Authentication error")}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("manager")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo Manager
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("technician")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo Technician
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600">
              <p>Use demo accounts to explore the platform</p>
              <p className="mt-1">
                <span className="font-medium">Admin:</span> Full access • 
                <span className="font-medium"> Manager:</span> Planning & reports • 
                <span className="font-medium"> Technician:</span> Work orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 CMMS Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}