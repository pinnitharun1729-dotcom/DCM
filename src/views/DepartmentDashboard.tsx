import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Lock,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
  Bell,
  Info,
} from 'lucide-react';
import { CodeDue, DepartmentId, DeptAccount, InAppNotification, StudentClearanceRecord, StudentProfile } from '../types';
import {
  addDue,
  approveDepartmentClearance,
  getClearanceRecords,
  getDuesForDepartment,
  getStudents,
  rejectDepartmentClearance,
  rejectReceipt,
  verifyAndApproveReceipt,
  getNotifications,
  markNotificationRead,
} from '../utils/storage';
import { AddDueModal } from '../components/AddDueModal';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { formatTimestamp } from '../utils/crypto';

interface DepartmentDashboardProps {
  department: DepartmentId;
  account: DeptAccount;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  department,
  account,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'receipts'>('receipts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');

  // Storage data
  const [students, setStudents] = useState<StudentProfile[]>(() => getStudents());
  const [clearanceRecords, setClearanceRecords] = useState<Record<string, StudentClearanceRecord>>(
    () => getClearanceRecords()
  );
  const [dues, setDues] = useState<CodeDue[]>(() => getDuesForDepartment(department));
  const [notifications, setNotifications] = useState<InAppNotification[]>(() =>
    getNotifications('dept', department)
  );

