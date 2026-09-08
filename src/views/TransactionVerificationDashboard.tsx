import React, { useState, useEffect } from 'react';
import { useFirebaseDataForAccount } from "../hooks/useFirebaseData";
import {
  AlertCircle,
  BookOpen,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  Filter,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import { CodeDue, DepartmentId, DeptAccount, StudentProfile, VerificationStatus } from '../types';
import { DEPARTMENTS, SEED_STUDENTS } from '../constants';
import {
  approveTransactionVerification,
  denyTransactionVerification,
  getDues,
  getStudents,
} from '../utils/storage';
import { formatTimestamp } from '../utils/crypto';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';

interface TransactionVerificationDashboardProps {
  account: DeptAccount;
}

export const TransactionVerificationDashboard: React.FC<TransactionVerificationDashboardProps> = ({
  account,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dues, setDues] = useState<CodeDue[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [deptFilter, setDeptFilter] = useState<'all' | DepartmentId>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Modals
  const [viewingDue, setViewingDue] = useState<CodeDue | null>(null);
  const [approvingDue, setApprovingDue] = useState<CodeDue | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [denyingDue, setDenyingDue] = useState<CodeDue | null>(null);
  const [denialReason, setDenialReason] = useState('');

  const reloadData = () => {
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    const loadedDues = getDues();
    setDues(loadedDues);
  };

  useEffect(() => {
    reloadData();
    setIsSubmitting(false);
  }, []);

  // Filter dues that have a submitted receipt (or any due that has verification_status)
  const submittedReceiptDues = dues.filter(
    (d) => d.status === 'Receipt Submitted' || d.verification_status !== undefined
  );

  // Filtered list
  const filteredDues = submittedReceiptDues.filter((due) => {
    const st = students.find((s) => s.id.toLowerCase() === due.student_id.toLowerCase());
    const studentName = st?.name || '';
    const studentId = due.student_id;
    const ref = due.transaction_ref || '';
    const reason = due.reason || '';

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase());

    const effectiveStatus: VerificationStatus = due.verification_status || 'Pending';
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
    const matchesDept = deptFilter === 'all' || due.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Statistics
  const totalSubmitted = submittedReceiptDues.length;
  const pendingCount = submittedReceiptDues.filter(
    (d) => (d.verification_status || 'Pending') === 'Pending'
  ).length;
  const approvedCount = submittedReceiptDues.filter(
    (d) => d.verification_status === 'Approved'
  ).length;
  const deniedCount = submittedReceiptDues.filter(
    (d) => d.verification_status === 'Denied'
  ).length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleConfirmApproval = () => {
    if (!approvingDue) return;
    approveTransactionVerification({
      dueId: approvingDue.id,
      officerName: account.officerName,
      remarks:
        approvalRemarks.trim() ||
        'SBI Collect reference verified against RGUKT central account credit logs.',
    });
    setApprovingDue(null);
    setApprovalRemarks('');
    reloadData();
    setIsSubmitting(false);
  };

  const handleConfirmDenial = () => {
    if (!denyingDue) return;
    if (!denialReason.trim()) {
      alert('Please provide a valid reason for denying this transaction.');
      return;
    }
    denyTransactionVerification({
      dueId: denyingDue.id,
      officerName: account.officerName,
      reason: denialReason.trim(),
    });
    setDenyingDue(null);
    setDenialReason('');
    reloadData();
    setIsSubmitting(false);
  };

  const getDeptIcon = (deptId: DepartmentId) => {
    switch (deptId) {
      case 'library':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'hostel':
        return <Building className="w-3.5 h-3.5" />;
      case 'lab':
        return <FlaskConical className="w-3.5 h-3.5" />;
      case 'finance':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'sports':
        return <Trophy className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Officer Banner Card */}
      <div className="bento-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3.5 sm:space-x-4">
          <img
            src={account.avatar}
            alt={account.officerName}
            className="w-16 h-16 rounded-2xl object-cover ring-3 ring-teal-100 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full uppercase">
                Transaction Verification Office
              </span>
              <span className="text-xs text-slate-400">• Internal Finance Gateway</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {account.officerName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {account.designation} • RGUKT RK Valley Finance & Accounts Division
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={reloadData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            title="Refresh queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Explanatory Process Note */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start space-x-3 text-xs text-teal-950">
        <div className="mt-0.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold">Intermediary Financial Approval Gate</p>
          <p className="text-teal-800 leading-relaxed">
            All student payment receipts and SBI Collect reference numbers across every department (Library, Hostel, Lab, Sports, Finance) are routed to this queue first.
            Respective departments will only be unlocked to approve student clearance after you certify that the payment is genuine and credited.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bento-card p-4 sm:p-5 border-l-4 border-l-slate-400">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {totalSubmitted}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">University-wide receipts</p>
        </div>

        <div className="bento-card p-4 sm:p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Awaiting Verification</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {pendingCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Action required by Finance</p>
        </div>

        <div className="bento-card p-4 sm:p-5 border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Verified & Forwarded
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            {approvedCount}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Approved for dept clearance</p>
        </div>

        <div className="bento-card p-4 sm:p-5 border-l-4 border-l-rose-500 bg-rose-50/30">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            Denied / Unverified
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1">
            {deniedCount}
          </p>
          <p className="text-[11px] text-rose-700 mt-0.5">Payment not verified</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bento-card p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID, SBI Collect reference, or due reason..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as any)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Departments ({totalSubmitted})</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Submissions ({totalSubmitted})
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending Review ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified by Finance ({approvedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Denied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Denied'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Payment Denied ({deniedCount})</span>
          </button>
        </div>
      </div>

      {/* Transaction Queue Table */}
      <div className="bento-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Transaction Verification Audit Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Cross-verify bank transaction reference numbers with uploaded receipt images
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredDues.length} records
          </span>
        </div>

        {filteredDues.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-bold text-slate-800 text-sm">No transactions match current filters</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All payment receipts under this criteria have been processed or no submissions match the query.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDues.map((due) => {
              const st = students.find((s) => s.id.toLowerCase() === due.student_id.toLowerCase());
              const effectiveStatus: VerificationStatus = due.verification_status || 'Pending';

              return (
                <div
                  key={due.id}
                  id={`tx-verification-row-${due.id}`}
                  className="p-4 sm:p-5 bg-white hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Student & Due Details */}
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    {st ? (
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-mono font-bold shrink-0">
                        {due.student_id.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {st?.name || due.student_id.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {due.student_id.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {st?.branch} ({st?.batch})
                        </span>
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {getDeptIcon(due.department)}
                          <span className="ml-1">{due.department} Department</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">
                        Due: <span className="font-semibold text-slate-900">{due.reason}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs pt-0.5">
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          Amount: ₹{due.amount}
                        </span>

                        <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-blue-900 font-mono">
                          <span className="text-[10px] text-blue-500 uppercase font-semibold">Ref:</span>
                          <span className="font-bold">{due.transaction_ref || 'None provided'}</span>
                          {due.transaction_ref && (
                            <button
                              onClick={() => handleCopy(due.transaction_ref!)}
                              className="text-blue-500 hover:text-blue-700 p-0.5"
                              title="Copy Reference"
                            >
                              {copiedRef === due.transaction_ref ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-500">
                          Submitted: {formatTimestamp(due.updated_at)}
                        </span>
                      </div>

                      {/* Verification Audit Note if already reviewed */}
                      {due.verification_status && due.verification_status !== 'Pending' && (
                        <div
                          className={`mt-2 p-2.5 rounded-xl text-xs border flex items-start space-x-2 ${
                            due.verification_status === 'Approved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50 border-rose-200 text-rose-950'
                          }`}
                        >
                          {due.verification_status === 'Approved' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                          )}
                          <div className="space-y-0.5">
                            <p className="font-bold text-[11px]">
                              {due.verification_status === 'Approved'
                                ? `Transaction Verified by ${due.verification_officer || account.officerName}`
                                : `Payment Not Verified (Denied by ${due.verification_officer || account.officerName})`}
                              {due.verification_timestamp && (
                                <span className="font-normal text-slate-500 ml-1">
                                  on {formatTimestamp(due.verification_timestamp)}
                                </span>
                              )}
                            </p>
                            {due.verification_remarks && (
                              <p className="text-[11px] italic text-slate-700">
                                "{due.verification_remarks}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0 self-end lg:self-center">
                    {/* Status Badge */}
                    <div className="mb-1">
                      {effectiveStatus === 'Approved' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Verified by Finance</span>
                        </span>
                      ) : effectiveStatus === 'Denied' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          <span>Payment Denied</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Awaiting Finance Review</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* View Receipt */}
                      <button
                        onClick={() => setViewingDue(due)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1"
                        title="Inspect receipt document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {/* Deny Button */}
                      <button
                        id={`btn-deny-tx-${due.id}`}
                        onClick={() => {
                          setDenyingDue(due);
                          setDenialReason('');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1 ${
                          effectiveStatus === 'Denied'
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deny</span>
                      </button>

                      {/* Approve Button */}
                      <button
                        id={`btn-approve-tx-${due.id}`}
                        onClick={() => {
                          setApprovingDue(due);
                          setApprovalRemarks('');
                        }}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer ${
                          effectiveStatus === 'Approved'
                            ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{effectiveStatus === 'Approved' ? 'Re-Approve' : 'Approve'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      <ReceiptViewerModal
        due={viewingDue}
        student={students.find((s) => s.id === viewingDue?.student_id) || null}
        isOpen={!!viewingDue}
        onClose={() => setViewingDue(null)}
        showVerificationStatus={true}
      />

      {/* Approve Modal */}
      {approvingDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-teal-50/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Approve Transaction Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certify SBI Collect payment receipt
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovingDue(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {approvingDue.student_id.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {approvingDue.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-extrabold text-slate-900">₹{approvingDue.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SBI Ref:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {approvingDue.transaction_ref || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Verification Remarks (Optional):
                </label>
                <input
                  type="text"
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="e.g. Verified with SBI Collect university merchant statement"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                By approving, this transaction will become <strong>actionable</strong> in the{' '}
                <strong className="text-slate-900 uppercase">{approvingDue.department}</strong>{' '}
                department dashboard for final clearance sign-off.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setApprovingDue(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-approve-tx"
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {denyingDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-rose-50/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Deny Payment Verification</h3>
                  <p className="text-xs text-slate-500">Flag transaction reference as invalid</p>
                </div>
              </div>
              <button
                onClick={() => setDenyingDue(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {denyingDue.student_id.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-extrabold text-slate-900">₹{denyingDue.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SBI Ref:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {denyingDue.transaction_ref || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Denial Reason <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="e.g. SBI reference number not found in university bank ledger; mismatched transaction amount; or blurred receipt."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900">
                <p className="font-bold">Operational Impact:</p>
                <p className="mt-0.5">
                  The {denyingDue.department.toUpperCase()} department will view this due as{' '}
                  <strong>"Payment Not Verified"</strong> and will not be able to approve clearance based on this receipt. The due remains unresolved.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setDenyingDue(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-deny-tx"
                onClick={handleConfirmDenial}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Deny Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
