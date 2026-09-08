import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  FileText,
  Filter,
  Download,
  ArrowLeft,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StudentProfile, StudentClearanceRecord, CodeDue } from '../types';
import {
  getStudents,
  getClearanceRecords,
  getDues,
  syncStudentRecords,
  resetStudentPassword,
} from '../utils/storage';
import { FULL_REAL_STUDENTS, buildStudentProfiles } from '../data/rguktStudentsData';

interface ManageStudentsViewProps {
  onBack: () => void;
}

interface ImportSummary {
  total: number;
  added: number;
  updated: number;
  errors: number;
  timestamp: string;
  source: string;
}

export const ManageStudentsView: React.FC<ManageStudentsViewProps> = ({ onBack }) => {
  const [students, setStudents] = useState<StudentProfile[]>(() => getStudents());
  const [clearanceRecords, setClearanceRecords] = useState<Record<string, StudentClearanceRecord>>(
    () => getClearanceRecords()
  );
  const [dues, setDues] = useState<CodeDue[]>(() => getDues());

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedLoginStatus, setSelectedLoginStatus] = useState<'all' | 'default' | 'changed'>('all');
  const [selectedClearanceStatus, setSelectedClearanceStatus] = useState<
    'all' | 'cleared' | 'in_progress' | 'pending' | 'rejected'
  >('all');

  // Import Modal & Summary State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [importTab, setImportTab] = useState<'refresh' | 'upload'>('refresh');

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const refreshAllData = () => {
    setStudents(getStudents());
    setClearanceRecords(getClearanceRecords());
    setDues(getDues());
  };

  // Helper to compute a student's clearance status
  const getStudentStatus = (studentId: string) => {
    const rec = clearanceRecords[studentId.toLowerCase()];
    if (!rec) return { label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200', type: 'pending' };

    if (rec.certificate_generated) {
      return { label: 'Fully Cleared (Cert Issued)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', type: 'cleared' };
    }

    const depts = ['library', 'hostel', 'lab', 'finance', 'sports', 'itinfra'] as const;
    const statuses = depts.map((d) => rec?.departments?.[d]?.status || 'pending');

    if (statuses.some((s) => s === 'rejected')) {
      return { label: 'Action Needed (Rejected)', color: 'bg-rose-50 text-rose-700 border-rose-200', type: 'rejected' };
    }

    const approvedCount = statuses.filter((s) => s === 'approved').length;
    if (approvedCount === 6) {
      return { label: 'All 6 Depts Cleared', color: 'bg-blue-50 text-blue-700 border-blue-200', type: 'cleared' };
    }

    if (approvedCount > 0) {
      return { label: `${approvedCount}/6 Depts Cleared`, color: 'bg-amber-50 text-amber-700 border-amber-200', type: 'in_progress' };
    }

    return { label: 'Pending Clearance', color: 'bg-slate-100 text-slate-600 border-slate-200', type: 'pending' };
  };

  // Unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const branches = new Set(students.map((s) => s.branch));
    return Array.from(branches).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          s.email.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && s.branch !== selectedBranch) {
        return false;
      }

      // Login status filter
      if (selectedLoginStatus === 'default' && s.hasChangedPassword) return false;
      if (selectedLoginStatus === 'changed' && !s.hasChangedPassword) return false;

      // Clearance status filter
      if (selectedClearanceStatus !== 'all') {
        const stat = getStudentStatus(s.id);
        if (selectedClearanceStatus === 'cleared' && stat.type !== 'cleared') return false;
        if (selectedClearanceStatus === 'in_progress' && stat.type !== 'in_progress') return false;
        if (selectedClearanceStatus === 'pending' && stat.type !== 'pending') return false;
        if (selectedClearanceStatus === 'rejected' && stat.type !== 'rejected') return false;
      }

      return true;
    });
  }, [students, searchTerm, selectedBranch, selectedLoginStatus, selectedClearanceStatus, clearanceRecords]);

  // Re-import / Refresh Master Dataset Handler
  const handleRefreshMasterDataset = async () => {
    setIsImporting(true);
      // Re-run idempotent sync with FULL_REAL_STUDENTS
      const result = await syncStudentRecords(FULL_REAL_STUDENTS);
      refreshAllData();
      setIsImporting(false);

      setImportSummary({
        total: result.total,
        added: result.added,
        updated: result.updated,
        errors: 0,
        timestamp: new Date().toLocaleTimeString(),
        source: 'Official RGUKT Master Dataset (81 Students)',
      });
      setIsImportModalOpen(true);
    
  };

  // Custom File / Text Import Handler
  const handleCustomImport = async (text: string) => {
    if (!text.trim()) return;
    setIsImporting(true);

    try {
      // Expect CSV or tab-separated lines: RollNumber, Name, Branch, Batch, [Gender]
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('roll'));

      const parsed: any[] = [];
      let errorCount = 0;

      lines.forEach((line) => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        if (parts.length >= 2) {
          const roll = parts[0].trim().toUpperCase();
          const name = parts[1].trim();
          const branch = parts[2] ? parts[2].trim() : 'Engineering';
          const batch = parts[3] ? parts[3].trim() : '2024-2028';
          const gender = parts[4] ? parts[4].trim().toUpperCase() : 'M';
          parsed.push({ roll, name, branch, batch, gender });
        } else {
          errorCount++;
        }
      });

      if (parsed.length > 0) {
        const generated = buildStudentProfiles(parsed);
        const result = await syncStudentRecords(generated);
        refreshAllData();

        setImportSummary({
          total: result.total,
          added: result.added,
          updated: result.updated,
          errors: errorCount,
          timestamp: new Date().toLocaleTimeString(),
          source: `User Custom Import (${parsed.length} records parsed)`,
        });
      } else {
        alert('Could not parse valid records. Please ensure lines are in format: RollNumber, Name, Branch, Batch');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing file or text data.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle File Upload from Disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomInputText(content);
        handleCustomImport(content);
      }
    };
    reader.readAsText(file);
  };

  // Reset Student Password to default roll number
  const handleResetPassword = async (student: StudentProfile) => {
    if (confirm(`Reset password for ${student.name} (${student.rollNumber || student.id.toUpperCase()}) to their default roll number?`)) {
      await resetStudentPassword(student.id);
      refreshAllData();
      setActionSuccessMessage(`Password for ${student.name} reset to default.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent({
          ...selectedStudent,
          hasChangedPassword: false,
        });
      }
    }
  };

  // Export CSV of loaded students
  const handleExportCSV = () => {
    const headers = ['Roll Number', 'Name', 'Branch', 'Batch', 'Official Email', 'Login Status', 'Clearance Status'];
    const rows = students.map((s) => {
      const stat = getStudentStatus(s.id);
      return [
        s.rollNumber || s.id.toUpperCase(),
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.branch}"`,
        s.batch,
        s.email,
        s.hasChangedPassword ? 'Password Changed' : 'Default Password',
        `"${stat.label}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RGUKT_Students_Dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics for overview cards
  const totalCount = students.length;
  const changedPasswordCount = students.filter((s) => s.hasChangedPassword).length;
  const defaultPasswordCount = totalCount - changedPasswordCount;
  const fullyClearedCount = students.filter((s) => clearanceRecords[s.id.toLowerCase()]?.certificate_generated).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-reimport-update-data"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-import / Update Data</span>
          </button>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
              Institutional Master Registry
            </span>
            <span className="text-xs text-slate-400">• Idempotent Sync Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Manage Students & Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Verify official RGUKT student accounts, examine login statuses (Default vs Password Changed),
            inspect multi-department clearance progress, and run non-destructive dataset updates.
          </p>
        </div>

        {/* Action button inside banner */}
        <div className="shrink-0">
          <button
            onClick={handleRefreshMasterDataset}
            disabled={isImporting}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isImporting ? 'animate-spin' : ''}`} />
            <span>{isImporting ? 'Synchronizing...' : 'Quick Sync 81 Records'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Registered</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Official RGUKT Cohort</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Default Password</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{defaultPasswordCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Roll number login</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Password Changed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{changedPasswordCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Secured student accounts</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Fully Cleared</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{fullyClearedCount}</p>
          <p className="text-[11px] text-indigo-600 mt-0.5">Certificates issued</p>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Roll No, Name, Branch, Email..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Branch Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="all">All Branches ({students.length})</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Login Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedLoginStatus}
              onChange={(e) => setSelectedLoginStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="all">All Login Statuses</option>
              <option value="default">Default Password ({defaultPasswordCount})</option>
              <option value="changed">Password Changed ({changedPasswordCount})</option>
            </select>
          </div>

          {/* Clearance Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedClearanceStatus}
              onChange={(e) => setSelectedClearanceStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="all">All Clearances</option>
              <option value="cleared">Fully Cleared</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="rejected">Has Rejections</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display & Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800">{students.length}</strong> students
            {(searchTerm || selectedBranch !== 'all' || selectedLoginStatus !== 'all' || selectedClearanceStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBranch('all');
                  setSelectedLoginStatus('all');
                  setSelectedClearanceStatus('all');
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Reset filters
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Click any student row to view full clearance details
          </span>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Branch & Batch</th>
                <th className="py-3.5 px-4">Official Email</th>
                <th className="py-3.5 px-4">Login Status</th>
                <th className="py-3.5 px-4">Clearance Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No students matched your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const clearanceStat = getStudentStatus(student.id);
                  const isDefaultPass = !student.hasChangedPassword;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      {/* Roll Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md">
                          {student.rollNumber || student.id.toUpperCase()}
                        </span>
                      </td>

                      {/* Name with avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      {/* Branch & Batch */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <span className="font-medium text-slate-800">{student.branch}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{student.batch}</span>
                        </div>
                      </td>

                      {/* Official Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {student.email}
                      </td>

                      {/* Login Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isDefaultPass ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <KeyRound className="w-3 h-3" />
                            <span>Default Password</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Password Changed</span>
                          </span>
                        )}
                      </td>

                      {/* Clearance Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${clearanceStat.color}`}
                        >
                          {clearanceStat.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View student clearance card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {student.hasChangedPassword && (
                            <button
                              onClick={() => handleResetPassword(student)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reset to default password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            RGUKT RK Valley Clearance Database • 81 Total Students Loaded
          </span>
          <span className="text-[11px] text-slate-400">
            Authentication auto-derives from roll number hash ({`[roll]@rguktrkv.ac.in`})
          </span>
        </div>
      </div>

      {/* Re-import / Update Data Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Re-import / Update Student Data</h3>
                  <p className="text-xs text-slate-400">Idempotent update preserving existing clearance progress</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setImportTab('refresh')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  importTab === 'refresh'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Re-run Official Dataset (81 Records)
              </button>
              <button
                onClick={() => setImportTab('upload')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  importTab === 'upload'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Upload Custom File or Paste Records
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {importSummary && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Import & Synchronization Summary</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Total Records</span>
                      <span className="text-lg font-bold text-slate-900">{importSummary.total}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 uppercase block">New Added</span>
                      <span className="text-lg font-bold text-emerald-600">{importSummary.added}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Updated / Kept</span>
                      <span className="text-lg font-bold text-blue-600">{importSummary.updated}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Errors</span>
                      <span className="text-lg font-bold text-slate-700">{importSummary.errors}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-700 pt-1">
                    Source: <strong>{importSummary.source}</strong> at {importSummary.timestamp}. Existing dues,
                    uploaded receipts, and password hashes were preserved.
                  </p>
                </div>
              )}

              {importTab === 'refresh' ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <p className="font-semibold text-slate-800">
                      Official Dataset Refresh Guarantee:
                    </p>
                    <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4 leading-relaxed">
                      <li>Synchronizes all 81 RGUKT student records from the institutional registry.</li>
                      <li>Ensures official emails follow <code className="font-mono bg-slate-200 px-1 py-0.2 rounded">[rollnumber]@rguktrkv.ac.in</code>.</li>
                      <li>Auto-derives default passwords from roll numbers (securely hashed).</li>
                      <li><strong>Preserves student progress:</strong> Any payments, receipts, or custom passwords set by students are retained.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleRefreshMasterDataset}
                    disabled={isImporting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                    <span>{isImporting ? 'Syncing...' : 'Re-run Master 81 Records Import'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt,.json"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Or Paste Data (Format: Roll Number, Name, Branch, Batch)
                    </label>
                    <textarea
                      value={customInputText}
                      onChange={(e) => setCustomInputText(e.target.value)}
                      placeholder="R240086, A. Vikrant, Computer Science & Engineering, 2024-2028
O240635, K. Navyakala, Artificial Intelligence & Machine Learning, 2024-2028"
                      rows={5}
                      className="w-full p-3 text-xs font-mono border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-hidden bg-slate-50"
                    />
                  </div>

                  <button
                    onClick={() => handleCustomImport(customInputText)}
                    disabled={isImporting || !customInputText.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Parsed Records</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono text-blue-300">
                    {selectedStudent.rollNumber || selectedStudent.id.toUpperCase()} • {selectedStudent.branch}
                  </p>
                  <p className="text-[11px] text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Account / Credential Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Login Method:</span>
                  <span className="font-semibold text-slate-800">Google SSO & Email/Password</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Password State:</span>
                  {selectedStudent.hasChangedPassword ? (
                    <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Custom Password Set</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-600 flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Default Roll Number</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Batch / Cohort:</span>
                  <span className="font-mono text-slate-800">{selectedStudent.batch}</span>
                </div>
              </div>

              {/* Departmental Clearance Status */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Departmental Clearance Verification
                </h4>
                {(() => {
                  const rec = clearanceRecords[selectedStudent.id.toLowerCase()];
                  const depts = [
                    { id: 'library', name: 'Central Library' },
                    { id: 'hostel', name: 'Hostel & Mess' },
                    { id: 'lab', name: 'Academic Labs' },
                    { id: 'finance', name: 'Accounts & Finance' },
                    { id: 'sports', name: 'Sports & Games' },
                    { id: 'itinfra', name: 'IT Infrastructure' },
                  ] as const;

                  return (
                    <div className="space-y-1.5">
                      {depts.map((d) => {
                        const deptStatus = rec?.departments?.[d.id]?.status || 'pending';
                        return (
                          <div
                            key={d.id}
                            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-700">{d.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider ${
                                deptStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : deptStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {deptStatus}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Dues & Fees */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Outstanding Dues & Fines
                </h4>
                {(() => {
                  const studentDues = dues.filter(
                    (d) => d.student_id.toLowerCase() === selectedStudent.id.toLowerCase()
                  );
                  if (studentDues.length === 0) {
                    return (
                      <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                        No outstanding fines or recorded dues for this student.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1.5">
                      {studentDues.map((due) => (
                        <div
                          key={due.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{due.reason}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{due.department} Dept</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-rose-600">₹{due.amount}</p>
                            <span className="text-[10px] font-semibold text-slate-500">{due.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {selectedStudent.hasChangedPassword ? (
                <button
                  onClick={() => handleResetPassword(selectedStudent)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset to Default Password</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Student is on default password</span>
              )}

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
