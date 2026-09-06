import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FlaskConical,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { DepartmentId, DeptAccount, Role } from '../types';
import {
  ACADEMIC_ROLE_ACCOUNTS,
  SEED_DEPT_ACCOUNTS,
  STATUTORY_DEPT_ACCOUNTS,
  TRANSACTION_VERIFICATION_ACCOUNT,
} from '../constants';

interface FacultyLoginViewProps {
  onBackToLanding: () => void;
  onSuccess: (account: DeptAccount, dept: DepartmentId | 'hod' | 'dean' | 'director' | 'verification_officer') => void;
}

export const FacultyLoginView: React.FC<FacultyLoginViewProps> = ({
  onBackToLanding,
  onSuccess,
}) => {
  // Step 1: Department selection buttons
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'hod' | 'dean' | 'director' | 'verification_officer' | null>(null);

  // Step 2: Department Google Account + Admin issued password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentsList = [
    {
      id: 'library' as const,
      name: 'Library',
      fullName: 'Central Library',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-amber-600 to-amber-700',
      description: 'Book returns, overdue catalog fines & digital journals',
    },
    {
      id: 'hostel' as const,
      name: 'Hostel Management',
      fullName: 'Hostel & Amenities',
      icon: <Building className="w-5 h-5" />,
      color: 'from-blue-600 to-blue-700',
      description: 'Room clearance, furniture inspection & mess charges',
    },
    {
      id: 'lab' as const,
      name: 'Lab',
      fullName: 'Laboratories & Workshop',
      icon: <FlaskConical className="w-5 h-5" />,
      color: 'from-emerald-600 to-emerald-700',
      description: 'Equipment returns, component breakage & workshops',
    },
    {
      id: 'finance' as const,
      name: 'Finance Department',
      fullName: 'Finance & Accounts',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'from-purple-600 to-purple-700',
      description: 'Tuition fees, scholarships & university deposits',
    },
    {
      id: 'sports' as const,
      name: 'Sports',
      fullName: 'Physical Education & Sports',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-orange-600 to-orange-700',
      description: 'Sports inventory, gym clearance & athletic dues',
    },
    {
      id: 'verification_officer' as const,
      name: 'Transaction Verification',
      fullName: 'Finance Officer - Transaction Verification',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-teal-600 to-teal-700',
      description: 'Internal audit & certification of student payment receipts',
    },
    {
      id: 'hod' as const,
      name: 'HOD / Director',
      fullName: 'Head of Department & Director of Academics',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-slate-800 to-slate-900',
      description: 'Branch-scoped HOD clearance & Director institutional oversight',
    },
  ];

  // Quick switcher presets for HOD branches and Director
  const academicPresets = [
    { label: 'CSE & AI/ML', email: 'hod.cse@rguktrkv.ac.in', pwd: 'rgukt@cse2025' },
    { label: 'ECE', email: 'hod.ece@rguktrkv.ac.in', pwd: 'rgukt@ece2025' },
    { label: 'EEE', email: 'hod.eee@rguktrkv.ac.in', pwd: 'rgukt@eee2025' },
    { label: 'Civil (CE)', email: 'hod.ce@rguktrkv.ac.in', pwd: 'rgukt@ce2025' },
    { label: 'Mech (ME)', email: 'hod.me@rguktrkv.ac.in', pwd: 'rgukt@me2025' },
    { label: 'Chemical', email: 'hod.chem@rguktrkv.ac.in', pwd: 'rgukt@chem2025' },
    { label: 'MME', email: 'hod.mme@rguktrkv.ac.in', pwd: 'rgukt@mme2025' },
    { label: 'Director (All)', email: 'director@rguktrkv.ac.in', pwd: 'rgukt@director2025' },
  ];

  // When a department is clicked, populate default official email for reviewer convenience
  const handleSelectDepartment = (deptId: DepartmentId | 'hod' | 'dean' | 'director' | 'verification_officer') => {
    setSelectedDept(deptId);
    setError(null);
    if (deptId === 'hod') {
      setEmail('hod.cse@rguktrkv.ac.in');
      setPassword('rgukt@cse2025');
    } else if (deptId === 'verification_officer') {
      setEmail('verify@rguktrkv.ac.in');
      setPassword('rgukt@vfy2025');
    } else {
      const targetAccount = STATUTORY_DEPT_ACCOUNTS.find((a) => a.department === deptId);
      if (targetAccount) {
        setEmail(targetAccount.email);
        setPassword(targetAccount.password);
      } else {
        setEmail('');
        setPassword('');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDept) {
      setError('Please select a department first.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter the department official Google email.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your admin-issued password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Handle Academic Gateway (HODs per branch or Director)
      if (selectedDept === 'hod' || selectedDept === 'director' || selectedDept === 'dean') {
        const config = ACADEMIC_ROLE_ACCOUNTS[cleanEmail];

        if (!config) {
          setError(
            `Access restricted. The email "${cleanEmail}" is not authorized as an institutional HOD or Director gateway account. Please use your assigned department email (e.g., hod.cse@rguktrkv.ac.in, hod.ece@rguktrkv.ac.in, or director@rguktrkv.ac.in).`
          );
          return;
        }

        const isPasswordValid =
          config.password === cleanPassword ||
          (config.secondaryPasswords && config.secondaryPasswords.includes(cleanPassword));

        if (!isPasswordValid) {
          setError('Invalid admin-issued password. Please check your credentials.');
          return;
        }

        const deptAccount: DeptAccount = {
          id: config.id,
          department: config.department,
          name: config.name,
          email: config.email,
          password: config.password,
          officerName: config.officerName,
          designation: config.designation,
          avatar: config.avatar,
          role: config.role as Role,
          headerTitle: config.headerTitle,
          branchName: config.branchName,
          allowedBranchCodes: config.allowedBranchCodes,
        };

        onSuccess(deptAccount, config.department);
        return;
      }

      // Handle Transaction Verification Gateway (Finance Officer)
      if (selectedDept === 'verification_officer') {
        const allowedEmails = ['verify@rguktrkv.ac.in', 'tx.verification@rguktrkv.ac.in'];
        if (!allowedEmails.includes(cleanEmail)) {
          setError(
            `Access restricted. The email "${cleanEmail}" is not authorized for the Transaction Verification Portal. Please use verify@rguktrkv.ac.in.`
          );
          return;
        }

        const allowedPasswords = ['rgukt@vfy2025', 'rgukt@verify2025'];
        if (!allowedPasswords.includes(cleanPassword)) {
          setError('Invalid admin-issued password. Please check your credentials.');
          return;
        }

        const accountToUse: DeptAccount = {
          ...TRANSACTION_VERIFICATION_ACCOUNT,
          email: cleanEmail,
          password: cleanPassword,
          role: 'verification_officer',
          department: 'verification_officer',
        };

        onSuccess(accountToUse, 'verification_officer');
        return;
      }

      // Handle Statutory Department Admins (library, hostel, lab, finance, sports)
      const matchingAccount = STATUTORY_DEPT_ACCOUNTS.find(
        (a) => a.department === selectedDept && a.email.toLowerCase() === cleanEmail
      );

      if (!matchingAccount) {
        setError(
          `Unauthorized email address. Please use the official ${selectedDept.toUpperCase()} department Google account (e.g. ${
            STATUTORY_DEPT_ACCOUNTS.find((a) => a.department === selectedDept)?.email
          }).`
        );
        return;
      }

      // Validate admin-issued password
      if (matchingAccount.password !== cleanPassword) {
        setError('Invalid admin-issued password. Please check your credentials.');
        return;
      }

      onSuccess(matchingAccount, selectedDept);
    }, 400);
  };

  const activeDeptMeta = departmentsList.find((d) => d.id === selectedDept);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Top Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (selectedDept) {
                setSelectedDept(null);
                setError(null);
              } else {
                onBackToLanding();
              }
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{selectedDept ? 'Change Department' : 'Back to Portal Home'}</span>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Faculty & Admin Gateway
          </span>
        </div>

        {/* View Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {selectedDept ? `Login — ${activeDeptMeta?.fullName}` : 'Select Your Department'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {selectedDept
              ? 'Authenticate using your department Google account and admin-issued security password.'
              : 'Choose your administrative or academic clearance unit to proceed.'}
          </p>
        </div>

        {/* STEP 1: Department Selection Buttons */}
        {!selectedDept ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departmentsList.map((dept) => (
                <button
                  key={dept.id}
                  id={`btn-select-dept-${dept.id}`}
                  onClick={() => handleSelectDepartment(dept.id)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white text-left transition-all duration-150 group shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-9 h-9 rounded-xl bg-linear-to-br ${dept.color} text-white flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      {dept.icon}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {dept.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 mt-3 block group-hover:underline">
                    Access Portal →
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              Department passcodes are issued by the RGUKT RK Valley Academic Office.
            </div>
          </div>
        ) : (
          /* STEP 2: Department Google Account + Password Form */
          <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
            {/* Active Department Pill */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  {activeDeptMeta?.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">
                    {activeDeptMeta?.fullName}
                  </span>
                  <span className="text-[10px] text-indigo-600">
                    Official Department Login
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Quick preset chips for HOD & Director branches */}
            {selectedDept === 'hod' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Authorized HOD & Director Accounts:
                  </span>
                  <span className="text-[10px] text-slate-400">Click to fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {academicPresets.map((preset) => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => {
                        setEmail(preset.email);
                        setPassword(preset.pwd);
                        setError(null);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        email === preset.email
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                id="faculty-login-error"
                className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Department Google Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Google Account (Restricted)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="input-dept-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedDept === 'hod'
                      ? 'e.g. hod.cse@rguktrkv.ac.in'
                      : selectedDept === 'verification_officer'
                      ? 'e.g. verify@rguktrkv.ac.in'
                      : 'e.g. library@rguktrkv.ac.in'
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedDept === 'hod'
                  ? 'Enter branch-specific HOD email (e.g. hod.cse@rguktrkv.ac.in) or director@rguktrkv.ac.in.'
                  : selectedDept === 'verification_officer'
                  ? 'Authorized Google account: verify@rguktrkv.ac.in (Password: rgukt@vfy2025)'
                  : "Must match this department's authorized institutional Google account."}
              </p>
            </div>

            {/* Admin Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-slate-400 font-normal">(Issued by Admin)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="input-dept-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              id="btn-faculty-submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating Department...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter {activeDeptMeta?.name} Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
