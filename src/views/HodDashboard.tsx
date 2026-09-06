import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
  Users,
  AlertCircle,
  Filter,
  FileSpreadsheet,
  Building,
  CreditCard,
  FlaskConical,
  Trophy,
  KeyRound,
  X,
  Upload,
} from 'lucide-react';
import {
  DeptAccount,
  StudentClearanceRecord,
  StudentProfile,
  CodeDue,
  DepartmentId,
  StudentBranchCode,
} from '../types';
import {
  getClearanceRecords,
  getClearanceRecordsForAccount,
  getStudents,
  getStudentsForAccount,
  getDues,
  getDuesForAccount,
  getStudentBranchCode,
  hodApproveClearance,
  hodRejectClearance,
  resetStudentPassword,
  syncStudentRecords,
} from '../utils/storage';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';
import { generateNoDuesPDF } from '../utils/certificate';
import { formatTimestamp } from '../utils/crypto';
import { FULL_REAL_STUDENTS } from '../data/rguktStudentsData';
import { ALL_BRANCH_OPTIONS } from '../constants';

interface HodDashboardProps {
  account: DeptAccount;
  role: 'hod' | 'dean' | 'director';
  initialTab?: 'queue' | 'records' | 'reports';
}

export const HodDashboard: React.FC<HodDashboardProps> = ({
  account,
  role,
  initialTab = 'queue',
}) => {
  const isDirector = account.department === 'director' || role === 'director' || account.role === 'director';
  const isDean = account.department === 'dean' || role === 'dean' || account.role === 'dean';
  const isHod = !isDirector && !isDean;

  const [activeTab, setActiveTab] = useState<'queue' | 'records' | 'reports'>(initialTab);
  const [directorBranchFilter, setDirectorBranchFilter] = useState<string>('all');

  const [students, setStudents] = useState<StudentProfile[]>(() => getStudentsForAccount(account));
  const [clearanceRecords, setClearanceRecords] = useState<Record<string, StudentClearanceRecord>>(
    () => getClearanceRecordsForAccount(account)
  );
  const [dues, setDues] = useState<CodeDue[]>(() => getDuesForAccount(account));

  // Filter type: either according to logged in authority, or toggleable
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'engineering' | 'puc'>(
    isDean ? 'puc' : isDirector ? 'all' : 'engineering'
  );

  // Search & Filter state for Student Records tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedClearanceStatus, setSelectedClearanceStatus] = useState<
    'all' | 'ready_signoff' | 'in_progress' | 'has_dues' | 'cleared'
  >('all');

  // Modals
  const [rejectModalConfig, setRejectModalConfig] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
  }>({
    isOpen: false,
    studentId: '',
    studentName: '',
  });

  const [previewCertStudent, setPreviewCertStudent] = useState<StudentProfile | null>(null);
  const [inspectStudent, setInspectStudent] = useState<StudentProfile | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const reloadData = () => {
    setStudents(getStudentsForAccount(account));
    setClearanceRecords(getClearanceRecordsForAccount(account));
    setDues(getDuesForAccount(account));
  };

  const handleApprove = (student: StudentProfile) => {
    const res = hodApproveClearance({
      studentId: student.id,
      staffName: account.officerName,
      designation: isDirector ? 'Director of Academics' : account.designation,
      remarks: isDirector
        ? `Full institutional clearance endorsed by Director of Academics (${account.officerName}) on behalf of RGUKT RK Valley.`
        : `Branch no-dues clearance endorsed by ${account.officerName} (${account.headerTitle || account.designation}) on behalf of RGUKT RK Valley.`,
      account,
    });

    if (!res.success) {
      setSyncStatusMsg(res.error || 'Authorization check failed for this student.');
      return;
    }

    setSyncStatusMsg(
      `🎉 Final clearance granted for ${student.name}! Digital No-Dues Certificate issued & soft-copy PDF automatically emailed to ${student.email} from ${account.email}.`
    );

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });

    reloadData();
  };

  const handleOpenReject = (student: StudentProfile) => {
    setRejectModalConfig({
      isOpen: true,
      studentId: student.id,
      studentName: student.name,
    });
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectModalConfig.studentId) {
      const res = hodRejectClearance({
        studentId: rejectModalConfig.studentId,
        staffName: account.officerName,
        reason,
        account,
      });

      if (!res.success) {
        setSyncStatusMsg(res.error || 'Authorization check failed for this student.');
      } else {
        const student = students.find((s) => s.id === rejectModalConfig.studentId);
        setSyncStatusMsg(
          `Clearance returned. Official notice with reasons dispatched to ${student?.email || 'student'} from ${account.email}.`
        );
      }
      reloadData();
    }
  };

  const handleResetPassword = (studentId: string) => {
    const res = resetStudentPassword(studentId);
    if (res.success) {
      setSyncStatusMsg(`Password for ${studentId.toUpperCase()} reset to default (roll number).`);
      setTimeout(() => setSyncStatusMsg(null), 4000);
      reloadData();
    }
  };

  const handleSyncDataset = () => {
    const summary = syncStudentRecords(FULL_REAL_STUDENTS);
    setSyncStatusMsg(
      `Registry synchronized: ${summary.total} records verified (${summary.added} new added, ${summary.updated} updated/retained).`
    );
    setTimeout(() => setSyncStatusMsg(null), 5000);
    reloadData();
    setIsSyncModalOpen(false);
  };

  // Helper for student clearance calculations
  const getStudentStats = (student: StudentProfile) => {
    const rec = clearanceRecords[student.id.toLowerCase()];
    const studentDues = dues.filter(
      (d) => d.student_id.toLowerCase() === student.id.toLowerCase() && d.status !== 'Approved'
    );
    const totalPendingDues = studentDues.reduce((acc, d) => acc + d.amount, 0);
    const depts = ['library', 'hostel', 'lab', 'finance', 'sports'] as const;
    const approvedCount = rec ? depts.filter((d) => rec.departments[d]?.status === 'approved').length : 0;
    const all5Approved = approvedCount === 5;
    const isCertificateIssued = !!rec?.certificate_generated;

    let statusKey: 'ready_signoff' | 'in_progress' | 'has_dues' | 'cleared';
    if (isCertificateIssued) {
      statusKey = 'cleared';
    } else if (all5Approved) {
      statusKey = 'ready_signoff';
    } else if (studentDues.length > 0) {
      statusKey = 'has_dues';
    } else {
      statusKey = 'in_progress';
    }

    return {
      record: rec,
      studentDues,
      totalPendingDues,
      approvedCount,
      all5Approved,
      isCertificateIssued,
      statusKey,
    };
  };

  // Students under HOD / Dean / Director jurisdiction
  const jurisdictionStudents = useMemo(() => {
    return students.filter((s) => {
      // Director branch filter
      if (isDirector && directorBranchFilter !== 'all') {
        const studentCode = s.branchCode || getStudentBranchCode(s);
        if (studentCode !== directorBranchFilter) return false;
      }

      // Academic level filter
      if (categoryFilter === 'engineering') return s.studentType === 'engineering';
      if (categoryFilter === 'puc') return s.studentType === 'puc';
      return true;
    });
  }, [students, categoryFilter, isDirector, directorBranchFilter]);

  // Tab 1: Eligible students whose all 5 departments have approved
  const eligibleStudents = useMemo(() => {
    return jurisdictionStudents.filter((s) => {
      const stats = getStudentStats(s);
      return stats.all5Approved;
    });
  }, [jurisdictionStudents, clearanceRecords, dues]);

  const pendingSignoffCount = useMemo(() => {
    return eligibleStudents.filter((s) => !clearanceRecords[s.id]?.certificate_generated).length;
  }, [eligibleStudents, clearanceRecords]);

  const completedSignoffCount = useMemo(() => {
    return eligibleStudents.filter((s) => clearanceRecords[s.id]?.certificate_generated).length;
  }, [eligibleStudents, clearanceRecords]);

  // Tab 2: Filtered student records for the Student Records tab
  const filteredRecords = useMemo(() => {
    return jurisdictionStudents.filter((student) => {
      const stats = getStudentStats(student);

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesId = student.id.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        const matchesBranch = student.branch.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesEmail && !matchesBranch) return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && student.branch !== selectedBranch) {
        return false;
      }

      // Status filter
      if (selectedClearanceStatus !== 'all' && stats.statusKey !== selectedClearanceStatus) {
        return false;
      }

      return true;
    });
  }, [jurisdictionStudents, searchTerm, selectedBranch, selectedClearanceStatus, clearanceRecords, dues]);

  // Summary counts for jurisdiction
  const summaryCounts = useMemo(() => {
    let duesPending = 0;
    let inProgress = 0;
    let readySignoff = 0;
    let cleared = 0;

    jurisdictionStudents.forEach((s) => {
      const stats = getStudentStats(s);
      if (stats.statusKey === 'cleared') cleared++;
      else if (stats.statusKey === 'ready_signoff') readySignoff++;
      else if (stats.statusKey === 'has_dues') duesPending++;
      else inProgress++;
    });

    return { total: jurisdictionStudents.length, duesPending, inProgress, readySignoff, cleared };
  }, [jurisdictionStudents, clearanceRecords, dues]);

  // Available branches for current jurisdiction
  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    jurisdictionStudents.forEach((s) => branches.add(s.branch));
    return Array.from(branches).sort();
  }, [jurisdictionStudents]);

  const departmentMeta = [
    { id: 'library' as const, label: 'Library', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'hostel' as const, label: 'Hostel', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'lab' as const, label: 'Lab', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'finance' as const, label: 'Finance', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'sports' as const, label: 'Sports', icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Feedback Banner */}
      {syncStatusMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          <button onClick={() => setSyncStatusMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Authority Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3.5 sm:space-x-4">
          <img
            src={account.avatar}
            alt={account.officerName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                isDirector
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : isDean
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isDirector
                  ? 'Director of Academics • Institutional Authority'
                  : isDean
                  ? 'Dean of Academic Affairs'
                  : `HOD – ${account.branchName || 'Department'}`}
              </span>
              <span className="text-xs text-slate-400">• Statutory Sign-off Authority</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
              {isDirector
                ? (account.headerTitle || 'Director of Academics')
                : isDean
                ? (account.headerTitle || 'Dean of Academic Affairs')
                : `HOD – ${account.branchName || 'Department'}`}
            </h1>
            <p className="text-xs text-slate-400 break-all xs:break-normal">
              <span className="text-slate-200 font-semibold">{account.officerName}</span> ({account.designation}) •{' '}
              <span className="font-mono text-amber-400/90">{account.email}</span>
            </p>
          </div>
        </div>

        {/* Right side controls: Director Branch Filter, Category switcher & refresh */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto shrink-0 justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          {isDirector && (
            <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <label htmlFor="director-branch-filter" className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Branch:
              </label>
              <select
                id="director-branch-filter"
                value={directorBranchFilter}
                onChange={(e) => setDirectorBranchFilter(e.target.value)}
                className="bg-slate-900 text-white text-xs font-semibold py-1 px-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="all">All Branches (Institutional)</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="AIML">AI/ML (Artificial Intelligence)</option>
                <option value="ECE">ECE (Electronics & Comm)</option>
                <option value="EEE">EEE (Electrical & Electronics)</option>
                <option value="CE">CE (Civil Engineering)</option>
                <option value="ME">ME (Mechanical Engineering)</option>
                <option value="CHEM">Chemical Engineering</option>
                <option value="MME">MME (Metallurgical & Materials)</option>
              </select>
            </div>
          )}

          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setCategoryFilter('engineering')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'engineering'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Engineering
            </button>
            <button
              onClick={() => setCategoryFilter('puc')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'puc'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PUC
            </button>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={reloadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Section Tabs: Final Sign-off Queue vs Student Records vs Branch Reports */}
      <div className="flex border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4">
          <button
            id="tab-hod-queue"
            onClick={() => setActiveTab('queue')}
            className={`pb-3 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'queue'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Final Sign-off Queue</span>
            {pendingSignoffCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {pendingSignoffCount}
              </span>
            )}
          </button>

          <button
            id="tab-hod-student-records"
            onClick={() => setActiveTab('records')}
            className={`pb-3 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'records'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Records</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
              {jurisdictionStudents.length}
            </span>
          </button>

          {isDirector && (
            <button
              id="tab-director-reports"
              onClick={() => setActiveTab('reports')}
              className={`pb-3 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Branch Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: Final Sign-off Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Queue Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bento-card bento-card-hover p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Awaiting Your Final Sign-Off
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-extrabold text-amber-600 font-mono">
                  {pendingSignoffCount}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                  Action Required
                </span>
              </div>
            </div>

            <div className="bento-card bento-card-hover p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Certificates Released & Signed
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                  {completedSignoffCount}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                  Completed
                </span>
              </div>
            </div>

            <div className="bento-card bento-card-hover p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Department Clearance Rule
              </span>
              <div className="flex items-center space-x-2 mt-2 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>5/5 Departments strictly verified before arriving in this sign-off desk</span>
              </div>
            </div>
          </div>

          {/* Main Eligible Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Final Academic Clearance & Certificate Endorsement
                </h2>
                <p className="text-xs text-slate-500">
                  Students under your jurisdiction who have obtained digital clearance signatures from Central Library, Hostel Management, Labs, Finance, and Sports.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {eligibleStudents.length} candidate(s)
              </span>
            </div>

            {eligibleStudents.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No Students Currently Pending Final Sign-off
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Only students whose all 5 statutory departments have completed digital sign-off are forwarded to this desk. You can monitor department-wise progress in the <strong>Student Records</strong> tab.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('records')}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View All Student Records & Department Progress →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleStudents.map((student) => {
                  const record = clearanceRecords[student.id];
                  const isApproved = record?.certificate_generated;

                  return (
                    <div
                      key={student.id}
                      id={`card-hod-student-${student.id}`}
                      className="bento-card bento-card-hover p-5 sm:p-6 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Student Info */}
                        <div className="flex items-start space-x-4">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                {student.name}
                              </h3>
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                {student.id.toUpperCase()}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  student.studentType === 'puc'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - {student.branch}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              Batch: {student.batch} • {student.email} • {student.phone}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto shrink-0 self-start lg:self-center justify-start sm:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {isApproved ? (
                            <>
                              <button
                                onClick={() => setPreviewCertStudent(student)}
                                className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5 min-h-[40px] sm:min-h-0 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Certificate</span>
                              </button>
                              <button
                                onClick={() => generateNoDuesPDF(student, record)}
                                className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 min-h-[40px] sm:min-h-0 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                id={`btn-hod-reject-${student.id}`}
                                onClick={() => handleOpenReject(student)}
                                className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 min-h-[40px] sm:min-h-0 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject with Reason</span>
                              </button>
                              <button
                                id={`btn-hod-approve-${student.id}`}
                                onClick={() => handleApprove(student)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer min-h-[40px] sm:min-h-0"
                              >
                                <Award className="w-4 h-4" />
                                <span>Approve & Issue Certificate</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 5-Department Digital Signatures Verification Grid */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
                          Statutory Department Clearances (5/5 Verified):
                        </span>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                          {departmentMeta.map((d) => {
                            const cl = record?.departments[d.id];
                            const sig = cl?.digital_signature;
                            return (
                              <div
                                key={d.id}
                                className="p-2.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 text-[11px]">
                                    {d.label}
                                  </span>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                </div>
                                <p className="text-[10px] text-slate-600 font-medium truncate">
                                  {sig?.staff_name || 'Officer'}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono truncate">
                                  {sig?.verification_hash || 'RGUKT-SIG-CLEARED'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* If Approved: Final Endorsement Banner */}
                      {isApproved && record?.hod_approval && (
                        <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 text-amber-900">
                            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-bold">
                              Digitally Endorsed by {record.hod_approval.staff_name} ({record.hod_approval.designation})
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-600">
                            Cert Ref: {record.certificate_hash} • {formatTimestamp(record.hod_approval.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Dedicated Student Records Section (HOD/Dean Only) */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Section Description & Action Header */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    Consolidated Jurisdiction View
                  </span>
                  <span className="text-xs text-slate-400">
                    {account.designation}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Student Records & Department Clearance Registry
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  View full no-dues status, department-wise clearance approvals (Library, Hostel, Lab, Finance, Sports), and outstanding student dues under your statutory jurisdiction.
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Synchronize institutional master records"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync 81 Records</span>
                </button>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Students</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{summaryCounts.total}</span>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-800 uppercase block">Ready for Sign-off</span>
                <span className="text-xl font-bold text-amber-700 font-mono mt-0.5 block">{summaryCounts.readySignoff}</span>
              </div>
              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-800 uppercase block">Has Pending Dues</span>
                <span className="text-xl font-bold text-rose-700 font-mono mt-0.5 block">{summaryCounts.duesPending}</span>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-800 uppercase block">In Progress</span>
                <span className="text-xl font-bold text-blue-700 font-mono mt-0.5 block">{summaryCounts.inProgress}</span>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Certificates Issued</span>
                <span className="text-xl font-bold text-emerald-700 font-mono mt-0.5 block">{summaryCounts.cleared}</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Roll Number, Name, Branch, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">Status:</span>
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'ready_signoff' as const, label: 'Ready (5/5)' },
                  { key: 'has_dues' as const, label: 'Dues' },
                  { key: 'in_progress' as const, label: 'Progress' },
                  { key: 'cleared' as const, label: 'Issued' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setSelectedClearanceStatus(st.key)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectedClearanceStatus === st.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">Branch:</span>
              <button
                onClick={() => setSelectedBranch('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedBranch === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Branches
              </button>
              {availableBranches.map((br) => (
                <button
                  key={br}
                  onClick={() => setSelectedBranch(br)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedBranch === br
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>
          </div>

          {/* Student Records List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{filteredRecords.length}</strong> of {jurisdictionStudents.length} student records
              </span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Student Records Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search criteria, branch selection, or status filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((student) => {
                  const stats = getStudentStats(student);
                  const { record, studentDues, totalPendingDues, approvedCount, all5Approved, isCertificateIssued } = stats;

                  return (
                    <div
                      key={student.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all space-y-3.5"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Student Details */}
                        <div className="flex items-start space-x-3.5">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                {student.name}
                              </h3>
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {student.id.toUpperCase()}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                {student.branch} ({student.studentType.toUpperCase()})
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Batch: {student.batch} • <span className="font-mono">{student.email}</span> • {student.phone}
                            </p>
                          </div>
                        </div>

                        {/* Overall Status Badge & Action Buttons */}
                        <div className="flex items-center flex-wrap gap-2 shrink-0">
                          {isCertificateIssued ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Certificate Issued</span>
                            </span>
                          ) : all5Approved ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-lg animate-pulse">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ready for HOD Sign-Off (5/5)</span>
                            </span>
                          ) : studentDues.length > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Dues: ₹{totalPendingDues}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>In Progress ({approvedCount}/5)</span>
                            </span>
                          )}

                          <button
                            onClick={() => setInspectStudent(student)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Full Details</span>
                          </button>

                          {/* Direct HOD Actions */}
                          {all5Approved && !isCertificateIssued && (
                            <button
                              onClick={() => handleApprove(student)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                              title="Give final clearance approval"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Endorse</span>
                            </button>
                          )}

                          {isCertificateIssued && (
                            <button
                              onClick={() => generateNoDuesPDF(student, record)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Department-wise Progress Row */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase">
                              Department Clearance Progress:
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-900">
                              {approvedCount}/5 Cleared
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                all5Approved ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${(approvedCount / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 5 Department Status Micro-Chips */}
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                          {departmentMeta.map((d) => {
                            const deptCl = record?.departments[d.id];
                            const deptDue = studentDues.find((du) => du.department === d.id);
                            const isCleared = deptCl?.status === 'approved';

                            let bgClass = 'bg-slate-50 border-slate-200 text-slate-600';
                            let statusText = 'Pending';
                            let icon = <Clock className="w-3 h-3 text-slate-400" />;

                            if (isCleared) {
                              bgClass = 'bg-emerald-50/70 border-emerald-200 text-emerald-800';
                              statusText = 'Approved';
                              icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
                            } else if (deptDue) {
                              bgClass = 'bg-rose-50/70 border-rose-200 text-rose-800';
                              statusText = `Due: ₹${deptDue.amount}`;
                              icon = <AlertCircle className="w-3 h-3 text-rose-600" />;
                            }

                            return (
                              <div
                                key={d.id}
                                className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${bgClass}`}
                              >
                                <div className="flex items-center space-x-1.5 truncate">
                                  <span className="shrink-0">{d.icon}</span>
                                  <span className="font-semibold truncate">{d.label}</span>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0 font-medium">
                                  <span>{statusText}</span>
                                  {icon}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Outstanding Dues Detail (if any) */}
                      {studentDues.length > 0 && (
                        <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-rose-900 text-[11px]">
                            <span className="flex items-center space-x-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Pending Dues Required for Clearance:</span>
                            </span>
                            <span className="font-mono">Total: ₹{totalPendingDues}</span>
                          </div>
                          <div className="space-y-0.5">
                            {studentDues.map((due) => (
                              <div key={due.id} className="text-[11px] text-rose-700 flex justify-between">
                                <span>
                                  • {due.department.toUpperCase()}: {due.reason}
                                </span>
                                <span className="font-semibold font-mono">₹{due.amount} ({due.status})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Director Branch-wise Institutional Report */}
      {activeTab === 'reports' && isDirector && (
        <div className="space-y-6">
          {/* Institutional Overview Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Building className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Institutional Branch Clearance Breakdown
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time cross-departmental no-dues verification statistics across all 8 academic branches of RGUKT RK Valley.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Scope:</span>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-xl">
                8 Academic Branches • {students.length} Enrolled Students
              </span>
            </div>
          </div>

          {/* Branch Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_BRANCH_OPTIONS.map((branch) => {
              const branchStudents = students.filter(
                (s) => (s.branchCode || getStudentBranchCode(s)) === branch.code
              );

              let bCleared = 0;
              let bReady = 0;
              let bDues = 0;
              let bInProgress = 0;
              let bDuesTotal = 0;

              branchStudents.forEach((s) => {
                const stats = getStudentStats(s);
                if (stats.statusKey === 'cleared') bCleared++;
                else if (stats.statusKey === 'ready_signoff') bReady++;
                else if (stats.statusKey === 'has_dues') {
                  bDues++;
                  bDuesTotal += stats.totalPendingDues;
                } else bInProgress++;
              });

              const clearanceRate = branchStudents.length > 0
                ? Math.round((bCleared / branchStudents.length) * 100)
                : 0;

              return (
                <div
                  key={branch.code}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                            {branch.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {branchStudents.length} Students
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1" title={branch.label}>
                          {branch.label}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {clearanceRate}%
                      </span>
                    </div>

                    {/* Progress mini bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${clearanceRate}%` }}
                      />
                    </div>

                    {/* Metric mini matrix */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                      <div className="bg-emerald-50/70 p-2 rounded-xl text-emerald-800">
                        <span className="block text-[10px] font-semibold text-emerald-600 uppercase">Cleared</span>
                        <span className="text-sm font-bold font-mono">{bCleared}</span>
                      </div>
                      <div className="bg-amber-50/70 p-2 rounded-xl text-amber-800">
                        <span className="block text-[10px] font-semibold text-amber-600 uppercase">Ready Sign-off</span>
                        <span className="text-sm font-bold font-mono">{bReady}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-700">
                        <span className="block text-[10px] font-semibold text-slate-500 uppercase">In Progress</span>
                        <span className="text-sm font-bold font-mono">{bInProgress}</span>
                      </div>
                      <div className="bg-rose-50/70 p-2 rounded-xl text-rose-800">
                        <span className="block text-[10px] font-semibold text-rose-600 uppercase">Pending Dues</span>
                        <span className="text-sm font-bold font-mono">{bDues} {bDuesTotal > 0 ? `(₹${bDuesTotal})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3 mt-3 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        setDirectorBranchFilter(branch.code);
                        setActiveTab('queue');
                      }}
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-center transition-colors cursor-pointer"
                    >
                      Queue ({bReady})
                    </button>
                    <button
                      onClick={() => {
                        setDirectorBranchFilter(branch.code);
                        setActiveTab('records');
                      }}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition-colors cursor-pointer"
                    >
                      Records ({branchStudents.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Tabular Comparison */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Branch Clearance Matrix</h3>
                <p className="text-xs text-slate-500">Comprehensive overview across statutory clearance milestones</p>
              </div>
              <button
                onClick={() => {
                  setDirectorBranchFilter('all');
                  setActiveTab('records');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                View All Records (81)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Enrolled</th>
                    <th className="py-3 px-4 text-center">Ready for Sign-off</th>
                    <th className="py-3 px-4 text-center">Cleared</th>
                    <th className="py-3 px-4 text-center">Pending Dues</th>
                    <th className="py-3 px-4 text-center">Completion</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALL_BRANCH_OPTIONS.map((branch) => {
                    const branchStudents = students.filter(
                      (s) => (s.branchCode || getStudentBranchCode(s)) === branch.code
                    );

                    let bCleared = 0;
                    let bReady = 0;
                    let bDues = 0;

                    branchStudents.forEach((s) => {
                      const stats = getStudentStats(s);
                      if (stats.statusKey === 'cleared') bCleared++;
                      else if (stats.statusKey === 'ready_signoff') bReady++;
                      else if (stats.statusKey === 'has_dues') bDues++;
                    });

                    const pct = branchStudents.length > 0
                      ? Math.round((bCleared / branchStudents.length) * 100)
                      : 0;

                    return (
                      <tr key={branch.code} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{branch.label}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{branch.code}</td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">{branchStudents.length}</td>
                        <td className="py-3 px-4 text-center">
                          {bReady > 0 ? (
                            <span className="inline-flex px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold font-mono">
                              {bReady}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {bCleared > 0 ? (
                            <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold font-mono">
                              {bCleared}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">{bDues}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-slate-700">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setDirectorBranchFilter(branch.code);
                              setActiveTab('records');
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            Filter & View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      <RejectReasonModal
        isOpen={rejectModalConfig.isOpen}
        title={`Return Final Clearance — ${rejectModalConfig.studentName}`}
        subtitle="Mandatory explanation will be sent to the student and recorded in university audit logs"
        onClose={() => setRejectModalConfig({ isOpen: false, studentId: '', studentName: '' })}
        onConfirm={handleConfirmReject}
      />

      {/* Certificate Preview Modal */}
      {previewCertStudent && (
        <CertificatePreviewModal
          student={previewCertStudent}
          record={clearanceRecords[previewCertStudent.id]}
          isOpen={!!previewCertStudent}
          onClose={() => setPreviewCertStudent(null)}
        />
      )}

      {/* Student Full Audit Details Modal (HOD Inspector) */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={inspectStudent.photoUrl}
                  alt={inspectStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{inspectStudent.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>{inspectStudent.id.toUpperCase()}</span>
                    <span>•</span>
                    <span>{inspectStudent.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department-wise verification audit list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Statutory Department Clearances & Signatures:
              </h4>
              <div className="space-y-2">
                {departmentMeta.map((dept) => {
                  const rec = clearanceRecords[inspectStudent.id.toLowerCase()];
                  const deptInfo = rec?.departments[dept.id];
                  const sig = deptInfo?.digital_signature;
                  const isApproved = deptInfo?.status === 'approved';

                  return (
                    <div
                      key={dept.id}
                      className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isApproved ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="p-1.5 bg-white rounded-lg border border-slate-200">{dept.icon}</span>
                        <div>
                          <p className="font-bold text-slate-900">{dept.label} Department</p>
                          <p className="text-[11px] text-slate-500">
                            {isApproved
                              ? `Cleared by ${sig?.staff_name || 'Department Officer'} (${sig?.designation || 'Staff'})`
                              : 'Clearance sign-off pending'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isApproved ? (
                          <>
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>CLEARED</span>
                            </span>
                            {sig?.verification_hash && (
                              <p className="font-mono text-[9px] text-slate-400 mt-0.5">
                                {sig.verification_hash}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                            <span>PENDING</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Administrative Account Controls */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Student Portal Password Status</h5>
                  <p className="text-[11px] text-slate-500">
                    Status: {inspectStudent.hasChangedPassword ? 'Custom student password active' : 'Default password (roll number)'}
                  </p>
                </div>
                <button
                  onClick={() => handleResetPassword(inspectStudent.id)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Reset student password to default roll number"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Direct HOD Decision Action in Modal */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              {getStudentStats(inspectStudent).all5Approved && !clearanceRecords[inspectStudent.id.toLowerCase()]?.certificate_generated && (
                <button
                  onClick={() => {
                    handleApprove(inspectStudent);
                    setInspectStudent(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Approve & Issue Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Dataset Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Synchronize Student Registry</h3>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will re-synchronize the <strong>81 RGUKT RK Valley institutional student records</strong> from the official master roster into local storage. Existing clearance approvals, payment receipts, and custom student passwords will be preserved.
            </p>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 space-y-1">
              <p className="font-semibold">• Idempotent update: no data loss</p>
              <p>• Updates missing student profiles and sets default credentials</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSyncDataset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm & Sync 81 Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
