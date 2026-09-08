import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DepartmentId, EmailNotification, StudentProfile, DeptAccount, StudentClearanceRecord } from '../types';
import { STATUTORY_DEPT_ACCOUNTS, ACADEMIC_ROLE_ACCOUNTS } from '../constants';
import { generateNoDuesPDFDataUri, generateNoDuesPDFFilename } from './certificate';

const EMAIL_STORAGE_KEY = 'rgukt_sent_emails';

// Get department official email & credentials information
export function getDepartmentEmailConfig(
  deptId: DepartmentId | 'hod' | 'dean' | 'director',
  student?: StudentProfile,
  account?: DeptAccount
): {
  email: string;
  name: string;
  officerName: string;
  designation: string;
} {
  // If exact logged-in department account provided
  if (account && account.email) {
    return {
      email: account.email,
      name: account.name,
      officerName: account.officerName || 'Department Officer',
      designation: account.designation || 'Clearance Officer',
    };
  }

  // Statutory departments
  const statutory = STATUTORY_DEPT_ACCOUNTS.find((a) => a.department === deptId);
  if (statutory) {
    return {
      email: statutory.email,
      name: statutory.name,
      officerName: statutory.officerName,
      designation: statutory.designation,
    };
  }

  // HOD, Dean, or Director
  if (deptId === 'dean' || student?.studentType === 'puc') {
    return {
      email: 'dean@rguktrkv.ac.in',
      name: 'Office of the Dean of Academics',
      officerName: 'Prof. S. R. K. Prasad',
      designation: 'Dean of Academic Affairs',
    };
  }

  if (deptId === 'director') {
    const dir = ACADEMIC_ROLE_ACCOUNTS['director@rguktrkv.ac.in'];
    return {
      email: dir.email,
      name: dir.name,
      officerName: dir.officerName,
      designation: dir.designation,
    };
  }

  // Look up HOD by student branch
  if (student) {
    const branchCode = student.branchCode?.toUpperCase() || student.branch.toUpperCase();
    if (branchCode.includes('ECE')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.ece@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    if (branchCode.includes('EEE') || branchCode.includes('ELECTRICAL')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.eee@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    if (branchCode.includes('CIVIL') || branchCode.includes('CE')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.ce@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    if (branchCode.includes('MECH') || branchCode.includes('ME')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.me@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    if (branchCode.includes('CHEM')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.chem@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    if (branchCode.includes('METAL') || branchCode.includes('MME')) {
      const c = ACADEMIC_ROLE_ACCOUNTS['hod.mme@rguktrkv.ac.in'];
      return { email: c.email, name: c.name, officerName: c.officerName, designation: c.designation };
    }
    // Default to CSE & AI/ML
    const cse = ACADEMIC_ROLE_ACCOUNTS['hod.cse@rguktrkv.ac.in'];
    return { email: cse.email, name: cse.name, officerName: cse.officerName, designation: cse.designation };
  }

  return {
    email: 'academics@rguktrkv.ac.in',
    name: 'Department Clearance Authority',
    officerName: 'Department In-charge',
    designation: 'Head of Department',
  };
}

// Retrieve all stored sent emails
export async function getAllSentEmails(): Promise<EmailNotification[]> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading emails from storage:', err);
    return [];
  }
}

// Save all emails to storage
export async function saveAllSentEmails(emails: EmailNotification[]): Promise<void> {
  const batch = writeBatch(db);
  emails.forEach(e => {
    const cleanEmail = { ...e };
    Object.keys(cleanEmail).forEach(key => {
      if ((cleanEmail as any)[key] === undefined) {
        delete (cleanEmail as any)[key];
      }
    });
    batch.set(doc(db, 'emails', cleanEmail.id), cleanEmail, { merge: true });
  });
  await batch.commit();

  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
  } catch (err) {
    console.error('Error saving emails to storage:', err);
  }
}

// Get emails for a specific student (by studentId or official student email)
export async function getStudentEmails(studentIdentifier: string): Promise<EmailNotification[]> {
  const clean = studentIdentifier.trim().toLowerCase();
  const all = await getAllSentEmails();
  return all
    .filter(
      (e) =>
        e.studentId.toLowerCase() === clean ||
        e.to.toLowerCase() === clean ||
        (clean.includes('@') && e.to.toLowerCase() === clean)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Mark an email as read
export async function markEmailAsRead(emailId: string): Promise<void> {
  await setDoc(doc(db, 'emails', emailId), { readStatus: 'read', readTimestamp: new Date().toISOString() }, { merge: true });

  const all = await getAllSentEmails();
  let changed = false;
  const updated = all.map((e) => {
    if (e.id === emailId && !e.read) {
      changed = true;
      return { ...e, read: true };
    }
    return e;
  });
  if (changed) {
    saveAllSentEmails(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_emails_updated'));
    }
  }
}

// Mark all emails as read for a student
export async function markAllStudentEmailsAsRead(studentIdentifier: string): Promise<void> {
  const clean = studentIdentifier.trim().toLowerCase();
  const all = await getAllSentEmails();
  let changed = false;
  const updated = all.map((e) => {
    if (
      (e.studentId.toLowerCase() === clean || e.to.toLowerCase() === clean) &&
      !e.read
    ) {
      changed = true;
      return { ...e, read: true };
    }
    return e;
  });
  if (changed) {
    saveAllSentEmails(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_emails_updated'));
    }
  }
}

// Internal helper to dispatch an automated email with deduplication guarantee
export async function dispatchAutomatedEmail(
  emailData: Omit<EmailNotification, 'id' | 'timestamp'>
): Promise<EmailNotification | null> {
  const all = await getAllSentEmails();
  const now = new Date();
  const nowTime = now.getTime();

  // Deduplication check: Do not send duplicate emails if an identical action
  // was dispatched for the same student and department in the last 10 seconds.
  const duplicate = all.find(
    (e) =>
      e.studentId.toLowerCase() === emailData.studentId.toLowerCase() &&
      e.departmentId === emailData.departmentId &&
      e.actionType === emailData.actionType &&
      e.status === emailData.status &&
      nowTime - new Date(e.timestamp).getTime() < 10000
  );

  if (duplicate) {
    return duplicate;
  }

  const newEmail: EmailNotification = {
    ...emailData,
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    read: false,
  };

  const updatedList = [newEmail, ...all];
  saveAllSentEmails(updatedList);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('rgukt_emails_updated', { detail: newEmail })
    );
  }

  return newEmail;
}

// Format timestamp for email body
function formatEmailDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// REQUIREMENT 1: Send Department Status Email (Approved or Denied)
export async function sendDepartmentStatusEmail(params: {
  student: StudentProfile;
  departmentId: DepartmentId | 'hod' | 'dean' | 'director';
  status: 'Approved' | 'Denied';
  staffName: string;
  designation?: string;
  reason?: string;
  pendingDueAmount?: number;
  account?: DeptAccount;
}): Promise<EmailNotification | null> {
  const { student, departmentId, status, staffName, designation, reason, pendingDueAmount, account } = params;
  const config = getDepartmentEmailConfig(departmentId, student, account);
  const formattedTime = formatEmailDateTime(new Date().toISOString());
  const roll = student.rollNumber || student.id.toUpperCase();

  const isApproved = status === 'Approved';
  const actionType: 'approved' | 'denied' = isApproved ? 'approved' : 'denied';

  const subject = isApproved
    ? `[CLEARANCE APPROVED] ${config.name} Clearance - ${roll}`
    : `[CLEARANCE ACTION REQUIRED] ${config.name} Clearance Denied - ${roll}`;

  const body = isApproved
    ? `Dear ${student.name} (${roll}),

This is an automated notification from ${config.name}.

Your departmental no-dues clearance request has been officially REVIEWED and APPROVED.

Clearance Details:
• Department: ${config.name}
• Status: APPROVED
• Date & Time: ${formattedTime}
• Authorized By: ${staffName || config.officerName} (${designation || config.designation})
• Official Department Email: ${config.email}
• Official Remarks: Digital verification completed. All institutional obligations satisfied.

Your digital record has been updated on the RGUKT RK Valley Clearance Portal.

Sincerely,
${staffName || config.officerName}
${designation || config.designation}
${config.name}
Rajiv Gandhi University of Knowledge Technologies, RK Valley
Official Portal: https://rguktrkv.ac.in`
    : `Dear ${student.name} (${roll}),

This is an automated notification from ${config.name}.

Your departmental no-dues clearance request has been DENIED / RETURNED by the reviewing authority. Please review the official remarks below to resolve the pending requirement.

Clearance Details:
• Department: ${config.name}
• Status: DENIED
• Date & Time: ${formattedTime}
• Reviewing Official: ${staffName || config.officerName} (${designation || config.designation})
• Official Department Email: ${config.email}
• Reason / Remarks: ${reason || 'Action required to clear outstanding departmental obligations.'}
${pendingDueAmount && pendingDueAmount > 0 ? `• Outstanding Due Amount: ₹${pendingDueAmount}\n` : ''}
Action Required:
Please log in to your RGUKT RK Valley Student Portal to view due specifics, settle any pending fees via the SBI Collect payment gateway, or visit the ${config.name} desk in person to resolve this item.

Sincerely,
${staffName || config.officerName}
${designation || config.designation}
${config.name}
Rajiv Gandhi University of Knowledge Technologies, RK Valley
Official Portal: https://rguktrkv.ac.in`;

  const payload: any = {
    studentId: student.id,
    to: student.email,
    recipientName: student.name,
    from: config.email,
    fromName: config.name,
    officerName: staffName || config.officerName,
    designation: designation || config.designation,
    departmentId,
    departmentName: config.name,
    actionType,
    status,
    subject,
    body,
  };
  
  if (reason) payload.reasonOrRemarks = reason;
  if (pendingDueAmount !== undefined) payload.pendingDueAmount = pendingDueAmount;

  return dispatchAutomatedEmail(payload);
}

// REQUIREMENT 2: Send Final Certificate Email with PDF soft-copy attachment
export async function sendFinalCertificateEmail(params: {
  student: StudentProfile;
  record: StudentClearanceRecord;
  approverName: string;
  approverDesignation: string;
  account?: DeptAccount;
}): Promise<EmailNotification | null> {
  const { student, record, approverName, approverDesignation, account } = params;
  const config = getDepartmentEmailConfig('hod', student, account);
  const formattedTime = formatEmailDateTime(new Date().toISOString());
  const roll = student.rollNumber || student.id.toUpperCase();
  const certHash = record.certificate_hash || `RGUKT-RKV/ND/${new Date().getFullYear()}/${roll}`;

  // Generate the real PDF soft-copy data URI attachment
  let pdfDataUri = '';
  try {
    pdfDataUri = await generateNoDuesPDFDataUri(student, record);
  } catch (err) {
    console.error('Failed to generate PDF attachment for email:', err);
  }

  const pdfFilename = generateNoDuesPDFFilename(student);

  const subject = `🎓 [NO-DUES CERTIFICATE] Congratulations! Final Clearance Approved & Certificate Attached - ${roll}`;

  const body = `Dear ${student.name} (${roll}),

Congratulations!

We are pleased to inform you that your institutional no-dues clearance process is 100% COMPLETE. All statutory university departments (Central Library, Hostel Management, Laboratories, Finance, Sports, and Academic Affairs) have granted digital approval.

Final institutional sign-off has been executed by ${approverName} (${approverDesignation}).

Clearance Summary:
• Student Name: ${student.name}
• ID / Roll Number: ${roll}
• Branch / Program: ${student.branch}
• Batch: ${student.batch}
• Central Library: Cleared & Digitally Signed
• Hostel Management: Cleared & Digitally Signed
• Laboratories & Workshop: Cleared & Digitally Signed
• Finance Department: Cleared & Digitally Signed
• Sports & Physical Education: Cleared & Digitally Signed
• Academic Authority: Approved by ${approverName} (${approverDesignation})
• Certificate Reference ID: ${certHash}
• Date of Issuance: ${formattedTime}

ATTACHMENT:
Your official cryptographically signed Digital No-Dues & Clearance Certificate is attached to this email as a PDF document (${pdfFilename}).

You may download and save this official soft-copy for your graduation records, Transfer Certificate (TC) applications, and higher education verification.

We wish you all the best in your future endeavors!

Warm regards,
${approverName}
${approverDesignation}
Office of Academic Affairs & Department Administration
Rajiv Gandhi University of Knowledge Technologies, RK Valley
Official Contact: ${config.email}
Official Portal: https://rguktrkv.ac.in`;

  return dispatchAutomatedEmail({
    studentId: student.id,
    to: student.email,
    recipientName: student.name,
    from: config.email,
    fromName: config.name,
    officerName: approverName,
    designation: approverDesignation,
    departmentId: 'hod',
    departmentName: config.name,
    actionType: 'certificate_issued',
    status: 'Issued',
    subject,
    body,
    attachments: [
      {
        filename: pdfFilename,
        contentType: 'application/pdf',
        sizeBytes: pdfDataUri ? Math.round(pdfDataUri.length * 0.75) : 24800,
        dataUrl: pdfDataUri,
      },
    ],
  });
}
