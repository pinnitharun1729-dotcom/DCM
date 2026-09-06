import React, { useState } from 'react';
import { Check, Copy, KeyRound, Shield, User, X, RefreshCw } from 'lucide-react';
import { SEED_DEPT_ACCOUNTS, SEED_STUDENTS } from '../constants';
import { resetDemoData } from '../utils/storage';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudentEmail?: (email: string) => void;
  onSelectDeptAccount?: (account: (typeof SEED_DEPT_ACCOUNTS)[0]) => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  onSelectStudentEmail,
  onSelectDeptAccount,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleReset = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-demo-credentials"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Demo Accounts & Test Credentials
              </h3>
              <p className="text-xs text-slate-500">
                Real role-based logins with strict RGUKT email and password authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Students */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-1">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">
                  1. Student Accounts (Google Sign-In OR Email + Password)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Password: <strong className="text-slate-800 font-mono">roll number</strong> (e.g. <span className="text-blue-700">r240086</span>)
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-2.5 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              Full dataset of <strong>81 RGUKT RK Valley students</strong> is loaded. Each student can log in via <strong>Google SSO</strong> or <strong>Email/Roll No + Password</strong> (default password is their roll number). On first login, students are prompted to set a custom password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SEED_STUDENTS.slice(0, 6).map((st) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{st.name}</p>
                    <p className="font-mono text-blue-700 font-semibold">{st.email}</p>
                    <p className="text-[11px] text-slate-500">
                      {st.branch} •{' '}
                      <span className="font-semibold text-slate-700">
                        {st.id === 'r240086'
                          ? '2 Pending Dues (Test Pay & Upload)'
                          : st.id === 'r240212'
                          ? 'Receipt Uploaded (Test Admin Verify)'
                          : st.id === 'r240639'
                          ? '5 Depts Cleared (Test HOD Sign-off)'
                          : st.id === 's241324'
                          ? 'PUC (Dean Approved Certificate)'
                          : 'Clean State'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(st.email)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Copy Email"
                  >
                    {copiedText === st.email ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Department Admin Accounts */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-800">
                  2. Department Admin & HOD/Dean Accounts (Dept Google Email + Password)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">Admin issued passwords</span>
            </div>

            <div className="space-y-2">
              {SEED_DEPT_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{acc.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        {acc.department}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Officer: {acc.officerName} ({acc.designation})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono">
                      <span className="text-slate-500">Email: </span>
                      <span className="text-indigo-700 font-semibold">{acc.email}</span>
                    </div>
                    <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono">
                      <span className="text-slate-500">Pass: </span>
                      <span className="text-amber-700 font-bold">{acc.password}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(`${acc.email} | ${acc.password}`)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                      title="Copy Login Details"
                    >
                      {copiedText === `${acc.email} | ${acc.password}` ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Reset Database button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            title="Reset database to initial seed state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetSuccess ? 'animate-spin' : ''}`} />
            <span>{resetSuccess ? 'Data Reset!' : 'Reset Demo Data'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
