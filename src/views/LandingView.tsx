import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building,
  User,
  CheckCircle,
  FileCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  Lock,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { RGUKT_INFO } from '../constants';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { InAppNotification } from '../types';

interface LandingViewProps {
  onSelectStudentLogin: () => void;
  onSelectFacultyLogin: () => void;
  onOpenCredentials: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectStudentLogin,
  onSelectFacultyLogin,
  onOpenCredentials,
}) => {

  const { notifications } = useFirebaseData();
  const announcements = React.useMemo(() => {
    return notifications.filter(n => n.recipient_type === 'all' || n.recipient_id === 'all');
  }, [notifications]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 w-full">
        {/* University Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Official Academic Clearance Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {RGUKT_INFO.name}
          </h1>

          <p className="text-sm sm:text-base font-semibold text-slate-700">
            {RGUKT_INFO.campus} • {RGUKT_INFO.state}
          </p>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            A unified, paperless no-dues verification system with multi-department digital
            signatures, SBI Collect fee settlement, and instant cryptographic certificate release.
          </p>
        </div>

        {/* Two Login Types Cards as specified in Prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1: Student Login */}
          <div
            id="card-student-login-choice"
            onClick={onSelectStudentLogin}
            className="bento-card bento-card-hover p-6 sm:p-8 flex flex-col justify-between text-left group cursor-pointer border-slate-200/90 hover:border-[#075985]"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#075985] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#075985] uppercase tracking-wider block">
                  Students Portal
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 group-hover:text-[#075985] transition-colors">
                  Student Login
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Sign in using your institutional Google Workspace ID (
                  <code className="text-slate-800 font-mono font-semibold">rXXXXXX@rguktrkv.ac.in</code>
                  ) to track your no-dues status, pay fines on SBI Collect, and obtain your clearance certificate.
                </p>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  <Lock className="w-3.5 h-3.5 text-[#075985]" />
                  <span>Google Sign-In Only • No Password</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[#075985] font-bold text-sm">
              <span>Continue with Google</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Faculty/Admin Login */}
          <div
            id="card-faculty-login-choice"
            onClick={onSelectFacultyLogin}
            className="bento-card bento-card-hover p-6 sm:p-8 flex flex-col justify-between text-left group cursor-pointer border-slate-200/90 hover:border-slate-800"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Staff & Administrative Authority
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 group-hover:text-indigo-700 transition-colors">
                  Admin / Faculty Login
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Select your department (Library, Hostel, Lab, Finance, Sports, or HOD/Dean)
                  and authenticate with your official departmental Google account and administrative password.
                </p>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  <Building className="w-3.5 h-3.5 text-indigo-700" />
                  <span>6 Department Portals • Digital Signatures</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-700 font-bold text-sm">
              <span>Select Department</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* University Official Circulars & Portal Notifications Feed */}
        {announcements.length > 0 && (
          <div className="mt-8 max-w-3xl mx-auto bento-card p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Announcements & Portal Notifications
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Active academic circulars, clearance guidelines, and fee verification notices
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                Active Circulars
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {announcements.slice(0, 3).map((announcement) => (
                <div
                  key={announcement.id}
                  className="py-2.5 px-2 flex items-start space-x-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {announcement.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : announcement.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {announcement.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(announcement.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Flow Ribbon */}
        <div className="mt-14 max-w-4xl mx-auto p-6 bento-card">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
            Digital Clearance Workflow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-[#075985] font-bold text-xs flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <p className="text-xs font-bold text-slate-800">Student Google Login</p>
              <p className="text-[11px] text-slate-500 mt-0.5">rXXXXXX@rguktrkv.ac.in authentication</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <p className="text-xs font-bold text-slate-800">Clear Dues & Receipts</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pay on SBI Collect and upload receipts</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <p className="text-xs font-bold text-slate-800">5-Dept Digital Sign</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Staff verify receipts & apply crypto hashes</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <p className="text-xs font-bold text-slate-800">HOD / Dean Sign-off</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Download tamper-proof PDF certificate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Rajiv Gandhi University of Knowledge Technologies, RK Valley.
          </span>
          <button
            onClick={onOpenCredentials}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Need test accounts? Open Demo Credentials
          </button>
        </div>
      </footer>
    </div>
  );
};