  React.useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getNotifications('dept', department));
    };
    window.addEventListener('rgukt_notification_updated', handleNotifUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('rgukt_notification_updated', handleNotifUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, [department]);

  // Modals
  const [isAddDueOpen, setIsAddDueOpen] = useState(false);

  // Reject modal state
  const [rejectModalConfig, setRejectModalConfig] = useState<{
    isOpen: boolean;
    type: 'clearance' | 'receipt';
    studentId?: string;
    dueId?: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    type: 'clearance',
    title: 'Reject Clearance',
  });

  // Receipt viewer modal
  const [viewingReceiptDue, setViewingReceiptDue] = useState<CodeDue | null>(null);

  // Email dispatch status banner
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  const reloadData = () => {
    setStudents(getStudents());
    setClearanceRecords(getClearanceRecords());
    setDues(getDuesForDepartment(department));
  };

  // Add Due
  const handleAddDue = (params: {
    student_id: string;
    department: DepartmentId;
    reason: string;
    amount: number;
  }) => {
    addDue(params);
    reloadData();
  };

  // Direct Approve Clearance
  const handleApproveClearance = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    approveDepartmentClearance({
      studentId,
      department,
      staffName: account.officerName,
      designation: account.designation,
      account,
    });
    setActionNotice({
      type: 'success',
      title: `Clearance Approved for ${st?.name || studentId.toUpperCase()}`,
      description: `Official approval email automatically dispatched to ${st?.email || 'student email'} from ${account.email}.`,
    });
    setTimeout(() => setActionNotice(null), 7000);
    reloadData();
  };

  // Reject Clearance trigger
  const handleOpenRejectClearance = (studentId: string, studentName: string) => {
    setRejectModalConfig({
      isOpen: true,
      type: 'clearance',
      studentId,
      title: `Reject Clearance for ${studentName}`,
      subtitle: `Mandatory institutional reason for rejecting ${department.toUpperCase()} clearance`,
    });
  };

  // Verify and Approve Receipt
  const handleVerifyReceipt = (due: CodeDue) => {
    const st = students.find((s) => s.id === due.student_id);
    verifyAndApproveReceipt({
      dueId: due.id,
      staffName: account.officerName,
      designation: account.designation,
    });
    setActionNotice({
      type: 'success',
      title: `Receipt Cleared for ${st?.name || due.student_id.toUpperCase()}`,
      description: `Payment receipt for ₹${due.amount} verified and cleared. Clearance approval email dispatched from ${account.email}.`,
    });
    setTimeout(() => setActionNotice(null), 7000);
    reloadData();
  };

  // Reject Receipt trigger
  const handleOpenRejectReceipt = (due: CodeDue) => {
    const st = students.find((s) => s.id === due.student_id);
    setRejectModalConfig({
      isOpen: true,
      type: 'receipt',
      dueId: due.id,
      title: `Reject Receipt — ${st?.name || due.student_id.toUpperCase()}`,
      subtitle: `Amount: ₹${due.amount} • Ref: ${due.transaction_ref || 'N/A'}`,
    });
  };

  // Confirm Rejection from modal
  const handleConfirmRejection = (reason: string) => {
    if (rejectModalConfig.type === 'clearance' && rejectModalConfig.studentId) {
      const st = students.find((s) => s.id === rejectModalConfig.studentId);
      rejectDepartmentClearance({
        studentId: rejectModalConfig.studentId,
        department,
        reason,
        staffName: account.officerName,
        designation: account.designation,
        account,
      });
      setActionNotice({
        type: 'error',
        title: `Clearance Denied for ${st?.name || rejectModalConfig.studentId.toUpperCase()}`,
        description: `Official rejection notice with entered reason dispatched to ${st?.email || 'student email'} from ${account.email}.`,
      });
      setTimeout(() => setActionNotice(null), 7000);
    } else if (rejectModalConfig.type === 'receipt' && rejectModalConfig.dueId) {
      const due = dues.find((d) => d.id === rejectModalConfig.dueId);
      const st = due ? students.find((s) => s.id === due.student_id) : null;
      rejectReceipt({
        dueId: rejectModalConfig.dueId,
        adminComment: reason,
        staffName: account.officerName,
      });
      setActionNotice({
        type: 'error',
        title: `Receipt Rejected for ${st?.name || due?.student_id.toUpperCase()}`,
        description: `Rejection notice with review remarks dispatched to ${st?.email || 'student email'} from ${account.email}.`,
      });
      setTimeout(() => setActionNotice(null), 7000);
    }
    reloadData();
  };

  // Calculate statistics
  const allSubmittedReceipts = dues.filter((d) => d.status === 'Receipt Submitted');
  const actionableReceipts = allSubmittedReceipts.filter((d) => d.verification_status === 'Approved');
  const pendingTxReceipts = allSubmittedReceipts.filter(
    (d) => !d.verification_status || d.verification_status === 'Pending'
  );
  const deniedTxReceipts = allSubmittedReceipts.filter((d) => d.verification_status === 'Denied');

  const clearedStudents = students.filter(
    (s) => clearanceRecords[s.id]?.departments[department]?.status === 'approved'
  );
  const pendingClearances = students.filter(
    (s) => clearanceRecords[s.id]?.departments[department]?.status === 'pending'
  );

  // Filtered students for Tab 1
  const filteredStudents = students.filter((s) => {
    const record = clearanceRecords[s.id];
    const status = record?.departments[department]?.status || 'pending';

    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Department Banner Card */}
      <div className="bento-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3.5 sm:space-x-4">
          <img
            src={account.avatar}
            alt={account.officerName}
            className="w-16 h-16 rounded-2xl object-cover ring-3 ring-slate-100/90 shadow-sm shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold bg-sky-100 text-[#075985] px-2.5 py-0.5 rounded-full uppercase">
                {department} Department Portal
              </span>
              <span className="text-xs text-slate-400">• Official Authority</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {account.officerName}
            </h1>
            <p className="text-xs text-slate-500 font-medium break-all xs:break-normal">
              {account.designation} • <span className="font-mono">{account.email}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto shrink-0 justify-start sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            id="btn-open-add-due"
            onClick={() => setIsAddDueOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#075985] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px] sm:min-h-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Due Against Student</span>
          </button>
          <button
            onClick={reloadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer min-h-[40px] sm:min-h-0 flex items-center justify-center"
            title="Refresh department roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Notice Banner (Email Dispatch Feedback) */}
      {actionNotice && (
        <div
          className={`bento-card p-4 flex items-start justify-between shadow-xs animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : actionNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : actionNotice.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm">
              <p className="font-bold">{actionNotice.title}</p>
              <p className="mt-0.5 text-xs opacity-90">{actionNotice.description}</p>
            </div>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold ml-2 cursor-pointer opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Department Advisories & Institutional Notifications */}
      {notifications.length > 0 && (
        <div className="bento-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#075985] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Institutional Notices & Department Bulletins
                </h3>
                <p className="text-[11px] text-slate-500">
                  Active academic directives and verification alerts
                </p>
              </div>
            </div>
            {notifications.some((n) => !n.read) && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                {notifications.filter((n) => !n.read).length} New
              </span>
            )}
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                  );
                }}
                className={`py-2.5 px-2 flex items-start space-x-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {notif.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : notif.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : notif.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bento-card bento-card-hover p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Actionable Receipts
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-extrabold text-[#075985] font-mono">
              {actionableReceipts.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
              Tx Verified
            </span>
          </div>
          {pendingTxReceipts.length > 0 && (
            <span className="text-[10px] text-amber-700 font-medium block mt-1">
              +{pendingTxReceipts.length} in Finance verification
            </span>
          )}
        </div>

        <div className="bento-card bento-card-hover p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Students
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600 font-mono">
              {pendingClearances.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
              In Progress
            </span>
          </div>
        </div>

        <div className="bento-card bento-card-hover p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cleared & Digitally Signed
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">
              {clearedStudents.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Cleared
            </span>
          </div>
        </div>

        <div className="bento-card bento-card-hover p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Dues Assessed
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {dues.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Records
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs as Mandated in Prompt */}
      <div className="bento-card overflow-hidden">
        <div className="border-b border-slate-200 px-5 sm:px-6 pt-4 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex space-x-6 shrink-0">
            {/* Tab 1: Payment Receipts Pending Verification */}
            <button
              id="tab-receipts-verification"
              onClick={() => setActiveTab('receipts')}
              className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'receipts'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Payment Receipts</span>
              {actionableReceipts.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white"
                  title={`${actionableReceipts.length} verified by Finance Officer & ready for department approval`}
                >
                  {actionableReceipts.length} Verified
                </span>
              )}
              {pendingTxReceipts.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800"
                  title={`${pendingTxReceipts.length} receipt(s) in Finance Transaction Verification review`}
                >
                  {pendingTxReceipts.length} in Tx Review
                </span>
              )}
            </button>

            {/* Tab 2: Clearance Requests & Student Roster */}
            <button
              id="tab-clearance-requests"
              onClick={() => setActiveTab('requests')}
              className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'requests'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All Clearance Requests & Students</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                {students.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1 CONTENT: Payment Receipts Pending Verification */}
        {activeTab === 'receipts' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Payment Receipts Submitted by Students
                </h3>
                <p className="text-xs text-slate-500">
                  Receipts require intermediary verification by the Finance Officer before departmental clearance can be endorsed.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-600">
                  {allSubmittedReceipts.length} Total Receipts:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                  {actionableReceipts.length} Actionable
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                  {pendingTxReceipts.length} Awaiting Finance
                </span>
              </div>
            </div>

            {allSubmittedReceipts.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  All Receipts Verified & Cleared
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are currently no outstanding SBI Collect receipts awaiting review for {department.toUpperCase()}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {allSubmittedReceipts.map((due) => {
                  const st = students.find((s) => s.id === due.student_id);
                  const isVerifiedByFinance = due.verification_status === 'Approved';
                  const isPendingFinance = !due.verification_status || due.verification_status === 'Pending';
                  const isDeniedByFinance = due.verification_status === 'Denied';

                  return (
                    <div
                      key={due.id}
                      id={`receipt-row-${due.id}`}
                      className="p-4 sm:p-5 bg-white hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Student & Due Info */}
                      <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                        {st && (
                          <img
                            src={st.photoUrl}
                            alt={st.name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {st?.name || due.student_id.toUpperCase()}
                            </span>
                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {due.student_id.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {st?.branch}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-700">
                            Due Reason: <span className="font-semibold text-slate-900">{due.reason}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-slate-900">
                              Amount: ₹{due.amount}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              SBI Ref: {due.transaction_ref || 'None provided'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 text-[11px]">
                              Submitted: {formatTimestamp(due.updated_at)}
                            </span>
                          </div>

                          {/* Transaction Verification Status Banner */}
                          <div className="pt-1">
                            {isVerifiedByFinance && (
                              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  Transaction Verified by Finance: <strong>{due.verification_officer || 'Finance Officer'}</strong>
                                  {due.verification_timestamp && ` (${formatTimestamp(due.verification_timestamp)})`}
                                </span>
                              </div>
                            )}

                            {isPendingFinance && (
                              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>
                                  Awaiting Transaction Verification (Finance Officer). Approval will unlock once verified.
                                </span>
                              </div>
                            )}

                            {isDeniedByFinance && (
                              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>
                                  Payment Not Verified (Denied by Finance Officer{due.verification_remarks ? `: "${due.verification_remarks}"` : ''}). Due remains unresolved.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt Thumbnail & Actions */}
                      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto self-end md:self-center shrink-0">
                        {/* Thumbnail preview button (Always available) */}
                        <button
                          onClick={() => setViewingReceiptDue(due)}
                          className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5 min-h-[38px] sm:min-h-0"
                          title="View uploaded payment receipt"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>View Receipt</span>
                        </button>

                        {/* Reject Receipt */}
                        <button
                          id={`btn-reject-receipt-${due.id}`}
                          disabled={!isVerifiedByFinance && !isDeniedByFinance}
                          onClick={() => handleOpenRejectReceipt(due)}
                          className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 min-h-[38px] sm:min-h-0 ${
                            isVerifiedByFinance || isDeniedByFinance
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                          title={
                            isVerifiedByFinance
                              ? 'Reject this receipt with official feedback'
                              : 'Action locked: Awaiting Finance transaction verification'
                          }
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Verify & Approve */}
                        <button
                          id={`btn-verify-receipt-${due.id}`}
                          disabled={!isVerifiedByFinance}
                          onClick={() => handleVerifyReceipt(due)}
                          className={`w-full sm:w-auto px-4 py-2 sm:py-1.5 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 min-h-[38px] sm:min-h-0 ${
                            isVerifiedByFinance
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                          title={
                            isVerifiedByFinance
                              ? 'Endorse clearance and issue departmental digital signature'
                              : isDeniedByFinance
                              ? 'Cannot approve: Payment not verified (denied by Finance)'
                              : 'Locked: Requires Finance Officer transaction verification first'
                          }
                        >
                          {isVerifiedByFinance ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isVerifiedByFinance
                              ? 'Verify & Approve'
                              : isDeniedByFinance
                              ? 'Payment Not Verified'
                              : 'Finance Verification Pending'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2 CONTENT: Clearance Requests & Student Roster */}
        {activeTab === 'requests' && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student name, ID (e.g. r240086), branch..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="all">All Clearance States</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review (Receipt Submitted)</option>
                  <option value="approved">Approved / Cleared</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Student Particulars</th>
                    <th className="p-3.5">Program & Branch</th>
                    <th className="p-3.5">Department Status</th>
                    <th className="p-3.5">Assessed Dues</th>
                    <th className="p-3.5 text-right">Clearance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const record = clearanceRecords[st.id];
                      const clearance = record?.departments[department];
                      const status = clearance?.status || 'pending';
                      const studentDues = dues.filter((d) => d.student_id === st.id);
                      const hasUnpaidDues = studentDues.some(
                        (d) =>
                          d.status === 'Unpaid' ||
                          d.status === 'Receipt Submitted' ||
                          d.status === 'Rejected' ||
                          d.verification_status === 'Denied' ||
                          d.verification_status === 'Pending'
                      );

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Student Info */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img
                                src={st.photoUrl}
                                alt={st.name}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{st.name}</p>
                                <p className="font-mono text-slate-500 font-semibold text-[11px]">
                                  {st.id.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Program */}
                          <td className="p-3.5">
                            <p className="font-medium text-slate-800">{st.branch}</p>
                            <p className="text-[11px] text-slate-400">Batch {st.batch}</p>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5">
                            {status === 'approved' ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Cleared</span>
                                </span>
                                {clearance?.digital_signature && (
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {clearance.digital_signature.verification_hash.slice(0, 14)}...
                                  </p>
                                )}
                              </div>
                            ) : status === 'under_review' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                                <Clock className="w-3 h-3" />
                                <span>Receipt Under Review</span>
                              </span>
                            ) : status === 'rejected' ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                  <XCircle className="w-3 h-3" />
                                  <span>Rejected</span>
                                </span>
                                {clearance?.rejection_reason && (
                                  <p className="text-[10px] text-rose-600 mt-0.5 line-clamp-1">
                                    {clearance.rejection_reason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          {/* Dues */}
                          <td className="p-3.5">
                            {studentDues.length === 0 ? (
                              <span className="text-slate-400 text-xs">No dues</span>
                            ) : (
                              <div className="space-y-1.5">
                                {studentDues.map((d) => (
                                  <div
                                    key={d.id}
                                    className="text-[11px] flex flex-col space-y-0.5"
                                  >
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-slate-800">₹{d.amount}</span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                          d.status === 'Approved'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : d.status === 'Receipt Submitted'
                                            ? 'bg-indigo-100 text-indigo-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {d.status}
                                      </span>
                                    </div>
                                    {d.status === 'Receipt Submitted' && (
                                      <div className="text-[10px]">
                                        {d.verification_status === 'Approved' ? (
                                          <span className="text-emerald-700 font-semibold flex items-center">
                                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                                            Tx Verified by Finance
                                          </span>
                                        ) : d.verification_status === 'Denied' ? (
                                          <span className="text-rose-700 font-bold flex items-center">
                                            <XCircle className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                                            Payment Denied by Finance
                                          </span>
                                        ) : (
                                          <span className="text-amber-700 font-medium flex items-center">
                                            <Clock className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                                            Tx Review Pending
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right space-x-1.5">
                            {status === 'approved' ? (
                              <span className="text-emerald-700 font-semibold text-xs inline-flex items-center space-x-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Digitally Sealed</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  id={`btn-reject-dept-clearance-${st.id}`}
                                  onClick={() => handleOpenRejectClearance(st.id, st.name)}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  id={`btn-approve-dept-clearance-${st.id}`}
                                  disabled={hasUnpaidDues}
                                  onClick={() => handleApproveClearance(st.id)}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                    hasUnpaidDues
                                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer'
                                  }`}
                                  title={
                                    hasUnpaidDues
                                      ? 'Cannot clear: student has unresolved dues or unverified receipts'
                                      : 'Digitally approve clearance and apply signature'
                                  }
                                >
                                  Approve Clearance
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Due Modal */}
      <AddDueModal
        department={department}
        isOpen={isAddDueOpen}
        onClose={() => setIsAddDueOpen(false)}
        onAddDue={handleAddDue}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={rejectModalConfig.isOpen}
        title={rejectModalConfig.title}
        subtitle={rejectModalConfig.subtitle}
        onClose={() =>
          setRejectModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmRejection}
      />

      {/* Receipt Viewer Modal */}
      <ReceiptViewerModal
        due={viewingReceiptDue}
        student={
          viewingReceiptDue
            ? students.find((s) => s.id === viewingReceiptDue.student_id) || null
            : null
        }
        isOpen={!!viewingReceiptDue}
        canManage={true}
        onClose={() => setViewingReceiptDue(null)}
        onVerifyAndApprove={(due) => {
          handleVerifyReceipt(due);
          setViewingReceiptDue(null);
        }}
        onReject={(due) => {
          setViewingReceiptDue(null);
          handleOpenRejectReceipt(due);
        }}
      />
    </div>
  );
};
