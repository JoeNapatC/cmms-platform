"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Home, RefreshCw, Wrench } from "lucide-react";

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
  CredentialsSignin: "Invalid credentials provided.",
  EmailSignin: "Unable to send email. Check your email address.",
  OAuthSignin: "Error in constructing an authorization URL.",
  OAuthCallback: "Error in handling the response from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked: "The email on the account is already linked, but not with this OAuth account.",
  SessionRequired: "You must be signed in to view this page.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errorMessages;
  
  const errorMessage = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.Default;

  const getErrorIcon = () => {
    switch (error) {
      case "AccessDenied":
      case "SessionRequired":
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (error) {
      case "AccessDenied":
        return "Access Denied";
      case "SessionRequired":
        return "Authentication Required";
      case "CredentialsSignin":
        return "Invalid Credentials";
      case "Configuration":
        return "Server Configuration Error";
      default:
        return "Authentication Error";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CMMS Platform</h1>
          </div>
        </div>

        {/* Error Card */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getErrorIcon()}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-red-600">
                {getErrorTitle()}
              </CardTitle>
              <CardDescription className="text-gray-600">
                We encountered an issue while trying to authenticate you
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {errorMessage}
              </AlertDescription>
            </Alert>

            {/* Error Details */}
            {error && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                    {error}
                  </span>
                </p>
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">What you can try:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Check your email and password are correct</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Clear your browser cache and cookies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Try using a different browser or incognito mode</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Contact your system administrator if the problem persists</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {/* Support Information */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>Need help? Contact support at:</p>
              <p className="font-medium text-blue-600">support@cmms.com</p>
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