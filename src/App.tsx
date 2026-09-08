import React, { useState, useEffect } from 'react';
import { AuthSession, DepartmentId, DeptAccount, Role, StudentProfile } from './types';
import { clearSession, getSession, setSession, initStorage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { CredentialsModal } from './components/CredentialsModal';
import { LandingView } from './views/LandingView';
import { StudentLoginView } from './views/StudentLoginView';
import { FacultyLoginView } from './views/FacultyLoginView';
import { StudentDashboard } from './views/StudentDashboard';
import { DepartmentDashboard } from './views/DepartmentDashboard';
import { HodDashboard } from './views/HodDashboard';
import { TransactionVerificationDashboard } from './views/TransactionVerificationDashboard';
import { AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { FirebaseDataProvider, useFirebaseData } from './hooks/useFirebaseData';

function AppContent() {
  const { loading, error } = useFirebaseData();
  // Initialize storage seeds
  useEffect(() => {
    initStorage();
  }, []);

  const [session, setCurrentSession] = useState<AuthSession | null>(() => getSession());
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  // Sync route changes
  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle student login success
  const handleStudentLoginSuccess = (student: StudentProfile) => {
    const newSession: AuthSession = {
      role: 'student',
      student,
    };
    setSession(newSession);
    setCurrentSession(newSession);
    navigate('/student/dashboard');
  };

  // Handle faculty login success
  const handleFacultyLoginSuccess = (
    account: DeptAccount,
    department: DepartmentId | 'hod' | 'dean' | 'director' | 'verification_officer'
  ) => {
    let role: Role = 'dept_admin';
    if (department === 'director' || account.role === 'director') role = 'director';
    else if (department === 'hod' || account.role === 'hod') role = 'hod';
    else if (department === 'dean' || account.role === 'dean') role = 'dean';
    else if (department === 'verification_officer' || account.role === 'verification_officer') role = 'verification_officer';

    const newSession: AuthSession = {
      role,
      deptAccount: account,
      activeDepartment: department,
    };
    setSession(newSession);
    setCurrentSession(newSession);

    if (department === 'hod' || department === 'dean' || department === 'director') {
      navigate('/hod/dashboard');
    } else if (role === 'verification_officer') {
      navigate('/verification/dashboard');
    } else {
      navigate(`/dept/${department}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearSession();
    setCurrentSession(null);
    navigate('/');
  };

  // Route Access Control Checks (Mandate 7: Strict route protection)
  const renderView = () => {
    // 1. Landing Page
    if (currentPath === '/' || currentPath === '') {
      if (session) {
        if (session.role === 'student') return <StudentDashboard student={session.student!} />;
        if (session.role === 'hod' || session.role === 'dean' || session.role === 'director') {
          return (
            <HodDashboard
              account={session.deptAccount!}
              role={session.role}
            />
          );
        }
        if (session.role === 'verification_officer') {
          return <TransactionVerificationDashboard account={session.deptAccount!} />;
        }
        if (session.role === 'dept_admin' && session.activeDepartment) {
          return (
            <DepartmentDashboard
              department={session.activeDepartment as DepartmentId}
              account={session.deptAccount!}
            />
          );
        }
      }
      return (
        <LandingView
          onSelectStudentLogin={() => navigate('/login/student')}
          onSelectFacultyLogin={() => navigate('/login/faculty')}
          onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        />
      );
    }

    // 2. Student Login
    if (currentPath === '/login/student') {
      return (
        <StudentLoginView
          onBackToLanding={() => navigate('/')}
          onSuccess={handleStudentLoginSuccess}
        />
      );
    }

    // 3. Faculty Login
    if (currentPath === '/login/faculty') {
      return (
        <FacultyLoginView
          onBackToLanding={() => navigate('/')}
          onSuccess={handleFacultyLoginSuccess}
        />
      );
    }

    // 4. Student Dashboard (/student/dashboard)
    if (currentPath.startsWith('/student')) {
      if (!session || session.role !== 'student' || !session.student) {
        // Access Denied: redirect or show protection
        return (
          <AccessDeniedNotice
            title="Student Authentication Required"
            message="You must be signed in with an official RGUKT Google account (rXXXXXX@rguktrkv.ac.in) to access the Student Clearance Portal."
            onLogin={() => navigate('/login/student')}
          />
        );
      }
      return <StudentDashboard student={session.student} />;
    }

    // 5. HOD / Dean / Director Dashboard (/hod/dashboard)
    if (currentPath.startsWith('/hod')) {
      if (!session || (session.role !== 'hod' && session.role !== 'dean' && session.role !== 'director') || !session.deptAccount) {
        return (
          <AccessDeniedNotice
            title="Administrative Access Denied"
            message="This portal is strictly restricted to Head of Department (HOD) and Director of Academics authorized credentials."
            onLogin={() => navigate('/login/faculty')}
          />
        );
      }
      return (
        <HodDashboard
          account={session.deptAccount}
          role={session.role}
        />
      );
    }

    // 6. Transaction Verification Dashboard (/verification/* or /dept/verification_officer)
    if (currentPath.startsWith('/verification') || currentPath === '/dept/verification_officer') {
      if (
        !session ||
        (session.role !== 'verification_officer' && session.deptAccount?.role !== 'verification_officer') ||
        !session.deptAccount
      ) {
        return (
          <AccessDeniedNotice
            title="Transaction Verification Authentication Required"
            message="This internal audit queue is strictly restricted to the Finance Officer authorized for transaction verification."
            onLogin={() => navigate('/login/faculty')}
          />
        );
      }
      return <TransactionVerificationDashboard account={session.deptAccount} />;
    }

    // 7. Department Dashboard (/dept/:deptId)
    if (currentPath.startsWith('/dept/')) {
      const routeDept = currentPath.replace('/dept/', '').toLowerCase() as DepartmentId;

      if (session?.role === 'verification_officer') {
        return (
          <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-3xl border border-teal-200 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Transaction Verification Officer</h2>
            <p className="text-xs text-slate-600">
              You are authenticated as the university <strong>Transaction Verification Officer</strong>. Your duties are managed within the centralized verification queue.
            </p>
            <button
              onClick={() => navigate('/verification/dashboard')}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-700 transition-colors"
            >
              Go to Transaction Verification Queue
            </button>
          </div>
        );
      }

      if (!session || session.role !== 'dept_admin' || !session.deptAccount) {
        return (
          <AccessDeniedNotice
            title="Department Staff Authentication Required"
            message={`You must be logged in as an authorized department officer to view /dept/${routeDept}.`}
            onLogin={() => navigate('/login/faculty')}
          />
        );
      }

      // Route protection: department staff can only access their own department's routes
      if (session.activeDepartment !== routeDept) {
        return (
          <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-3xl border border-rose-200 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Departmental Boundary Violation
            </h2>
            <p className="text-xs text-slate-600">
              You are authenticated as <strong>{session.activeDepartment?.toUpperCase()}</strong>.
              Institutional access rules prevent you from managing other departmental clearances.
            </p>
            <button
              onClick={() => navigate(`/dept/${session.activeDepartment}`)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Return to Your Dashboard ({session.activeDepartment?.toUpperCase()})
            </button>
          </div>
        );
      }

      return (
        <DepartmentDashboard
          department={session.activeDepartment as DepartmentId}
          account={session.deptAccount}
        />
      );
    }

    // 7. Admin > Student Records (/admin/students)
    // Strictly restricted to HOD and Academic Dean only
    if (currentPath.startsWith('/admin/students')) {
      if (!session || (session.role !== 'hod' && session.role !== 'dean') || !session.deptAccount) {
        return (
          <AccessDeniedNotice
            title="Access Restricted: HOD & Dean Only"
            message="Student records and institutional clearance registries are strictly restricted to Head of Department (HOD) and Academic Dean authorized accounts. Department staff and students are not permitted to access this area."
            onLogin={() => navigate('/login/faculty')}
          />
        );
      }
      return (
        <HodDashboard
          account={session.deptAccount}
          role={session.role}
          initialTab="records"
        />
      );
    }

    // Fallback: Default to landing
    return (
      <LandingView
        onSelectStudentLogin={() => navigate('/login/student')}
        onSelectFacultyLogin={() => navigate('/login/faculty')}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Synchronizing Secure Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4 text-center bg-slate-50">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Database Connection Error</h2>
        <p className="text-slate-500 max-w-md text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        onNavigateHome={() => navigate('/')}
      />

      {/* Main View Body */}
      <main className="flex-1">{renderView()}</main>

      {/* Global In-App Notification Toast / Alert Banner across all pages */}
      <NotificationToast session={session} />

      {/* Demo Credentials Reference Modal */}
      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseDataProvider>
      <AppContent />
    </FirebaseDataProvider>
  );
}

function AccessDeniedNotice({
  title,
  message,
  onLogin,
}: {
  title: string;
  message: string;
  onLogin: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="pt-2">
          <button
            onClick={onLogin}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Authenticate to Continue
          </button>
        </div>
      </div>
    </div>
  );
}
