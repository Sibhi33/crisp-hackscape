'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Apple, Chrome, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const success = await signUpWithEmail(email, password, name);
        if (success) {
          // Clear form fields if needed
          setEmail('');
          setPassword('');
          setName('');
          // Set a message informing the user that a verification email has been sent.
          setVerificationMessage(
            'A verification email has been sent to your email address. Please verify your account and then sign in.'
          );
          // Switch to sign in mode so they can log in.
          setIsSignUp(false);
        }
      } else {
        const success = await signInWithEmail(email, password);
        if (success) {
          // Redirect to home page on successful sign in
          router.push('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithApple();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 glassmorphism">
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-muted-foreground text-center">
          {isSignUp ? 'Sign up to get started' : 'Sign in to continue to Crisp'}
        </p>

        {/* Show verification message if it exists */}
        {verificationMessage && (
          <div className="p-2 bg-blue-100 text-blue-800 rounded text-sm text-center">
            {verificationMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleAppleSignIn}
            type="button"
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Apple className="w-5 h-5" />
                <span>Continue with Apple</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
