import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, AlertCircle, Building, Eye, EyeOff } from 'lucide-react';
import { DepartmentId, DeptAccount, Role } from '../types';
import { loginWithGoogle, loginFacultyWithPassword } from '../utils/authService';

interface FacultyLoginViewProps {
  onBackToLanding: () => void;
  onSuccess: (account: DeptAccount, dept: DepartmentId | 'hod' | 'dean' | 'director' | 'verification_officer') => void;
}

export const FacultyLoginView: React.FC<FacultyLoginViewProps> = ({
  onBackToLanding,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    const { session, error: loginError } = await loginFacultyWithPassword(email.trim(), password);
    
    setIsSubmitting(false);

    if (loginError) {
      setError(loginError);
    } else if (session && (session.role === 'dept_admin' || session.role === 'hod' || session.role === 'dean' || session.role === 'director' || session.role === 'verification_officer') && session.deptAccount && session.activeDepartment) {
      onSuccess(session.deptAccount, session.activeDepartment as any);
    } else {
      setError('Unauthorized email address or not recognized as a Faculty/Admin account.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const { session, error: loginError } = await loginWithGoogle();
    setIsSubmitting(false);

    if (loginError) {
      if (loginError === 'cancelled') {
        setError(null);
      } else {
        setError(loginError);
      }
    } else if (session && (session.role === 'dept_admin' || session.role === 'hod' || session.role === 'dean' || session.role === 'director' || session.role === 'verification_officer') && session.deptAccount && session.activeDepartment) {
      onSuccess(session.deptAccount, session.activeDepartment as any);
    } else {
      setError('Unauthorized email address or not recognized as a Faculty/Admin account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Top Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Faculty & Admin Gateway
          </span>
        </div>

        {/* View Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Faculty & Admin Sign-In
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Authenticate using your official department or administrative Google account.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-2xl border-2 border-slate-300 hover:border-indigo-400 shadow-xs transition-all flex items-center justify-center space-x-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="group-hover:text-indigo-600 transition-colors">
              Sign in with Google Workspace
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Or Sign In with Email & Password
          </span>
        </div>

        {/* Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. admin@rguktrkv.ac.in"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl shadow-md shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In with Password'
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-slate-100 flex items-start space-x-2.5 text-slate-500">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <p className="text-[10px] leading-relaxed">
            Your login automatically identifies your department access scope. All clearance and payment actions are digitally signed and recorded for institutional audit.
          </p>
        </div>
      </div>
    </div>
  );
};
