import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileCheck,
  FileUp,
  Info,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { CodeDue, InAppNotification, StudentClearanceRecord, StudentProfile, EmailNotification } from '../types';
import {
  getClearanceRecord,
  getDues,
  submitDueReceipt,
  saveClearanceRecord,
  getNotifications,
  markNotificationRead,
  getStudentEmails,
} from '../utils/storage';
import { StudentProfileHeader } from '../components/StudentProfileHeader';
import { ClearanceTracker } from '../components/ClearanceTracker';
import { DuePaymentModal } from '../components/DuePaymentModal';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';
import { StudentMailboxModal } from '../components/StudentMailboxModal';
import { SBI_COLLECT_URL } from '../constants';
import { generateNoDuesPDF } from '../utils/certificate';

interface StudentDashboardProps {
  student: StudentProfile;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student }) => {
  const [clearanceRecord, setClearanceRecord] = useState<StudentClearanceRecord>(() =>
    getClearanceRecord(student.id)
  );
  const [dues, setDues] = useState<CodeDue[]>(() => getDues(student.id));

  // Modals state
  const [activeDueForPayment, setActiveDueForPayment] = useState<CodeDue | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalPayNowTriggered, setPaymentModalPayNowTriggered] = useState(false);

  const [activeDueForViewing, setActiveDueForViewing] = useState<CodeDue | null>(null);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);

  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [onScreenSbiNote, setOnScreenSbiNote] = useState<string | null>(null);

  // Student specific + broadcast notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>(() =>
    getNotifications('student', student.id)
  );
  const [studentEmails, setStudentEmails] = useState<EmailNotification[]>(() =>
    getStudentEmails(student.email)
  );

  // Refresh helper
  const reloadData = () => {
    setClearanceRecord(getClearanceRecord(student.id));
    setDues(getDues(student.id));
    setNotifications(getNotifications('student', student.id));
    setStudentEmails(getStudentEmails(student.email));
  };

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getNotifications('student', student.id));
    };
    const handleEmailUpdate = () => {
      setStudentEmails(getStudentEmails(student.email));
    };
    window.addEventListener('rgukt_notification_updated', handleNotifUpdate);
    window.addEventListener('rgukt_emails_updated', handleEmailUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('rgukt_notification_updated', handleNotifUpdate);
      window.removeEventListener('rgukt_emails_updated', handleEmailUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, [student.id, student.email]);

  useEffect(() => {
    reloadData();
    // Fire celebratory confetti if certificate is issued!
    if (clearanceRecord.certificate_generated) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [student.id]);

  // When student clicks "Pending - Pay Now": open SBI Collect and show on-screen note
  const handlePayNow = (due: CodeDue) => {
    window.open(SBI_COLLECT_URL, '_blank', 'noopener,noreferrer');
    setOnScreenSbiNote(
      'After completing payment on SBI Collect, note your reference number and upload the receipt below.'
    );
    setActiveDueForPayment(due);
    setPaymentModalPayNowTriggered(true);
    setIsPaymentModalOpen(true);
  };

  const handleOpenUploadReceiptModal = (due: CodeDue) => {
    setActiveDueForPayment(due);
    setPaymentModalPayNowTriggered(false);
    setIsPaymentModalOpen(true);
  };

  const handleViewReceipt = (due: CodeDue) => {
    setActiveDueForViewing(due);
    setIsReceiptViewerOpen(true);
  };

  const handleSubmitReceipt = (params: {
    dueId: string;
    receiptUrl: string;
    receiptFileName: string;
    transactionRef: string;
  }) => {
    submitDueReceipt(params);
    reloadData();
    setOnScreenSbiNote(
      'Receipt successfully submitted! Department administrator has been notified for verification.'
    );
    setTimeout(() => setOnScreenSbiNote(null), 8000);
  };

  const departments = ['library', 'hostel', 'lab', 'finance', 'sports'] as const;
  const approvedCount = departments.filter(
    (d) => clearanceRecord.departments[d]?.status === 'approved'
  ).length;
  const isAllDeptApproved = approvedCount === 5;
  const isCertificateReady = clearanceRecord.certificate_generated;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* On-Screen SBI Banner Note (Prompt Requirement) */}
      {onScreenSbiNote && (
        <div
          id="student-onscreen-sbi-banner"
          className="bento-card p-4 bg-sky-50 border-sky-200 text-sky-950 flex items-start justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#075985] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">SBI Collect Payment Instruction:</p>
              <p className="mt-0.5">{onScreenSbiNote}</p>
            </div>
          </div>
          <button
            onClick={() => setOnScreenSbiNote(null)}
            className="text-xs text-[#075985] hover:text-sky-900 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Profile */}
      <StudentProfileHeader
        student={student}
        clearanceRecord={clearanceRecord}
        onViewCertificate={() => setIsCertificateModalOpen(true)}
        onOpenMailbox={() => setIsMailboxOpen(true)}
        unreadEmailCount={studentEmails.filter((e) => !e.read).length}
      />

      {/* Official Automated Emails Ribbon */}
      <div className="bento-card p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-blue-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Official Department Clearance Emails
              </h3>
              {studentEmails.some((e) => !e.read) && (
                <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {studentEmails.filter((e) => !e.read).length} New
                </span>
              )}
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Automated notifications sent from each department's official address to <span className="font-mono text-white font-semibold">{student.email}</span>
            </p>
          </div>
        </div>
        <button
          id="btn-open-webmail-inbox"
          onClick={() => setIsMailboxOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>Open Webmail Inbox ({studentEmails.length})</span>
        </button>
      </div>

      {/* Notifications & Advisories Board */}
      {notifications.length > 0 && (
        <div className="bento-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Active Notifications & Advisories
                </h3>
                <p className="text-[11px] text-slate-500">
                  Institutional announcements and clearance progress updates
                </p>
              </div>
            </div>
            {notifications.some((n) => !n.read) && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full animate-pulse">
                {notifications.filter((n) => !n.read).length} New
              </span>
            )}
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {notifications.slice(0, 3).map((notif) => (
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
                    <Info className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Auto-forward & Status Alert Ribbon */}
      {isCertificateReady ? (
        <div className="bento-card p-4 sm:p-5 bg-linear-to-r from-emerald-600 via-teal-700 to-[#075985] text-white border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                All Clearances Completed & Certificate Released!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Final approval granted by{' '}
                <span className="font-semibold text-white">{clearanceRecord.hod_approval?.staff_name || 'Academic Authority'}</span>. Official PDF soft-copy delivered to your registered email (<span className="font-mono text-white">{student.email}</span>).
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              id="btn-open-cert-email-banner"
              onClick={() => setIsMailboxOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl border border-emerald-400/40 shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>View in Webmail</span>
            </button>
            <button
              id="btn-preview-cert-banner"
              onClick={() => setIsCertificateModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              View Certificate
            </button>
            <button
              id="btn-download-cert-banner"
              onClick={() => generateNoDuesPDF(student, clearanceRecord)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      ) : isAllDeptApproved ? (
        <div className="bento-card p-4 sm:p-5 bg-amber-500 text-slate-950 border-amber-600/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Auto-Forwarded to{' '}
                {student.studentType === 'puc' ? 'Dean of Academics' : 'Head of Department (HOD)'}
              </h3>
              <p className="text-xs text-slate-900">
                All 5 university departments have digitally approved your clearance. Awaiting final
                statutory sign-off before your certificate is generated.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-black/20 font-mono text-xs font-bold rounded-lg shrink-0">
            Stage 2: Final Endorsement
          </span>
        </div>
      ) : null}

      {/* Main Department Clearance Tracker */}
      <ClearanceTracker
        clearanceRecord={clearanceRecord}
        dues={dues}
        onPayNow={handlePayNow}
        onUploadReceipt={handleOpenUploadReceiptModal}
        onViewReceipt={handleViewReceipt}
      />

      {/* Payment & Receipt Upload Modal */}
      <DuePaymentModal
        due={activeDueForPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActiveDueForPayment(null);
        }}
        onSubmitReceipt={handleSubmitReceipt}
        initialPayNowTriggered={paymentModalPayNowTriggered}
      />

      {/* Receipt Viewer Modal */}
      <ReceiptViewerModal
        due={activeDueForViewing}
        student={student}
        isOpen={isReceiptViewerOpen}
        onClose={() => {
          setIsReceiptViewerOpen(false);
          setActiveDueForViewing(null);
        }}
      />

      {/* Certificate Viewer Modal */}
      <CertificatePreviewModal
        student={student}
        record={clearanceRecord}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />

      {/* Student Webmail Modal */}
      <StudentMailboxModal
        student={student}
        isOpen={isMailboxOpen}
        onClose={() => {
          setIsMailboxOpen(false);
          reloadData();
        }}
      />
    </div>
  );
};
