import React, { useState } from 'react';
import { useFirebaseData } from "../hooks/useFirebaseData";
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileUp,
  Info,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { CodeDue, InAppNotification, StudentClearanceRecord, StudentProfile, EmailNotification } from '../types';
import {
  submitDueReceipt,
  saveClearanceRecord,
  markNotificationRead,
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
  const { clearanceRecords, dues: allDues, notifications: allNotifs, emails: allEmails } = useFirebaseData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dues = allDues.filter((d) => d.student_id.toLowerCase() === student.id.toLowerCase());
  const clearanceRecord = clearanceRecords[student.id.toLowerCase()] || {
    student_id: student.id.toLowerCase(),
    departments: {
      library: { department: 'library', status: 'pending', last_updated: new Date().toISOString() },
      hostel: { department: 'hostel', status: 'pending', last_updated: new Date().toISOString() },
      lab: { department: 'lab', status: 'pending', last_updated: new Date().toISOString() },
      finance: { department: 'finance', status: 'pending', last_updated: new Date().toISOString() },
      sports: { department: 'sports', status: 'pending', last_updated: new Date().toISOString() }
    },
    certificate_generated: false
  };
  const notifications = allNotifs.filter((n) => n.recipient_id === student.id.toLowerCase() || n.recipient_type === 'broadcast');
  const studentEmails = allEmails.filter((e) => e.studentId.toLowerCase() === student.id.toLowerCase() || e.to.toLowerCase() === student.email.toLowerCase());

  // Modals state
  const [activeDueForPayment, setActiveDueForPayment] = useState<CodeDue | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalPayNowTriggered, setPaymentModalPayNowTriggered] = useState(false);
  
  const [activeDueForViewing, setActiveDueForViewing] = useState<CodeDue | null>(null);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);
  
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  const unreadEmailsCount = studentEmails.filter(e => !e.read).length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const handlePayDue = (due: CodeDue) => {
    setActiveDueForPayment(due);
    setPaymentModalPayNowTriggered(true);
    setIsPaymentModalOpen(true);
  };

  const handleUploadReceipt = (due: CodeDue) => {
    setActiveDueForPayment(due);
    setPaymentModalPayNowTriggered(false);
    setIsPaymentModalOpen(true);
  };

  const handleViewReceipt = (due: CodeDue) => {
    setActiveDueForViewing(due);
    setIsReceiptViewerOpen(true);
  };

  const handleSubmitReceipt = async (params: {
    dueId: string;
    receiptUrl: string;
    receiptFileName: string;
    transactionRef: string;
  }) => {
    setIsSubmitting(true);
    await submitDueReceipt({ dueId: params.dueId, receiptUrl: params.receiptUrl, receiptFileName: params.receiptFileName, transactionRef: params.transactionRef });
    setIsSubmitting(false);
    setIsPaymentModalOpen(false);
  };

  const handleGenerateCertificate = async () => {
    setIsSubmitting(true);
    const updated = { ...clearanceRecord, certificate_generated: true };
    await saveClearanceRecord(updated);
    setIsSubmitting(false);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b']
    });

    generateNoDuesPDF(student, updated);
  };

  const allCleared = Object.values(clearanceRecord?.departments || {}).every((d: any) => d.status === 'approved') && clearanceRecord?.hod_approval && clearanceRecord?.dean_approval !== false;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <StudentProfileHeader 
        student={student} 
        clearanceRecord={clearanceRecord}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Student Mailbox</h3>
            <p className="text-xs text-slate-500">Official clearance letters and automated notices</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMailboxOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <span>Open Mailbox</span>
          {unreadEmailsCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadEmailsCount}
            </span>
          )}
        </button>
      </div>

      <ClearanceTracker 
        clearanceRecord={clearanceRecord}
        dues={dues}
        onPayNow={handlePayDue}
        onUploadReceipt={handleUploadReceipt}
        onViewReceipt={handleViewReceipt}
      />

      {allCleared && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-3xl shadow-sm text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900">Digital No-Dues Certificate Ready</h3>
            <p className="text-sm text-emerald-700 mt-1 max-w-xl mx-auto">
              Congratulations! All department heads, and your HOD/Dean have digitally signed off your no-dues clearance. Your official RGUKT No-Dues Certificate is ready.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleGenerateCertificate}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <DuePaymentModal 
          isOpen={isPaymentModalOpen}
          due={activeDueForPayment}
          onClose={() => setIsPaymentModalOpen(false)}
          initialPayNowTriggered={paymentModalPayNowTriggered}
          onSubmitReceipt={handleSubmitReceipt}
        />
      )}

      {isReceiptViewerOpen && activeDueForViewing && (
        <ReceiptViewerModal
          isOpen={isReceiptViewerOpen}
          due={activeDueForViewing}
          student={student}
          onClose={() => setIsReceiptViewerOpen(false)}
        />
      )}

      {isCertificateModalOpen && (
        <CertificatePreviewModal 
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          student={student}
          record={clearanceRecord}
        />
      )}

      <StudentMailboxModal 
        isOpen={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        student={student}
      />
    </div>
  );
};
