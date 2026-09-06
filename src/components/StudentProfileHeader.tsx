import React from 'react';
import { Award, BookOpen, Calendar, CheckCircle2, Clock, FileCheck, Mail, Phone, ShieldCheck } from 'lucide-react';
import { StudentClearanceRecord, StudentProfile } from '../types';

interface StudentProfileHeaderProps {
  student: StudentProfile;
  clearanceRecord: StudentClearanceRecord;
  onViewCertificate?: () => void;
  onOpenMailbox?: () => void;
  unreadEmailCount?: number;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  clearanceRecord,
  onViewCertificate,
  onOpenMailbox,
  unreadEmailCount = 0,
}) => {
  const departments = ['library', 'hostel', 'lab', 'finance', 'sports'] as const;
  const approvedCount = departments.filter(
    (d) => clearanceRecord.departments[d]?.status === 'approved'
  ).length;
  const isAllDeptApproved = approvedCount === 5;
  const isFinalApproved = clearanceRecord.certificate_generated;
  const percentComplete = Math.round((approvedCount / 5) * 100);

  return (
    <div className="bento-card p-4 sm:p-6 mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
        {/* Left: Avatar & Bio */}
        <div className="flex flex-col xs:flex-row sm:flex-row items-start sm:items-center gap-3.5 sm:space-x-4">
          <div className="relative shrink-0">
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-3 ring-slate-100/90 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#075985] text-white flex items-center justify-center border-2 border-white text-[10px] shadow-2xs" title="Google Authenticated">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#075985] text-amber-300 shadow-2xs">
                {student.id.toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  student.studentType === 'puc'
                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'
                }`}
              >
                {student.studentType === 'puc' ? 'PUC' : 'B.Tech'} • {student.branch.split(' ')[0]}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-600 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.branch}</span>
              </span>
              <span className="text-slate-300 hidden xs:inline">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Batch {student.batch}</span>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-slate-500">
              {onOpenMailbox ? (
                <button
                  type="button"
                  id="btn-open-student-webmail"
                  onClick={onOpenMailbox}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs border border-blue-200 transition cursor-pointer group shadow-2xs"
                  title="Open Official RGUKT Clearance Webmail Inbox"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-mono truncate">{student.email}</span>
                  {unreadEmailCount > 0 ? (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {unreadEmailCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1 py-0.2 rounded font-semibold">
                      Inbox
                    </span>
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1 min-w-0">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{student.email}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clearance Progress Card Tile */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 min-w-0 sm:min-w-[240px] pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left md:text-right w-full sm:w-auto">
            <div className="flex items-center md:justify-end space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clearance Progress
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {approvedCount}/5 Depts
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1.5 border border-slate-200/50">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFinalApproved
                    ? 'bg-emerald-600'
                    : isAllDeptApproved
                    ? 'bg-amber-500'
                    : 'bg-[#075985]'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Certificate Action or Status Badge */}
          <div>
            {isFinalApproved ? (
              <button
                id="btn-view-certificate-header"
                onClick={onViewCertificate}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-100" />
                <span>Download No-Dues Certificate (PDF)</span>
              </button>
            ) : isAllDeptApproved ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Awaiting {student.studentType === 'puc' ? 'Dean' : 'HOD'} Final Sign-off</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Departments in Progress ({5 - approvedCount} remaining)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
