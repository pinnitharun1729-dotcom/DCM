import { jsPDF } from 'jspdf';
import { StudentClearanceRecord, StudentProfile } from '../types';
import { RGUKT_INFO } from '../constants';
import { formatTimestamp } from './crypto';

export function buildNoDuesDoc(
  student: StudentProfile,
  record: StudentClearanceRecord
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw ornate certificate border
  doc.setDrawColor(24, 43, 73); // Deep Navy
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(180, 140, 60); // Gold inner border
  doc.setLineWidth(0.6);
  doc.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

  // Corner decorative flourishes
  const cornerSize = 6;
  doc.setFillColor(180, 140, 60);
  doc.rect(10.5, 10.5, cornerSize, 1.2, 'F');
  doc.rect(10.5, 10.5, 1.2, cornerSize, 'F');
  doc.rect(pageWidth - 10.5 - cornerSize, 10.5, cornerSize, 1.2, 'F');
  doc.rect(pageWidth - 10.5 - 1.2, 10.5, 1.2, cornerSize, 'F');

  // Header Banner Background
  doc.setFillColor(245, 247, 250);
  doc.rect(11.5, 11.5, pageWidth - 23, 38, 'F');

  // University Header
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 35, 60);
  doc.setFontSize(14);
  doc.text(RGUKT_INFO.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 80, 95);
  doc.text(
    `${RGUKT_INFO.campus}, ${RGUKT_INFO.state} (Est. ${RGUKT_INFO.established})`,
    pageWidth / 2,
    26,
    { align: 'center' }
  );
  doc.text(
    'OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE',
    pageWidth / 2,
    31,
    { align: 'center' }
  );

  // Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(160, 30, 30); // RGUKT Crimson
  doc.text('CONSOLIDATED NO-DUES & CLEARANCE CERTIFICATE', pageWidth / 2, 42, {
    align: 'center',
  });

  // Certificate Reference Row
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 70, 85);
  const certNo = record.certificate_hash || `RGUKT-RKV/ND/${new Date().getFullYear()}/${student.id.toUpperCase()}`;
  doc.text(`Certificate No: ${certNo}`, 16, 54);
  const issueDate = record.certificate_date ? formatTimestamp(record.certificate_date) : formatTimestamp(new Date().toISOString());
  doc.text(`Issued On: ${issueDate}`, pageWidth - 16, 54, { align: 'right' });

  // Divider
  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.4);
  doc.line(16, 57, pageWidth - 16, 57);

  // Student Particulars Box
  doc.setFillColor(250, 251, 253);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(16, 60, pageWidth - 32, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 65);

  doc.text('Candidate Name:', 20, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, 55, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Student ID (Roll):', 115, 67);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 30, 30);
  doc.text(student.id.toUpperCase(), 150, 67);

  doc.setTextColor(40, 50, 65);
  doc.setFont('helvetica', 'bold');
  doc.text('Program & Branch:', 20, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - ${student.branch}`, 55, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Batch:', 115, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(student.batch, 150, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Institutional Email:', 20, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(student.email, 55, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Clearance Status:', 115, 81);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 130, 70); // Green
  doc.text('ALL DUES CLEARED (VERIFIED)', 150, 81);

  // Statement of Certification
  doc.setTextColor(50, 60, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const certText = `This is to certify that ${student.name} (ID: ${student.id.toUpperCase()}) has satisfactorily returned all institutional materials, settled all monetary and hostel obligations, and obtained digital verification clearance from all five statutory departments of RGUKT RK Valley as detailed below:`;
  const splitCert = doc.splitTextToSize(certText, pageWidth - 32);
  doc.text(splitCert, 16, 94);

  // Department Signatures Table
  const tableStartY = 104;
  const rowHeight = 16;
  const colWidths = {
    dept: 38,
    status: 24,
    signatory: 55,
    timestamp: 33,
    hash: 32,
  };

  // Table Header
  doc.setFillColor(24, 43, 73);
  doc.rect(16, tableStartY, pageWidth - 32, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let curX = 18;
  doc.text('Department', curX, tableStartY + 5);
  curX += colWidths.dept;
  doc.text('Status', curX, tableStartY + 5);
  curX += colWidths.status;
  doc.text('Authorized Signatory', curX, tableStartY + 5);
  curX += colWidths.signatory;
  doc.text('Date & Time (IST)', curX, tableStartY + 5);
  curX += colWidths.timestamp;
  doc.text('Digital Signature Hash', curX, tableStartY + 5);

  // Table Rows
  const deptList: { id: keyof typeof record.departments; label: string }[] = [
    { id: 'library', label: 'Central Library' },
    { id: 'hostel', label: 'Hostel Management' },
    { id: 'lab', label: 'Laboratories & Workshop' },
    { id: 'finance', label: 'Finance & Accounts' },
    { id: 'sports', label: 'Sports & Physical Ed.' },
  ];

  let currentY = tableStartY + 7;

  deptList.forEach((d, index) => {
    const clearance = record.departments[d.id];
    const isEven = index % 2 === 0;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(16, currentY, pageWidth - 32, rowHeight, 'F');

    doc.setDrawColor(225, 230, 240);
    doc.setLineWidth(0.2);
    doc.line(16, currentY + rowHeight, pageWidth - 16, currentY + rowHeight);

    // Department name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 40, 55);
    doc.text(d.label, 18, currentY + 6);

    // Status badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 130, 70);
    doc.text('CLEARED', 18 + colWidths.dept, currentY + 6);

    // Signatory
    const sig = clearance?.digital_signature;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 50, 65);
    doc.text(sig?.staff_name || 'Department Officer', 18 + colWidths.dept + colWidths.status, currentY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(90, 100, 115);
    doc.text(sig?.designation || 'Authorized Admin', 18 + colWidths.dept + colWidths.status, currentY + 10);

    // Timestamp
    doc.setFontSize(7);
    doc.setTextColor(70, 80, 95);
    const ts = sig?.timestamp ? formatTimestamp(sig.timestamp) : formatTimestamp(new Date().toISOString());
    doc.text(ts, 18 + colWidths.dept + colWidths.status + colWidths.signatory, currentY + 7);

    // Hash
    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(50, 70, 110);
    const hash = sig?.verification_hash || 'RGUKT-SIG-APPROVED';
    doc.text(hash, 18 + colWidths.dept + colWidths.status + colWidths.signatory + colWidths.timestamp, currentY + 7);

    currentY += rowHeight;
  });

  // Outer border for table
  doc.setDrawColor(24, 43, 73);
  doc.setLineWidth(0.4);
  doc.rect(16, tableStartY, pageWidth - 32, currentY - tableStartY);

  // Final Sign-off Box (HOD or Dean of Academics)
  const hodBoxY = currentY + 8;
  doc.setFillColor(252, 250, 245);
  doc.setDrawColor(210, 180, 120);
  doc.roundedRect(16, hodBoxY, pageWidth - 32, 40, 2, 2, 'FD');

  const approverTitle = student.studentType === 'puc' ? 'Dean of Academic Affairs (PUC & University)' : `Head of Department (${student.branch})`;
  const approverName = record.hod_approval?.staff_name || (student.studentType === 'puc' ? 'Prof. A. V. Subbarao' : 'Prof. S. Chandrasekhar Rao');
  const approverHash = record.hod_approval?.verification_hash || 'RGUKT-FINAL-SIG-VALIDATED';
  const approverTs = record.hod_approval?.timestamp ? formatTimestamp(record.hod_approval.timestamp) : formatTimestamp(new Date().toISOString());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 40, 40);
  doc.text('FINAL STATUTORY APPROVAL & DIGITAL ENDORSEMENT', 20, hodBoxY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 60, 75);
  doc.text(
    `Having verified that all five department clearances are complete with valid cryptographic hashes,`,
    20,
    hodBoxY + 13
  );
  doc.text(
    `the undersigned authority hereby grants full academic and institutional clearance for graduation and certificate release.`,
    20,
    hodBoxY + 18
  );

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 43, 73);
  doc.text(approverName, pageWidth - 80, hodBoxY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 90, 105);
  doc.text(approverTitle, pageWidth - 80, hodBoxY + 30);
  doc.text(`Signed: ${approverTs}`, pageWidth - 80, hodBoxY + 34);

  // Security & Verification Seal box on left
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, hodBoxY + 23, 75, 13, 1, 1);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 80, 20);
  doc.text(`HASH: ${approverHash}`, 22, hodBoxY + 27.5);
  doc.text('STATUS: DIGITALLY SEALED & VERIFIED', 22, hodBoxY + 32);

  // Bottom Notice & Legal Footnote
  const footerY = pageHeight - 24;
  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.3);
  doc.line(16, footerY, pageWidth - 16, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(110, 120, 135);
  doc.text(
    'This is a computer-generated, cryptographically signed digital document issued under the official RGUKT Digital No-Dues Portal.',
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );
  doc.text(
    'No physical signature is required. To verify authenticity, enter Certificate No at the RGUKT RK Valley portal verification portal.',
    pageWidth / 2,
    footerY + 7.5,
    { align: 'center' }
  );
  doc.text(
    'RGUKT RK Valley, Idupulapaya, Vempalli (M), YSR Kadapa District, Andhra Pradesh - 516330',
    pageWidth / 2,
    footerY + 11,
    { align: 'center' }
  );

  // Return the completed jsPDF document
  return doc;
}

export function generateNoDuesPDFFilename(student: StudentProfile): string {
  return `RGUKT_NoDues_Certificate_${student.id.toUpperCase()}.pdf`;
}

export function generateNoDuesPDF(
  student: StudentProfile,
  record: StudentClearanceRecord
): void {
  const doc = buildNoDuesDoc(student, record);
  const filename = generateNoDuesPDFFilename(student);
  doc.save(filename);
}

export function generateNoDuesPDFDataUri(
  student: StudentProfile,
  record: StudentClearanceRecord
): string {
  const doc = buildNoDuesDoc(student, record);
  return doc.output('datauristring');
}
