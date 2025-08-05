import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'password' | 'magic_link'>('magic_link'); // Default to magic link

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in or create an account to manage your habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={authMethod === 'magic_link' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('magic_link')}
              className="w-1/2"
            >
              Magic Link
            </Button>
            <Button
              variant={authMethod === 'password' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('password')}
              className="w-1/2"
            >
              Password
            </Button>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
            redirectTo={window.location.origin}
            magicLink={authMethod === 'magic_link'} // Applies to both sign-in and sign-up views
            // The 'view' prop is removed to allow the Auth component to manage its own view switching
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Your password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign In',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Don\'t have an account? Sign Up', // Link to switch to sign-up
                  confirmation_text: 'Check your email for the magic link!',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Create a password',
                  button_label: 'Sign Up',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Already have an account? Sign In', // Link to switch back to sign-in
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
                magic_link: {
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send Magic Link',
                  link_text: 'Send a magic link',
                  confirmation_text: 'Check your email for the magic link!',
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