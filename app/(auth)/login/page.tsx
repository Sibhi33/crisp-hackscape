'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WavyBackground } from '@/components/ui/wavy-background';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUpWithEmail(email, password, name);
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background">
      <WavyBackground />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Card className="w-full max-w-md p-8 space-y-6 glassmorphism">
          <h2 className="text-2xl font-bold text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground text-center">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue to Crisp'}
          </p>

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
                  required={isSignUp}
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

            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
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
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#4285F4" d="M24 9.5c3.9 0 7.1 1.4 9.6 3.7l7.1-7.1C36.6 2.1 30.7 0 24 0 14.6 0 6.4 5.4 2.4 13.3l8.3 6.5C12.8 14.1 17.9 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.5 24c0-1.6-.1-3.1-.4-4.6H24v9.1h12.7c-.6 3.1-2.4 5.7-5 7.4l8.3 6.5C43.6 38.4 46.5 31.8 46.5 24z"/>
                <path fill="#FBBC05" d="M11.7 28.7c-1.1-3.1-1.1-6.5 0-9.6L3.4 12.6C-1.1 19.4-1.1 28.6 3.4 35.4l8.3-6.7z"/>
                <path fill="#EA4335" d="M24 46.5c6.7 0 12.6-2.2 16.8-6.1l-8.3-6.5c-2.3 1.5-5.2 2.4-8.5 2.4-6.1 0-11.3-4.1-13.1-9.6l-8.3 6.5C6.4 42.6 14.6 46.5 24 46.5z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={signInWithApple}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            ><div className='text-4xl'>
              <p>‮</p>
              </div>
              <span>Continue with Apple</span>
            </button>
          </div>
        </Card>
      </div>
      <style jsx>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Login;