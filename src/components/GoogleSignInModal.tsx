import React, { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle2, UserCheck, ShieldCheck, Search } from 'lucide-react';
import { StudentProfile } from '../types';
import { getStudentById, getStudents } from '../utils/storage';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: StudentProfile) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allStudents = useMemo(() => getStudents(), [isOpen]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return allStudents.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        s.branch.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [allStudents, searchQuery]);

  if (!isOpen) return null;

  // Supports RGUKT roll number patterns (e.g. R240086, O240635, S240549)
  const RGUKT_EMAIL_REGEX = /^[ros][0-9]{6}@rguktrkv\.ac\.in$/i;

  const handleValidateAndSignIn = (emailToTest: string) => {
    setErrorMessage(null);
    const cleanEmail = emailToTest.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your Google account email.');
      return;
    }

    if (!RGUKT_EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please sign in with your official RGUKT email matching [rollnumber]@rguktrkv.ac.in (e.g., r240086@rguktrkv.ac.in).');
      return;
    }

    setIsLoading(true);

    // Extract student ID from prefix (e.g., r240086)
    const studentId = cleanEmail.split('@')[0].toLowerCase();

    setTimeout(() => {
      setIsLoading(false);
      let student = getStudentById(studentId);

      if (!student) {
        // Fallback create
        student = {
          id: studentId,
          rollNumber: studentId.toUpperCase(),
          name: `Student (${studentId.toUpperCase()})`,
          email: cleanEmail,
          branch: 'Engineering',
          batch: '2024-2028',
          studentType: 'engineering',
          photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${studentId}`,
          phone: '+91 98480 00000',
          admissionYear: 2024,
        };
      }

      onSuccess(student);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="google-signin-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Google G SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500">
                to continue to RGUKT No-Dues Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Domain Notice Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Domain Restricted:</strong> Official institutional accounts matching{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">
                [rollnumber]@rguktrkv.ac.in
              </code>{' '}
              are permitted.
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              id="google-signin-error"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Account Email Address
            </label>
            <input
              id="input-google-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. r240086@rguktrkv.ac.in"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleValidateAndSignIn(email);
              }}
            />
          </div>

          {/* Submit Action */}
          <button
            id="btn-google-submit"
            disabled={isLoading}
            onClick={() => handleValidateAndSignIn(email)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying RGUKT Identity...</span>
              </span>
            ) : (
              <span>Proceed to Student Portal</span>
            )}
          </button>

          {/* Quick Select Pre-loaded RGUKT Accounts for easy testing */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Select RGUKT Account to Test ({allStudents.length} Students):
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, roll, branch..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setEmail(student.email);
                    handleValidateAndSignIn(student.email);
                  }}
                  className="w-full p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                        {student.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {student.branch.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Protected by RGUKT RK Valley SSO & Academic Verification
        </div>
      </div>
    </div>
  );
};
