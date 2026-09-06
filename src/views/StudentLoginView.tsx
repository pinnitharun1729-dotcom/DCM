import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, User, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleSignInModal } from '../components/GoogleSignInModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { StudentProfile } from '../types';
import { authenticateStudent, getStudents } from '../utils/storage';

interface StudentLoginViewProps {
  onBackToLanding: () => void;
  onSuccess: (student: StudentProfile) => void;
}

export const StudentLoginView: React.FC<StudentLoginViewProps> = ({
  onBackToLanding,
  onSuccess,
}) => {
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  
  // Email + Password state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // First-time change password modal state
  const [pendingStudent, setPendingStudent] = useState<StudentProfile | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim()) {
      setLoginError('Please enter your official email or roll number.');
      return;
    }

    if (!password) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const result = authenticateStudent(identifier, password);

      if (!result.success || !result.student) {
        setLoginError(result.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      // Check if student is on default roll-number password
      if (result.requiresPasswordChange || !result.student.hasChangedPassword) {
        setPendingStudent(result.student);
        setIsChangePasswordOpen(true);
      } else {
        onSuccess(result.student);
      }
    }, 400);
  };

  const handleQuickFill = (roll: string) => {
    const cleanRoll = roll.toLowerCase();
    setIdentifier(`${cleanRoll}@rguktrkv.ac.in`);
    setPassword(cleanRoll);
    setLoginError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Back navigation */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal Home</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Portal Sign-In
          </h2>
          <p className="text-xs text-slate-500">
            Access your department clearance records, fine payments & certificates
          </p>
        </div>

        {/* Primary Option: Google Workspace SSO */}
        <div className="space-y-2">
          <button
            id="btn-student-google-signin"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-2xl border-2 border-slate-300 hover:border-blue-400 shadow-xs transition-all flex items-center justify-center space-x-3 cursor-pointer group"
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
            <span className="group-hover:text-blue-600 transition-colors">
              Sign in with Google (Primary)
            </span>
          </button>
          <p className="text-[11px] text-center text-slate-400">
            One-click authentication for institutional Google Workspace accounts
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Or Sign In with Email & Password
          </span>
        </div>

        {/* Fallback Form: Email/Roll No + Password */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          {loginError && (
            <div
              id="student-login-error"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email or Roll Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-student-identifier"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (loginError) setLoginError(null);
              }}
              placeholder="e.g. r240086@rguktrkv.ac.in or r240086"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Default: roll number (e.g. <span className="font-mono">r240086</span>)
              </span>
            </div>
            <div className="relative">
              <input
                id="input-student-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder="Enter password (default: your roll number)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-student-password-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In with Password'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span className="flex items-center space-x-1.5 text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Test Credentials (81 Students Dataset)</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any demo student below to auto-fill their credentials:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { roll: 'r240086', name: 'Vikrant (CSE - Dues)' },
              { roll: 'r240212', name: 'Tharun (CSE - Receipt)' },
              { roll: 'o240635', name: 'Navyakala (AIML)' },
              { roll: 'r240359', name: 'Jai Sai (ECE)' },
              { roll: 'r240639', name: 'Varshitha (EEE - Ready)' },
              { roll: 's241324', name: 'A. Sarath (CHEM - Cert)' },
            ].map((st) => (
              <button
                key={st.roll}
                type="button"
                onClick={() => handleQuickFill(st.roll)}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors font-mono cursor-pointer"
              >
                {st.roll} • {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Security watermark */}
        <div className="p-3 bg-slate-50/50 rounded-xl text-[11px] text-center text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Passwords securely hashed. Prompted to update on first login.</span>
        </div>
      </div>

      {/* Google Sign-in Verification Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(student) => {
          setIsGoogleModalOpen(false);
          // If student logged in with Google, they can proceed directly
          onSuccess(student);
        }}
      />

      {/* First-time Change Password Modal */}
      {pendingStudent && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          student={pendingStudent}
          onComplete={(updatedStudent) => {
            setIsChangePasswordOpen(false);
            setPendingStudent(null);
            onSuccess(updatedStudent);
          }}
          onSkip={() => {
            setIsChangePasswordOpen(false);
            onSuccess(pendingStudent);
            setPendingStudent(null);
          }}
        />
      )}
    </div>
  );
};

