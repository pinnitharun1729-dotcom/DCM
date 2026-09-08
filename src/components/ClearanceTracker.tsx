import React from 'react';
import {
  BookOpen,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  FileUp,
  FlaskConical,
  HelpCircle,
  Trophy,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { CodeDue, DepartmentClearance, DepartmentId, StudentClearanceRecord } from '../types';
import { DEPARTMENTS, DepartmentMeta } from '../constants';
import { formatTimestamp } from '../utils/crypto';

interface ClearanceTrackerProps {
  clearanceRecord: StudentClearanceRecord;
  dues: CodeDue[];
  onPayNow: (due: CodeDue) => void;
  onUploadReceipt: (due: CodeDue) => void;
  onViewReceipt: (due: CodeDue) => void;
}

const getDepartmentIcon = (id: DepartmentId) => {
  switch (id) {
    case 'library':
      return <BookOpen className="w-5 h-5" />;
    case 'hostel':
      return <Building className="w-5 h-5" />;
    case 'lab':
      return <FlaskConical className="w-5 h-5" />;
    case 'finance':
      return <CreditCard className="w-5 h-5" />;
    case 'sports':
      return <Trophy className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export const ClearanceTracker: React.FC<ClearanceTrackerProps> = ({
  clearanceRecord,
  dues,
  onPayNow,
  onUploadReceipt,
  onViewReceipt,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Institutional Department Clearance Status
          </h2>
          <p className="text-xs text-slate-500">
            Real-time status across 6 statutory clearance authorities at RGUKT RK Valley
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">6 Departments</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map((dept: DepartmentMeta) => {
          const clearance: DepartmentClearance | undefined = clearanceRecord?.departments?.[dept.id];
          const status = clearance?.status || 'pending';
          const deptDues = dues.filter((d) => d.department === dept.id);
          const unpaidDues = deptDues.filter((d) => d.status === 'Unpaid');
          const submittedReceiptDues = deptDues.filter((d) => d.status === 'Payment Submitted — Awaiting Transaction Verification');
          const rejectedReceiptDues = deptDues.filter((d) => d.status === 'Rejected');

          // Status Badge styling
          let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
          let statusText = 'Pending';
          let statusIcon = <Clock className="w-3.5 h-3.5 text-slate-500" />;

          if (status === 'approved') {
            badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            statusText = 'Approved';
            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
          } else if (status === 'under_review') {
            badgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
            statusText = 'Under Review';
            statusIcon = <Clock className="w-3.5 h-3.5 text-indigo-600" />;
          } else if (status === 'rejected') {
            badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
            statusText = 'Rejected';
            statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
          } else if (status === 'pending') {
            badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
            statusText = unpaidDues.length > 0 ? 'Pending (Dues Owed)' : 'Pending Verification';
            statusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
          }

          const statusCardClass =
            status === 'approved'
              ? 'bento-dept-approved'
              : status === 'under_review'
              ? 'bento-dept-review'
              : status === 'rejected'
              ? 'bento-dept-rejected'
              : 'bento-dept-pending';

          return (
            <div
              key={dept.id}
              id={`card-dept-${dept.id}`}
              className={`bento-card bento-card-hover flex flex-col justify-between overflow-hidden relative ${statusCardClass}`}
            >
              {/* Card Top: Department Details & Status Badge */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status === 'under_review'
                          ? 'bg-indigo-100 text-indigo-700'
                          : status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {getDepartmentIcon(dept.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {dept.code} • {dept.location.split(',')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 whitespace-nowrap ${badgeBg}`}
                  >
                    {statusIcon}
                    <span>{statusText}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                  {dept.description}
                </p>

                {/* Approved State: Digital Signature Box */}
                {status === 'approved' && clearance?.digital_signature && (
                  <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-semibold text-[11px] gap-2">
                      <span className="flex items-center space-x-1 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Digitally Signed</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 truncate max-w-[120px]">
                        {clearance.digital_signature.verification_hash.slice(0, 16)}...
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium text-[11px]">
                      {clearance.digital_signature.staff_name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {clearance.digital_signature.designation} •{' '}
                      {formatTimestamp(clearance.digital_signature.timestamp)}
                    </p>
                  </div>
                )}

                {/* Rejection Remarks */}
                {status === 'rejected' && clearance?.rejection_reason && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <p className="font-semibold text-rose-900 mb-0.5">Rejection Reason:</p>
                    <p>{clearance.rejection_reason}</p>
                  </div>
                )}

                {/* Department Dues Section */}
                {deptDues.length > 0 && (
                  <div className="mt-4 space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Assessed University Dues:
                    </span>
                    {deptDues.map((due) => (
                      <div
                        key={due.id}
                        className={`p-3 rounded-xl border text-xs ${
                          due.status === 'Approved'
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                            : due.status === 'Payment Submitted — Awaiting Transaction Verification'
                            ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
                            : due.status === 'Rejected'
                            ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                            : 'bg-amber-50/60 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-slate-900">
                              ₹{due.amount}
                            </span>
                            <p className="text-xs font-medium text-slate-700 mt-0.5">
                              {due.reason}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              due.status === 'Approved'
                                ? 'bg-emerald-200 text-emerald-800'
                                : due.status === 'Payment Submitted — Awaiting Transaction Verification'
                                ? 'bg-indigo-200 text-indigo-800'
                                : due.status === 'Rejected'
                                ? 'bg-rose-200 text-rose-800'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {due.status === 'Payment Submitted — Awaiting Transaction Verification' ? 'Receipt Under Review' : due.status}
                          </span>
                        </div>

                        {/* If Rejected: Show admin comment */}
                        {due.status === 'Rejected' && due.admin_comment && (
                          <p className="mt-1.5 text-[11px] text-rose-700 bg-white/70 p-1.5 rounded-md border border-rose-200">
                            <strong>Note:</strong> {due.admin_comment}
                          </p>
                        )}

                        {/* If Receipt Submitted: Show reference number and view button */}
                        {due.status === 'Payment Submitted — Awaiting Transaction Verification' && (
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-indigo-100 text-[11px]">
                            <span className="text-indigo-700 font-mono">
                              Ref: {due.transaction_ref || 'N/A'}
                            </span>
                            <button
                              onClick={() => onViewReceipt(due)}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
                            >
                              View Receipt
                            </button>
                          </div>
                        )}

                        {/* Action Buttons for Unpaid or Rejected Dues */}
                        {(due.status === 'Unpaid' || due.status === 'Rejected') && (
                          <div className="mt-2.5 flex flex-col sm:flex-row flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                            <button
                              id={`btn-pay-due-${due.id}`}
                              onClick={() => onPayNow(due)}
                              className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Pending — Pay Now (SBI Collect)</span>
                            </button>
                            <button
                              id={`btn-upload-receipt-${due.id}`}
                              onClick={() => onUploadReceipt(due)}
                              className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px] sm:min-h-0"
                            >
                              <FileUp className="w-3.5 h-3.5 text-blue-600" />
                              <span>Upload Payment Receipt</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer status info */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Updated: {formatTimestamp(clearance?.last_updated || new Date().toISOString())}</span>
                {status === 'approved' && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Cleared</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
