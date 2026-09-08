export type DepartmentId = 'library' | 'hostel' | 'lab' | 'finance' | 'sports' | 'itinfra';

export type Role = 'student' | 'dept_admin' | 'hod' | 'dean' | 'director' | 'verification_officer';

export type StudentBranchCode = 'CSE' | 'AIML' | 'ECE' | 'EEE' | 'CE' | 'ME' | 'CHEMICAL' | 'MME' | 'PUC';

export type ClearanceStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type DueStatus = 'Unpaid' | 'Payment Submitted — Awaiting Transaction Verification' | 'Payment Verified — Pending Department Clearance' | 'Payment Rejected — Please Resubmit' | 'Approved' | 'Rejected';

export type VerificationStatus = 'Pending' | 'Approved' | 'Denied';

export interface DigitalSignature {
  staff_name: string;
  designation: string;
  department: string;
  timestamp: string;
  verification_hash: string;
}

export interface StudentProfile {
  id: string; // e.g., 'r240086' (normalized lowercase)
  rollNumber: string; // e.g., 'R240086' or 'O240635'
  name: string;
  email: string; // e.g., 'r240086@rguktrkv.ac.in'
  branch: string; // e.g., 'Computer Science & Engineering (CSE)'
  branchCode?: StudentBranchCode; // Normalized branch code for RBAC filtering
  batch: string; // e.g., '2024-2028'
  studentType: 'engineering' | 'puc';
  gender?: 'M' | 'F';
  photoUrl: string;
  phone: string;
  admissionYear: number;
  passwordHash?: string; // Hashed password (defaults to hash of roll number)
  hasChangedPassword?: boolean; // false until student updates their default password
  lastLogin?: string;
}

export interface CodeDue {
  id: string;
  student_id: string;
  department: DepartmentId;
  reason: string;
  amount: number;
  status: DueStatus;
  receipt_url?: string;
  receipt_file_name?: string;
  transaction_ref?: string;
  admin_comment?: string;
  created_at: string;
  updated_at: string;

  // Intermediary Transaction Verification fields (reviewed by Finance Officer)
  verification_status?: VerificationStatus;
  verification_officer?: string;
  verification_timestamp?: string;
  verification_remarks?: string;
}

export interface DepartmentClearance {
  department: DepartmentId;
  status: ClearanceStatus;
  digital_signature?: DigitalSignature;
  rejection_reason?: string;
  last_updated: string;
}

export interface StudentClearanceRecord {
  student_id: string;
  departments: Record<DepartmentId, DepartmentClearance>;
  hod_approval?: {
    approved: boolean;
    staff_name: string;
    designation: string;
    timestamp: string;
    verification_hash: string;
    remarks?: string;
  };
  certificate_generated: boolean;
  certificate_hash?: string;
  certificate_date?: string;
}

export interface DeptAccount {
  id: string;
  department: DepartmentId | 'hod' | 'dean' | 'director' | 'verification' | 'verification_officer';
  name: string;
  email: string;
  password: string; // admin issued password
  officerName: string;
  designation: string;
  avatar: string;
  role?: Role;
  headerTitle?: string; // e.g. "HOD – Computer Science & Engineering (CSE & AI/ML)"
  branchName?: string; // e.g. "Computer Science & Engineering and AI/ML"
  allowedBranchCodes?: StudentBranchCode[]; // Restricts access to students of these branch codes
}

export interface InAppNotification {
  id: string;
  recipient_type: 'student' | 'dept' | 'hod' | 'all';
  recipient_id: string; // student_id or department_id
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export interface AuthSession {
  role: Role;
  student?: StudentProfile;
  deptAccount?: DeptAccount;
  activeDepartment?: DepartmentId | 'hod' | 'dean' | 'director' | 'verification' | 'verification_officer';
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  sizeBytes?: number;
  dataUrl?: string;
}

export interface EmailNotification {
  id: string;
  studentId: string;
  to: string; // student's official [rollnumber]@rguktrkv.ac.in email
  recipientName: string;
  from: string; // department official email (e.g., library@rguktrkv.ac.in)
  fromName: string; // official department sender name
  officerName?: string;
  designation?: string;
  departmentId: DepartmentId | 'hod' | 'dean' | 'director';
  departmentName: string;
  actionType: 'approved' | 'denied' | 'certificate_issued';
  status: 'Approved' | 'Denied' | 'Issued';
  subject: string;
  body: string;
  reasonOrRemarks?: string;
  pendingDueAmount?: number;
  timestamp: string;
  attachments?: EmailAttachment[];
  read?: boolean;
}
