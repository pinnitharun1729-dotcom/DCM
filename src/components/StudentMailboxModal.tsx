import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  User,
  Building2,
  CheckCheck,
  ShieldCheck,
  Paperclip,
  ExternalLink,
  Search,
} from 'lucide-react';
import { EmailNotification, StudentProfile, StudentClearanceRecord } from '../types';
import { getStudentEmails, markEmailAsRead, markAllStudentEmailsAsRead, getClearanceRecord } from '../utils/storage';
import { generateNoDuesPDF } from '../utils/certificate';

interface StudentMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const StudentMailboxModal: React.FC<StudentMailboxModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'denied' | 'certificate_issued'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEmails = async () => {
    const list = await getStudentEmails(student.email);
    setEmails(list);
    if (list.length > 0 && !selectedEmail) {
      setSelectedEmail(list[0]);
    } else if (selectedEmail) {
      const refreshed = list.find((e) => e.id === selectedEmail.id);
      if (refreshed) setSelectedEmail(refreshed);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen, student.email]);

  // Listen for real-time dispatched emails
  useEffect(() => {
    const handleEmailEvent = () => {
      loadEmails();
    };
    window.addEventListener('rgukt_emails_updated', handleEmailEvent);
    return () => {
      window.removeEventListener('rgukt_emails_updated', handleEmailEvent);
    };
  }, [student.email]);

  if (!isOpen) return null;

  const handleSelectEmail = (email: EmailNotification) => {
    setSelectedEmail(email);
    if (!email.read) {
      markEmailAsRead(email.id);
      loadEmails();
    }
  };

  const handleMarkAllRead = () => {
    markAllStudentEmailsAsRead(student.email);
    loadEmails();
  };

  const handleDownloadAttachment = async (email: EmailNotification) => {
    if (email.attachments && email.attachments.length > 0 && email.attachments[0].dataUrl) {
      // Direct base64 download
      const link = document.createElement('a');
      link.href = email.attachments[0].dataUrl;
      link.download = email.attachments[0].filename || `RGUKT_NoDues_Certificate_${student.id.toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback generate from record
      const rec = await getClearanceRecord(student.id);
      generateNoDuesPDF(student, rec);
    }
  };

  const unreadCount = emails.filter((e) => !e.read).length;

  const filteredEmails = emails.filter((e) => {
    const matchesFilter = filter === 'all' || e.actionType === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.subject.toLowerCase().includes(q) ||
      e.from.toLowerCase().includes(q) ||
      e.fromName.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const getDepartmentBadge = (deptId: string) => {
    switch (deptId) {
      case 'library':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hostel':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'lab':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'finance':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sports':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'hod':
      case 'dean':
      case 'director':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div
      id="modal-student-mailbox"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white w-full max-w-5xl h-[90vh] max-h-[720px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top University Webmail Ribbon */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  RGUKT Student Webmail
                </h2>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Official Inbox
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer border border-slate-700"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Close webmail modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto text-xs py-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All Emails ({emails.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Approvals ({emails.filter((e) => e.actionType === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('denied')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filter === 'denied'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Action Required ({emails.filter((e) => e.actionType === 'denied').length})
            </button>
            <button
              onClick={() => setFilter('certificate_issued')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filter === 'certificate_issued'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Certificates ({emails.filter((e) => e.actionType === 'certificate_issued').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clearance emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Content Split Pane: Email List on Left, Email Viewer on Right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Email List Column */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col overflow-y-auto bg-white ${
              selectedEmail ? 'hidden md:flex' : 'flex'
            }`}
          >
            {filteredEmails.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Mail className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No clearance emails found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Whenever any university department approves or denies your clearance, official emails from that department will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const isApproved = email.status === 'Approved';
                  const isCert = email.actionType === 'certificate_issued';

                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-3.5 transition-colors cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-blue-600'
                          : email.read
                          ? 'hover:bg-slate-50'
                          : 'bg-amber-50/30 hover:bg-amber-50/60 font-semibold'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDepartmentBadge(
                              email.departmentId
                            )}`}
                          >
                            {email.departmentName.split('–')[0].trim()}
                          </span>
                          {!email.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                          {new Date(email.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 mt-1.5 truncate">
                        {email.fromName}
                      </p>
                      <p className="text-xs text-slate-700 truncate font-medium mt-0.5">
                        {email.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {email.body.replace(/\n+/g, ' ')}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[11px]">
                        <span className="font-mono text-slate-500 text-[10px] truncate max-w-[170px]">
                          {email.from}
                        </span>
                        {email.attachments && email.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            <Paperclip className="w-3 h-3" />
                            <span>PDF Attached</span>
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-semibold ${
                              isApproved
                                ? 'text-emerald-700'
                                : isCert
                                ? 'text-purple-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {email.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email View Column */}
          <div
            className={`flex-1 flex flex-col bg-white overflow-y-auto ${
              selectedEmail ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedEmail ? (
              <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full flex flex-col">
                {/* Mobile Back Button to list */}
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="md:hidden inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mb-3 cursor-pointer self-start"
                >
                  ← Back to Email List
                </button>

                {/* Email Header Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDepartmentBadge(
                            selectedEmail.departmentId
                          )}`}
                        >
                          {selectedEmail.departmentName}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            selectedEmail.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : selectedEmail.status === 'Issued'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          Status: {selectedEmail.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1 leading-snug">
                        {selectedEmail.subject}
                      </h3>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <p className="font-medium text-slate-700">
                        {new Date(selectedEmail.timestamp).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(selectedEmail.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Sender & Recipient Metadata */}
                  <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium">FROM:</span>
                      <p className="font-bold text-slate-800">
                        {selectedEmail.fromName}
                      </p>
                      <p className="font-mono text-blue-700 font-semibold text-[11px]">
                        {selectedEmail.from}
                      </p>
                      {selectedEmail.officerName && (
                        <p className="text-slate-500 text-[11px]">
                          Official: {selectedEmail.officerName}{' '}
                          {selectedEmail.designation && `(${selectedEmail.designation})`}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium">TO:</span>
                      <p className="font-bold text-slate-800">
                        {selectedEmail.recipientName} ({student.rollNumber || student.id.toUpperCase()})
                      </p>
                      <p className="font-mono text-slate-600 text-[11px]">
                        {selectedEmail.to}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Branch: {student.branch}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="mt-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800">
                    {selectedEmail.body}
                  </div>

                  {/* Reason / Remarks Callout if Denied */}
                  {selectedEmail.actionType === 'denied' && selectedEmail.reasonOrRemarks && (
                    <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                          Official Department Reason / Remarks
                        </h4>
                        <p className="text-xs text-rose-800 mt-1 font-medium">
                          {selectedEmail.reasonOrRemarks}
                        </p>
                        {selectedEmail.pendingDueAmount ? (
                          <p className="text-xs font-bold text-rose-950 mt-1.5">
                            Assessed Outstanding Due: ₹{selectedEmail.pendingDueAmount}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Attachment Card if Final Certificate Issued */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-bold text-purple-950">
                              {selectedEmail.attachments[0].filename}
                            </h4>
                            <span className="text-[10px] font-bold uppercase bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">
                              PDF Soft-Copy
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 mt-0.5">
                            Official Consolidated No-Dues Clearance Certificate
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadAttachment(selectedEmail)}
                        className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Certificate (PDF)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] text-slate-500">
                  <p className="flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Official automated notification dispatched by RGUKT RK Valley Clearance Portal to registered student email.
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Mail className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">Select an email to view</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  View department status notifications, official remarks, fee settlements, and your attached final clearance certificate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
