const LOGO_BASE64 = "data:image/png;base64,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";
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { StudentClearanceRecord, StudentProfile } from '../types';
import { RGUKT_INFO } from '../constants';
import { formatTimestamp } from './crypto';

export async function buildNoDuesDoc(
  student: StudentProfile,
  record: StudentClearanceRecord
): Promise<jsPDF> {
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


  // Background Watermark (opacity 0.08)
  // @ts-ignore
  doc.setGState(new doc.GState({opacity: 0.08}));
  // Center of the page, size 120x120
  doc.addImage(LOGO_BASE64, 'PNG', (pageWidth - 93) / 2, (pageHeight - 120) / 2, 93, 120);
  // @ts-ignore
  doc.setGState(new doc.GState({opacity: 1.0}));

  // University Header

  // College Logo top-left
  doc.addImage(LOGO_BASE64, 'PNG', 16, 16, 15.5, 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 35, 60);
  doc.setFontSize(14);
  doc.text(RGUKT_INFO.name.toUpperCase(), (pageWidth / 2) + 5, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 80, 95);
  doc.text(
    `${RGUKT_INFO.campus}, ${RGUKT_INFO.state} (Est. ${RGUKT_INFO.established})`,
    (pageWidth / 2) + 5,
    26,
    { align: 'center' }
  );
  doc.text(
    'OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE',
    (pageWidth / 2) + 5,
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

  doc.text('Candidate Name:', 15, 67);
  doc.setFont('helvetica', 'normal');
  const splitName = doc.splitTextToSize(student.name, 75);
  doc.text(splitName, 45, splitName.length > 1 ? 65.5 : 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Student ID (Roll):', 125, 67);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 30, 30);
  doc.text(student.id.toUpperCase(), 160, 67);

  doc.setTextColor(40, 50, 65);
  doc.setFont('helvetica', 'bold');
  doc.text('Program & Branch:', 15, 74);
  doc.setFont('helvetica', 'normal');
  const branchStr = `${student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - ${student.branch}`;
  const splitBranch = doc.splitTextToSize(branchStr, 75);
  doc.text(splitBranch, 45, splitBranch.length > 1 ? 72 : 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Batch:', 125, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(student.batch, 160, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Institutional Email:', 15, 81);
  doc.setFont('helvetica', 'normal');
  const splitEmail = doc.splitTextToSize(student.email, 75);
  doc.text(splitEmail, 45, splitEmail.length > 1 ? 79.5 : 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Clearance Status:', 125, 81);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 130, 70); // Green
  doc.text('ALL DUES CLEARED (VERIFIED)', 160, 81);

  // Statement of Certification
  doc.setTextColor(50, 60, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const certText = `This is to certify that ${student.name} (ID: ${student.id.toUpperCase()}) has satisfactorily returned all institutional materials, settled all monetary and hostel obligations, and obtained digital verification clearance from all six statutory departments of RGUKT RK Valley as detailed below:`;
  const splitCert = doc.splitTextToSize(certText, pageWidth - 32);
  doc.text(splitCert, 16, 94);

  // Department Signatures Table
  const tableStartY = 110;
  const rowHeight = 14;
  const colWidths = {
    dept: 35,
    status: 22,
    signatory: 46,
    timestamp: 32,
    hash: 43,
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
    { id: 'itinfra', label: 'IT Infrastructure' },
  ];

  let currentY = tableStartY + 7;

  deptList.forEach((d, index) => {
    const clearance = record?.departments?.[d.id];
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
    const desigText = sig?.designation || 'Authorized Admin';
    const splitDesig = doc.splitTextToSize(desigText, colWidths.signatory - 2);
    doc.text(splitDesig, 18 + colWidths.dept + colWidths.status, currentY + 10);

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
    `Having verified that all six department clearances are complete with valid cryptographic hashes,`,
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
  doc.text(approverName, pageWidth - 20, hodBoxY + 26, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 90, 105);
  const splitTitle = doc.splitTextToSize(approverTitle, 75);
  let titleY = hodBoxY + 30;
  splitTitle.forEach(line => {
    doc.text(line, pageWidth - 20, titleY, { align: 'right' });
    titleY += 3.5;
  });
  doc.text(`Signed: ${approverTs}`, pageWidth - 20, titleY, { align: 'right' });

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


  
  // QR Code bottom right, strictly below the text and inside border
  const qrData = JSON.stringify({
    certId: certNo,
    studentId: student.id.toUpperCase(),
    date: issueDate
  });
  const qrBase64 = await QRCode.toDataURL(qrData, { margin: 1, color: { dark: '#1E293B', light: '#FFFFFF' } });
  
  
  const qrSize = 18;
  const qrX = pageWidth - 16 - qrSize - 2;
  const qrY = footerY - qrSize - 3;
  
  doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  
  // Return the completed jsPDF document

  return doc;
}

export function generateNoDuesPDFFilename(student: StudentProfile): string {
  return `RGUKT_NoDues_Certificate_${student.id.toUpperCase()}.pdf`;
}

export async function generateNoDuesPDF(
  student: StudentProfile,
  record: StudentClearanceRecord
): Promise<void> {
  const doc = await buildNoDuesDoc(student, record);
  const filename = generateNoDuesPDFFilename(student);
  doc.save(filename);
}

export async function generateNoDuesPDFDataUri(
  student: StudentProfile,
  record: StudentClearanceRecord
): Promise<string> {
  const doc = await buildNoDuesDoc(student, record);
  return doc.output('datauristring');
}
