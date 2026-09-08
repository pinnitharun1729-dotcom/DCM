import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Download, ExternalLink, FileText, X, XCircle } from 'lucide-react';
import { CodeDue, StudentProfile } from '../types';
import { formatTimestamp } from '../utils/crypto';
import { getReceiptFromStorage } from '../utils/receiptStorage';

interface ReceiptViewerModalProps {
  due: CodeDue | null;
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  canManage?: boolean; // if true, shows Verify & Approve and Reject buttons
  showVerificationStatus?: boolean; // visible to staff and admins
  onVerifyAndApprove?: (due: CodeDue) => void;
  onReject?: (due: CodeDue) => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  due,
  student,
  isOpen,
  onClose,
  canManage = false,
  showVerificationStatus = false,
  onVerifyAndApprove,
  onReject,
}) => {
  const [resolvedReceiptUrl, setResolvedReceiptUrl] = useState<string | null>(due?.receipt_url || null);

  useEffect(() => {
    let isMounted = true;
    if (due?.id) {
      // Retrieve original high-fidelity document from IndexedDB
      getReceiptFromStorage(due.id)
        .then((stored) => {
          if (isMounted && stored) {
            setResolvedReceiptUrl(stored);
          } else if (isMounted) {
            setResolvedReceiptUrl(due.receipt_url || null);
          }
        })
        .catch(() => {
          if (isMounted) setResolvedReceiptUrl(due.receipt_url || null);
        });
    } else {
      setResolvedReceiptUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [due?.id, due?.receipt_url]);

  if (!isOpen || !due) return null;

  const activeUrl = resolvedReceiptUrl || due.receipt_url;
  const isPdf =
    due.receipt_file_name?.toLowerCase().endsWith('.pdf') ||
    activeUrl?.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-receipt-viewer"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Payment Receipt Verification
            </h3>
            <p className="text-xs text-slate-500">
              Department: <span className="font-semibold text-slate-800 uppercase">{due.department}</span>
              {student ? ` • ${student.name} (${student.id.toUpperCase()})` : ` • ${due.student_id.toUpperCase()}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Transaction Verification Status Banner (Visible to Staff & Admins) */}
          {(canManage || showVerificationStatus) && due.verification_status && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                due.verification_status === 'Approved'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : due.verification_status === 'Denied'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {due.verification_status === 'Approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : due.verification_status === 'Denied' ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wide">
                    Transaction Verification: {due.verification_status === 'Approved' ? 'Verified by Finance' : due.verification_status === 'Denied' ? 'Payment Not Verified (Denied)' : 'Awaiting Finance Officer Review'}
                  </span>
                  {due.verification_timestamp && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(due.verification_timestamp)}
                    </span>
                  )}
                </div>
                {due.verification_officer && (
                  <p className="text-[11px] text-slate-700">
                    Finance Officer: <strong>{due.verification_officer}</strong>
                  </p>
                )}
                {due.verification_remarks && (
                  <p className="text-[11px] text-slate-600 mt-1 italic bg-white/70 p-2 rounded border border-slate-200/50">
                    Remarks: "{due.verification_remarks}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Due Reason</span>
              <span className="font-semibold text-slate-800 line-clamp-1">{due.reason}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Amount Paid</span>
              <span className="font-bold text-slate-900 text-sm">₹{due.amount}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">SBI Reference No</span>
              <span className="font-mono font-bold text-blue-700">{due.transaction_ref || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Uploaded At</span>
              <span className="text-slate-600">{formatTimestamp(due.updated_at)}</span>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-100/60 min-h-[260px] flex items-center justify-center">
            {activeUrl ? (
              isPdf ? (
                <div className="text-center p-8 space-y-3">
                  <div className="w-14 h-14 mx-auto bg-red-100 text-red-700 rounded-2xl flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {due.receipt_file_name || 'SBI_Payment_Receipt.pdf'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF Document • Cryptographically logged in RGUKT records
                    </p>
                  </div>
                  <a
                    href={activeUrl}
                    download={due.receipt_file_name || 'receipt.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / Open PDF</span>
                  </a>
                </div>
              ) : (
                <div className="w-full text-center">
                  <img
                    src={activeUrl}
                    alt="Receipt"
                    className="max-h-[380px] max-w-full rounded-lg object-contain mx-auto shadow-xs border border-slate-200"
                  />
                  <a
                    href={activeUrl}
                    download={due.receipt_file_name || 'receipt.png'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open full size image</span>
                  </a>
                </div>
              )
            ) : (
              <div className="text-center text-slate-400 text-xs">
                No receipt file uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors text-center cursor-pointer"
          >
            Close
          </button>

          {canManage && due.status === 'Payment Submitted — Awaiting Transaction Verification' && (
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-reject-receipt-action"
                type="button"
                onClick={() => {
                  onClose();
                  if (onReject) onReject(due);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Receipt</span>
              </button>

              <button
                id="btn-verify-approve-action"
                type="button"
                onClick={() => {
                  onClose();
                  if (onVerifyAndApprove) onVerifyAndApprove(due);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Approve Receipt</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
