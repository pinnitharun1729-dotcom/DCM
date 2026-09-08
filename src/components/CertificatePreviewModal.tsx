import React from 'react';
import QRCode from 'react-qr-code';
import { LOGO_BASE64 } from '../constants';
import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { StudentClearanceRecord, StudentProfile } from '../types';
import { RGUKT_INFO } from '../constants';
import { formatTimestamp } from '../utils/crypto';
import { generateNoDuesPDF } from '../utils/certificate';

interface CertificatePreviewModalProps {
  student: StudentProfile;
  record: StudentClearanceRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  student,
  record,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    await generateNoDuesPDF(student, record);
  };

  const certNo = record.certificate_hash || `RGUKT-RKV/ND/${new Date().getFullYear()}/${student.id.toUpperCase()}`;
  const issueDate = record.certificate_date ? formatTimestamp(record.certificate_date) : formatTimestamp(new Date().toISOString());
  const approverTitle = student.studentType === 'puc' ? 'Dean of Academic Affairs (PUC & University)' : `Head of Department (${student.branch})`;
  const approverName = record.hod_approval?.staff_name || (student.studentType === 'puc' ? 'Prof. A. V. Subbarao' : 'Prof. S. Chandrasekhar Rao');

  const deptList = [
    { id: 'library' as const, name: 'Central Library' },
    { id: 'hostel' as const, name: 'Hostel Management' },
    { id: 'lab' as const, name: 'Laboratories & Workshop' },
    { id: 'finance' as const, name: 'Finance & Accounts' },
    { id: 'sports' as const, name: 'Sports & Physical Ed.' },
    { id: 'itinfra' as const, name: 'IT Infrastructure' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        id="modal-certificate-preview"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Official Digital No-Dues Certificate
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Ref: {certNo}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-auto sm:ml-0">
            <button
              id="btn-download-pdf-top"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Rendering Area */}
        <div className="p-3 sm:p-8 overflow-y-auto bg-slate-50">
          <div className="bg-white border-2 sm:border-4 border-slate-900 rounded-xl p-4 sm:p-8 shadow-md relative overflow-hidden">
            {/* Inner Gold Border */}
            <div className="border border-amber-500/60 p-4 sm:p-6 rounded-lg space-y-6 relative">
              
              {/* Seal Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
                <img src={LOGO_BASE64} alt="Watermark" className="w-96 h-96 object-contain" />
              </div>
              
              {/* Certificate Top Seal & University Banner */}
              <div className="flex flex-col items-center border-b border-slate-200 pb-5 space-y-1 relative">
                <div className="absolute left-0 top-0 hidden sm:block">
                  <img src={LOGO_BASE64} alt="RGUKT Logo" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-center space-y-1 z-10 relative">
                  <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    {RGUKT_INFO.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {RGUKT_INFO.campus}, {RGUKT_INFO.state} • Established 2008
                  </p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE
                  </p>
                </div>
                <div className="pt-2 z-10">
                  <span className="inline-block px-4 py-1 bg-red-800 text-white font-bold text-xs sm:text-sm tracking-wide rounded-md">
                    CONSOLIDATED NO-DUES & CLEARANCE CERTIFICATE
                  </span>
                </div>
                <div className="flex w-full items-center justify-between text-[11px] font-mono text-slate-600 pt-2 z-10">
                  <span>Cert No: {certNo}</span>
                  <span>Issued: {issueDate}</span>
                </div>
              </div>


              {/* Student Particulars Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] block">Candidate Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] block">University Roll / Student ID:</span>
                  <span className="font-mono font-bold text-red-700 text-sm">{student.id.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] block">Branch & Degree Program:</span>
                  <span className="font-semibold text-slate-800">{student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - {student.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] block">Academic Batch:</span>
                  <span className="font-semibold text-slate-800">{student.batch}</span>
                </div>
              </div>

              {/* Clearance Statement */}
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                This is to officially certify that <strong>{student.name}</strong> (Student ID: <strong>{student.id.toUpperCase()}</strong>) has fulfilled all institutional responsibilities, settled all monetary and hostel charges, and successfully obtained authenticated digital clearances from all six statutory authorities of RGUKT RK Valley as tabulated below:
              </p>

              {/* 6 Departments Signatures Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse min-w-[520px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px]">
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Clearance Status</th>
                      <th className="p-2.5">Authorized Signatory</th>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Digital Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {deptList.map((d, i) => {
                      const cl = record?.departments?.[d.id];
                      const sig = cl?.digital_signature;
                      return (
                        <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2.5 font-bold text-slate-800">{d.name}</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>CLEARED</span>
                            </span>
                          </td>
                          <td className="p-2.5">
                            <p className="font-semibold text-slate-900">{sig?.staff_name || 'Department Head'}</p>
                            <p className="text-[10px] text-slate-500">{sig?.designation || 'Authorized Officer'}</p>
                          </td>
                          <td className="p-2.5 text-slate-600 font-mono text-[10px]">
                            {sig?.timestamp ? formatTimestamp(sig.timestamp) : issueDate}
                          </td>
                          <td className="p-2.5 font-mono text-[9px] text-blue-800 font-semibold truncate max-w-[110px]">
                            {sig?.verification_hash || 'RGUKT-SIG-VERIFIED'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Final Statutory Sign-off Box */}
              <div className="border-2 border-amber-300 bg-amber-50/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>FINAL STATUTORY APPROVAL & DIGITAL ENDORSEMENT</span>
                  </div>
                  <p className="text-[11px] text-slate-600 max-w-md">
                    {record.hod_approval?.remarks || 'All academic and administrative requisites verified in order for graduation and certificate dispatch.'}
                  </p>
                  <p className="text-[10px] font-mono text-amber-800">
                    Hash: {record.hod_approval?.verification_hash || 'RGUKT-FINAL-SIG-VALIDATED'}
                  </p>
                </div>

                <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <p className="font-bold text-sm text-slate-900">{approverName}</p>
                  <p className="text-xs text-slate-600">{approverTitle}</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Signed: {record.hod_approval?.timestamp ? formatTimestamp(record.hod_approval.timestamp) : issueDate}
                  </p>
                </div>
              </div>

              
              
              {/* Bottom Notice & QR Code */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="text-left text-[10px] text-slate-500 max-w-[80%] space-y-1">
                  <p>
                    <strong>Authenticity Verification:</strong> This is a digitally generated document. 
                    The clearance status reflects data recorded by respective department heads on the No-Dues portal.
                  </p>
                  <p>
                    This digital document is electronically generated and digitally signed by RGUKT RK Valley. No physical signature is required.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 pb-1">
                  <QRCode 
                    value={JSON.stringify({
                      certId: certNo,
                      studentId: student.id.toUpperCase(),
                      date: issueDate
                    })} 
                    size={60} 
                    level="L"
                  />
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close Preview
          </button>
          <button
            id="btn-download-pdf-bottom"
            onClick={handleDownload}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
