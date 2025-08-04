import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in or create an account to manage your habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]} // Only email/password (OTP)
            theme="light" // Or "dark" if you prefer
            redirectTo={window.location.origin} // Redirects to the app's root after successful login
            magicLink={true} // Enable email OTP
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Your password', // Not used for magic link, but required by type
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password', // Not used for magic link
                  button_label: 'Send Magic Link',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign In',
                  confirmation_text: 'Check your email for the magic link!',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password', // Not used for magic link
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a password', // Not used for magic link
                  button_label: 'Send Magic Link',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Don\'t have an account? Sign Up',
                  confirmation_text: 'Check your email for the magic link!',
                },
                forgotten_password: {
                  email_label: 'Email address',
                  password_label: 'Your password',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset password instructions',
                  link_text: 'Forgot your password?',
                  confirmation_text: 'Check your email for the password reset link!',
                },
                update_password: {
                  password_label: 'New password',
                  password_input_placeholder: 'Your new password',
                  button_label: 'Update password',
                  confirmation_text: 'Your password has been updated!',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;