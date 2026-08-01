'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col justify-center items-center relative overflow-hidden px-4" suppressHydrationWarning>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md relative z-10" suppressHydrationWarning>
        <div className="text-center mb-8" suppressHydrationWarning>
          <Link href="/" className="text-3xl font-bold gradient-text-primary tracking-tight inline-block mb-2 hover:scale-105 transition-transform">
            ✨ NoteGenius
          </Link>
          <h2 className="text-2xl font-bold text-white mt-4">Welcome back</h2>
          <p className="text-slate-400 mt-2">Enter your credentials to access your account</p>
        </div>

        <div className="glass-card p-8 rounded-2xl shadow-2xl" suppressHydrationWarning>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" 
                placeholder="you@example.com"
                suppressHydrationWarning
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-primary hover:text-primary-hover transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••"
                suppressHydrationWarning
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full justify-center py-3 relative overflow-hidden group"
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center justify-center gap-2">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
