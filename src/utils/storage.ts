import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  AuthSession,
  CodeDue,
  DepartmentClearance,
  DepartmentId,
  DeptAccount,
  InAppNotification,
  StudentBranchCode,
  StudentClearanceRecord,
  StudentProfile,
} from '../types';
import {
  INITIAL_CLEARANCE_RECORDS,
  INITIAL_DUES,
  SEED_DEPT_ACCOUNTS,
  SEED_STUDENTS,
} from '../constants';
import { generateCertificateNumber, generateVerificationHash, hashPassword, verifyPassword } from './crypto';
import { generateReceiptSvg, saveReceiptToStorage } from './receiptStorage';
import {
  sendDepartmentStatusEmail,
  sendFinalCertificateEmail,
  getAllSentEmails,
  saveAllSentEmails,
  getStudentEmails,
  markEmailAsRead,
  markAllStudentEmailsAsRead,
} from './emailService';

const STORAGE_KEYS = {
  STUDENTS: 'rgukt_students_v1',
  CLEARANCE_RECORDS: 'rgukt_clearance_records_v1',
  DUES: 'rgukt_dues_v1',
  NOTIFICATIONS: 'rgukt_notifications_v1',
  SESSION: 'rgukt_session_v1',
};

// Resilient in-memory fallback store to guarantee zero app crashes on localStorage quota limits
const inMemoryFallbackStore = new Map<string, string>();

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (err) {
    console.warn(`[SafeStorage] Error reading "${key}" from localStorage:`, err);
  }
  return inMemoryFallbackStore.get(key) || null;
}

export async function safeRemoveItem(key: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  inMemoryFallbackStore.delete(key);
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  // Always mirror in memory
  inMemoryFallbackStore.set(key, value);

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] QuotaExceededError or setItem exception on "${key}". Initiating recovery:`, err);

    // Strategy 1: If key being written is DUES, strip bulky data URLs from dues
    if (key === STORAGE_KEYS.DUES) {
      try {
        const dues: CodeDue[] = JSON.parse(value);
        const slim = dues.map((d) => {
          if (d.receipt_url && d.receipt_url.length > 15000) {
            saveReceiptToStorage(d.id, d.receipt_url);
            return {
              ...d,
              receipt_url: generateReceiptSvg({
                amount: d.amount,
                reason: d.reason,
                department: d.department,
                studentId: d.student_id,
                refNumber: d.transaction_ref,
              }),
            };
          }
          return d;
        });
        localStorage.setItem(key, JSON.stringify(slim));
        return true;
      } catch (e1) {
        console.warn('[SafeStorage] Dues slimming failed:', e1);
      }
    }

    // Strategy 2: Clean existing storage bloat across keys
    try {
      // Trim notifications
      const notifsRaw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (notifsRaw && notifsRaw.length > 5000) {
        const notifs = JSON.parse(notifsRaw);
        if (Array.isArray(notifs)) {
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 10)));
        }
      }
    } catch {}

    try {
      // Clean existing dues in storage
      const existingDuesRaw = localStorage.getItem(STORAGE_KEYS.DUES);
      if (
        existingDuesRaw &&
        (existingDuesRaw.length > 30000 ||
          existingDuesRaw.includes('data:image/') ||
          existingDuesRaw.includes('data:application/pdf'))
      ) {
        const parsedDues: CodeDue[] = JSON.parse(existingDuesRaw);
        const cleaned = parsedDues.map((d: CodeDue) => {
          if (d.receipt_url && d.receipt_url.length > 15000) {
            saveReceiptToStorage(d.id, d.receipt_url);
            return {
              ...d,
              receipt_url: generateReceiptSvg({
                amount: d.amount,
                reason: d.reason,
                department: d.department,
                studentId: d.student_id,
                refNumber: d.transaction_ref,
              }),
            };
          }
          return d;
        });
        localStorage.setItem(STORAGE_KEYS.DUES, JSON.stringify(cleaned));
      }
    } catch {}

    // Strategy 3: Retry original write
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      console.warn(`[SafeStorage] Persisting key "${key}" in-memory only. The app remains fully functional without errors.`);
      return false;
    }
  }
}

/**
 * Normalizes student branch string or profile into canonical StudentBranchCode
 * CRITICAL FIX: EEE / ELECTRICAL must be checked BEFORE ECE / ELECTRONICS because
 * "Electrical & Electronics Engineering (EEE)" contains the word "Electronics".
 */
export function getStudentBranchCode(
  input: Partial<StudentProfile> | string | undefined | null
): StudentBranchCode {
  if (!input) return 'CSE';

  const branchText = typeof input === 'string' ? input : input.branch || '';
  const b = branchText.toUpperCase().trim();

  // 1. EEE MUST be checked first to prevent "Electrical & Electronics" from matching "Electronics"
  if (b.includes('EEE') || b.includes('ELECTRICAL')) return 'EEE';

  // 2. If object input has explicit branchCode, inspect it
  if (typeof input !== 'string' && input.branchCode) {
    if (input.branchCode === 'EEE') return 'EEE';
    // If branchCode was mistakenly tagged as ECE but text is EEE, override to EEE
    if (input.branchCode === 'ECE' && (b.includes('EEE') || b.includes('ELECTRICAL'))) {
      return 'EEE';
    }
    return input.branchCode;
  }

  // 3. Match other branches
  if (b.includes('AIML') || b.includes('MACHINE LEARNING') || b.includes('AI/ML')) return 'AIML';
  if (b.includes('CSE') || b.includes('COMPUTER')) return 'CSE';
  if (b.includes('ECE') || b.includes('COMMUNICATION') || b.includes('ELECTRONICS')) return 'ECE';
  if (b.includes('CIVIL') || b.includes('(CE)') || b.includes(' CE')) return 'CE';
  if (b.includes('MECH') || b.includes('(ME)') || b.includes(' ME')) return 'ME';
  if (b.includes('CHEM')) return 'CHEMICAL';
  if (b.includes('METAL') || b.includes('MME') || b.includes('MATERIALS')) return 'MME';
  return 'CSE';
}

// Initialize default storage data if missing or upgrade from older seed
export async function initStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Emergency Quarantine & Sanitization:
  // If localStorage currently contains over-quota dues with bulky embedded base64 URLs,
  // sanitize them immediately into SVG badges and offload full documents to IndexedDB.
  try {
    const storedDuesRaw = safeGetItem(STORAGE_KEYS.DUES);
    if (
      storedDuesRaw &&
      (storedDuesRaw.length > 25000 ||
        storedDuesRaw.includes('data:image/') ||
        storedDuesRaw.includes('data:application/pdf'))
    ) {
      const parsedDues: CodeDue[] = JSON.parse(storedDuesRaw);
      let changed = false;
      const sanitized = parsedDues.map((d: CodeDue) => {
        if (d.receipt_url && d.receipt_url.length > 15000) {
          saveReceiptToStorage(d.id, d.receipt_url);
          changed = true;
          return {
            ...d,
            receipt_url: generateReceiptSvg({
              amount: d.amount,
              reason: d.reason,
              department: d.department,
              studentId: d.student_id,
              refNumber: d.transaction_ref,
            }),
          };
        }
        return d;
      });
      if (changed) {
        safeSetItem(STORAGE_KEYS.DUES, JSON.stringify(sanitized));
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Emergency dues sanitization notice:', err);
  }

  const rawStudents = safeGetItem(STORAGE_KEYS.STUDENTS);
  if (!rawStudents) {
    safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
  } else {
    // If existing storage has less students than current full dataset, auto-sync idempotently
    try {
      const parsed: StudentProfile[] = JSON.parse(rawStudents);
      if (parsed.length < SEED_STUDENTS.length || !parsed[0]?.rollNumber) {
        syncStudentRecords(SEED_STUDENTS);
      }
    } catch {
      safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    }
  }

  // Active Data Migration & Branch-tagging Repair:
  // Identify every student whose branch is "Electrical & Electronics Engineering (EEE)"
  // and fix both branch and branchCode to properly isolate them from ECE into EEE.
  try {
    const storedStudentsRaw = safeGetItem(STORAGE_KEYS.STUDENTS);
    if (storedStudentsRaw) {
      let needsSave = false;
      const parsedList: StudentProfile[] = JSON.parse(storedStudentsRaw);
      const repaired = parsedList.map((st) => {
        const bUpper = (st.branch || '').toUpperCase();
        const isEee = bUpper.includes('ELECTRICAL') || bUpper.includes('EEE') || st.branchCode === 'EEE';
        if (isEee) {
          if (st.branchCode !== 'EEE' || st.branch !== 'Electrical & Electronics Engineering (EEE)') {
            needsSave = true;
            return {
              ...st,
              branch: 'Electrical & Electronics Engineering (EEE)',
              branchCode: 'EEE' as const,
            };
          }
        }
        return st;
      });

      if (needsSave) {
        safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(repaired));
      }
    }
  } catch (err) {
    console.error('Error during student branch repair migration:', err);
  }

  if (!safeGetItem(STORAGE_KEYS.CLEARANCE_RECORDS)) {
    safeSetItem(
      STORAGE_KEYS.CLEARANCE_RECORDS,
      JSON.stringify(INITIAL_CLEARANCE_RECORDS)
    );
  }
  if (!safeGetItem(STORAGE_KEYS.DUES)) {
    safeSetItem(STORAGE_KEYS.DUES, JSON.stringify(INITIAL_DUES));
  }
  const DEFAULT_BROADCAST_NOTIFICATIONS: InAppNotification[] = [
    {
      id: 'notif-broadcast-1',
      recipient_type: 'all',
      recipient_id: 'all',
      title: 'No-Dues Clearance Window Active (AY 2024-25)',
      message: 'Graduating students can submit clearance applications and upload SBI Collect e-receipts for all 5 statutory departments.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info',
    },
    {
      id: 'notif-broadcast-2',
      recipient_type: 'all',
      recipient_id: 'all',
      title: 'SBI Collect Fee Settlement Guidelines',
      message: 'Ensure the DU reference number is clearly visible on uploaded payment slips to enable swift finance verification within 24 hours.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-broadcast-3',
      recipient_type: 'all',
      recipient_id: 'all',
      title: 'Digital Cryptographic Verification Released',
      message: 'Issued clearance certificates feature tamper-proof SHA-256 digital signature hashes and direct QR-code public verification.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'success',
    },
  ];

  const existingNotifsRaw = safeGetItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!existingNotifsRaw) {
    const initialNotifications: InAppNotification[] = [
      ...DEFAULT_BROADCAST_NOTIFICATIONS,
      {
        id: 'notif-init-1',
        recipient_type: 'student',
        recipient_id: 'r240086',
        title: 'Pending Library Fine Detected',
        message: 'Central Library has assessed ₹350 for overdue textbook. Please pay via SBI Collect and upload receipt.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'warning',
      },
      {
        id: 'notif-init-2',
        recipient_type: 'dept',
        recipient_id: 'lab',
        title: 'New Receipt Submitted for Verification',
        message: 'Tharun Pinninti (r240212) uploaded receipt for ₹450 Lab fee (Ref: DUK882910492).',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
      },
    ];
    safeSetItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(initialNotifications)
    );
  } else {
    // Ensure broadcast notifications exist even if storage was previously initialized
    try {
      const parsed: InAppNotification[] = JSON.parse(existingNotifsRaw);
      const hasBroadcast = parsed.some((n) => n.recipient_type === 'all');
      if (!hasBroadcast) {
        const combined = [...DEFAULT_BROADCAST_NOTIFICATIONS, ...parsed];
        safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(combined.slice(0, 50)));
      }
    } catch {}
  }

  // Initialize seed emails for r240086 if no emails exist in storage
  const sentEmails = await getAllSentEmails();
  if (sentEmails.length === 0) {
    const student = SEED_STUDENTS.find((s) => s.id === 'r240086');
    if (student) {
      await sendDepartmentStatusEmail({
        student,
        departmentId: 'sports',
        status: 'Approved',
        staffName: 'Mr. B. Naidu',
        designation: 'Physical Director & Head of Athletics',
      });
      await sendDepartmentStatusEmail({
        student,
        departmentId: 'lab',
        status: 'Approved',
        staffName: 'Dr. P. Ramesh Babu',
        designation: 'Central Lab In-charge & Workshop Superintendent',
      });
      await sendDepartmentStatusEmail({
        student,
        departmentId: 'finance',
        status: 'Approved',
        staffName: 'Mrs. G. Lakshmi Prasanna',
        designation: 'Finance Officer & Comptroller',
      });
    }
  }
}

/**
 * Idempotently imports/syncs student records using roll number as unique key.
 * If record exists, updates attributes while preserving user-altered state (like changed passwords).
 * If record is new, adds it.
 */
export async function syncStudentRecords(sourceStudents: StudentProfile[] = SEED_STUDENTS): Promise<{ added: number; updated: number; total: number }> {
  if (typeof window === 'undefined') return { added: 0, updated: 0, total: 0 };
  const raw = safeGetItem(STORAGE_KEYS.STUDENTS);
  const existingList: StudentProfile[] = raw ? JSON.parse(raw) : [];
  const map = new Map<string, StudentProfile>();

  // Index existing students by lowercase roll number or ID
  existingList.forEach((st) => {
    const key = (st.rollNumber || st.id).trim().toLowerCase();
    map.set(key, st);
  });

  let addedCount = 0;
  let updatedCount = 0;

  sourceStudents.forEach((newSt) => {
    const key = (newSt.rollNumber || newSt.id).trim().toLowerCase();
    const existing = map.get(key);
    const isEee =
      (newSt.branch || existing?.branch || '').toUpperCase().includes('ELECTRICAL') ||
      (newSt.branch || existing?.branch || '').toUpperCase().includes('EEE') ||
      newSt.branchCode === 'EEE';
    const branchCode: StudentBranchCode = isEee ? 'EEE' : getStudentBranchCode(newSt);
    const branch = isEee ? 'Electrical & Electronics Engineering (EEE)' : (newSt.branch || existing?.branch || '');

    if (!existing) {
      map.set(key, { ...newSt, branch, branchCode });
      addedCount++;
    } else {
      // Idempotently update with latest fields while preserving user changes
      const updated: StudentProfile = {
        ...newSt,
        ...existing,
        rollNumber: newSt.rollNumber || existing.rollNumber || newSt.id.toUpperCase(),
        branch,
        branchCode,
        batch: newSt.batch || existing.batch,
        gender: newSt.gender || existing.gender,
        email: newSt.email || existing.email,
        passwordHash: existing.hasChangedPassword ? existing.passwordHash : (existing.passwordHash || newSt.passwordHash),
        hasChangedPassword: existing.hasChangedPassword || false,
      };
      map.set(key, updated);
      updatedCount++;
    }
  });

  const merged = Array.from(map.values());
  safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
  return { added: addedCount, updated: updatedCount, total: merged.length };
}

// Students
export function getStudents(): StudentProfile[] {
  initStorage();
  const raw = typeof window !== 'undefined' ? safeGetItem(STORAGE_KEYS.STUDENTS) : null;
  const list: StudentProfile[] = raw ? JSON.parse(raw) : SEED_STUDENTS;
  return list.map((st) => {
    const isEee =
      (st.branch || '').toUpperCase().includes('ELECTRICAL') ||
      (st.branch || '').toUpperCase().includes('EEE') ||
      st.branchCode === 'EEE';

    const branchCode: StudentBranchCode = isEee ? 'EEE' : getStudentBranchCode(st);
    const branch = isEee
      ? 'Electrical & Electronics Engineering (EEE)'
      : st.branch;

    return {
      ...st,
      branch,
      branchCode,
    };
  });
}

/**
 * Strict data-query level filter: retrieves only students within an account's authorized branch scope.
 * - HODs: restricted to their allowedBranchCodes (e.g. CSE & AIML, or ECE, or EEE, etc.)
 * - Director / Dean: full access across all branches
 * - Statutory Dept Admins (Library, Hostel, etc.): full university-wide access
 */
export function getStudentsForAccount(account: DeptAccount): StudentProfile[] {
  const allStudents = getStudents();

  // If director or dean, or statutory department admin without branch scoping, return all students
  if (
    account.department === 'director' ||
    account.department === 'dean' ||
    account.role === 'director' ||
    account.role === 'dean' ||
    !account.allowedBranchCodes ||
    account.allowedBranchCodes.length === 0
  ) {
    return allStudents;
  }

  // If HOD account, enforce data-query level filter by allowedBranchCodes
  const allowedSet = new Set(account.allowedBranchCodes);
  return allStudents.filter((st) => {
    const bCode = st.branchCode || getStudentBranchCode(st);
    return allowedSet.has(bCode);
  });
}

/**
 * Data-query level filter for clearance records matching authorized students.
 */
export async function getClearanceRecordsForAccount(
  account: DeptAccount
): Promise<Record<string, StudentClearanceRecord>> {
  const allRecords = getClearanceRecords();
  const authorizedStudents = getStudentsForAccount(account);
  const authStudentIds = new Set(authorizedStudents.map((s) => s.id.toLowerCase()));

  const filteredRecords: Record<string, StudentClearanceRecord> = {};
  Object.entries(allRecords).forEach(([key, rec]) => {
    if (authStudentIds.has(key.toLowerCase()) || authStudentIds.has(rec.student_id.toLowerCase())) {
      filteredRecords[key] = rec;
    }
  });

  return filteredRecords;
}

/**
 * Data-query level filter for dues matching authorized students.
 */
export function getDuesForAccount(account: DeptAccount): CodeDue[] {
  const allDues = getDues();
  const authorizedStudents = getStudentsForAccount(account);
  const authStudentIds = new Set(authorizedStudents.map((s) => s.id.toLowerCase()));

  return allDues.filter((d) => authStudentIds.has(d.student_id.toLowerCase()));
}

export function getStudentById(studentId: string): StudentProfile | undefined {
  const students = getStudents();
  const clean = studentId.trim().toLowerCase();
  return students.find(
    (s) => s.id.toLowerCase() === clean || (s.rollNumber && s.rollNumber.toLowerCase() === clean) || s.email.toLowerCase() === clean
  );
}

export async function saveStudent(student: StudentProfile): Promise<void> {
  await setDoc(doc(db, 'students', student.id.toLowerCase()), student, { merge: true });
  const students = getStudents();
  const index = students.findIndex((s) => s.id.toLowerCase() === student.id.toLowerCase());
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

/**
 * Authenticates a student via email or roll number and password.
 * Username/ID: official email or roll number
 * Default password: roll number (lowercase)
 */
export async function authenticateStudent(
  identifier: string,
  plainPassword: string
): Promise<{
  success: boolean;
  student?: StudentProfile;
  error?: string;
  requiresPasswordChange?: boolean;
}> {
  initStorage();
  const trimmedId = identifier.trim().toLowerCase();
  const rollCandidate = trimmedId.includes('@') ? trimmedId.split('@')[0] : trimmedId;

  const student = getStudentById(rollCandidate) || getStudents().find(
    (s) =>
      s.email.toLowerCase() === trimmedId ||
      s.id.toLowerCase() === rollCandidate ||
      (s.rollNumber && s.rollNumber.toLowerCase() === rollCandidate)
  );

  if (!student) {
    return {
      success: false,
      error: `No student record found with identifier "${identifier}". Please check your official RGUKT email or roll number.`,
    };
  }

  // Stored password hash, or default derived from roll number in lowercase
  const defaultHash = hashPassword(student.id.toLowerCase());
  const storedHash = student.passwordHash || defaultHash;

  const isMatch = verifyPassword(plainPassword, storedHash);

  if (!isMatch) {
    return {
      success: false,
      error: 'Invalid password. Note: Default password is your roll number (e.g. r240086).',
    };
  }

  // Update last login
  student.lastLogin = new Date().toISOString();
  await saveStudent(student);

  return {
    success: true,
    student,
    requiresPasswordChange: !student.hasChangedPassword,
  };
}

/**
 * Updates a student's password and marks hasChangedPassword as true
 */
export async function updateStudentPassword(
  studentId: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error?: string }> {
  const student = getStudentById(studentId);
  if (!student) {
    return { success: false, error: 'Student not found' };
  }
  if (!newPasswordPlain || newPasswordPlain.trim().length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  student.passwordHash = hashPassword(newPasswordPlain.trim());
  student.hasChangedPassword = true;
  await saveStudent(student);
  return { success: true };
}

/**
 * Resets a student's password back to default roll number
 */
export async function resetStudentPassword(studentId: string): Promise<{ success: boolean; error?: string }> {
  const student = getStudentById(studentId);
  if (!student) {
    return { success: false, error: 'Student not found' };
  }
  const defaultPlain = student.id.toLowerCase();
  student.passwordHash = hashPassword(defaultPlain);
  student.hasChangedPassword = false;
  await saveStudent(student);
  return { success: true };
}

// Clearance Records
export function getClearanceRecords(): Record<string, StudentClearanceRecord> {
  initStorage();
  const raw = typeof window !== 'undefined' ? safeGetItem(STORAGE_KEYS.CLEARANCE_RECORDS) : null;
  return raw ? JSON.parse(raw) : INITIAL_CLEARANCE_RECORDS;
}

export async function getClearanceRecord(studentId: string): Promise<StudentClearanceRecord> {
  const normalizedId = studentId.toLowerCase();
  
  // Try fetching from Firestore first
  const docRef = doc(db, 'clearanceRecords', normalizedId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data() as StudentClearanceRecord;
    // Sync local storage
    const records = getClearanceRecords();
    records[normalizedId] = data;
    safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
    return data;
  }

  // If not found, create a blank pending clearance record
  const defaultRec: StudentClearanceRecord = {
    student_id: normalizedId,
    departments: {
      library: { department: 'library', status: 'pending', last_updated: new Date().toISOString() },
      hostel: { department: 'hostel', status: 'pending', last_updated: new Date().toISOString() },
      lab: { department: 'lab', status: 'pending', last_updated: new Date().toISOString() },
      finance: { department: 'finance', status: 'pending', last_updated: new Date().toISOString() },
      sports: { department: 'sports', status: 'pending', last_updated: new Date().toISOString() },
      itinfra: { department: 'itinfra', status: 'pending', last_updated: new Date().toISOString() },
    },
    certificate_generated: false,
  };
  await saveClearanceRecord(defaultRec);
  return defaultRec;
}

export async function saveClearanceRecord(record: StudentClearanceRecord): Promise<void> {
  await setDoc(doc(db, 'clearanceRecords', record.student_id.toLowerCase()), record, { merge: true });
  const records = getClearanceRecords();
  records[record.student_id.toLowerCase()] = record;
  safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
}

// Dues
export function getDues(studentId?: string): CodeDue[] {
  initStorage();
  const raw = typeof window !== 'undefined' ? safeGetItem(STORAGE_KEYS.DUES) : null;
  const dues: CodeDue[] = raw ? JSON.parse(raw) : INITIAL_DUES;
  
  // Normalize verification_status for any dues where receipt has been submitted
  const normalized = dues.map((d) => {
    if (d.status === 'Payment Submitted — Awaiting Transaction Verification' && !d.verification_status) {
      return { ...d, verification_status: 'Pending' as const };
    }
    return d;
  });

  if (studentId) {
    return normalized.filter(
      (d) => d.student_id.toLowerCase() === studentId.trim().toLowerCase()
    );
  }
  return normalized;
}

export function getDuesForDepartment(dept: DepartmentId): CodeDue[] {
  const dues = getDues();
  return dues.filter((d) => d.department === dept);
}

export async function saveDue(due: CodeDue): Promise<void> {
  await setDoc(doc(db, 'dues', due.id), due, { merge: true });
  await setDoc(doc(db, 'dues', due.id), due, { merge: true });
  // If receipt is large (> 20KB), offload full document to IndexedDB and keep light SVG badge
  if (due.receipt_url && due.receipt_url.length > 20000) {
    saveReceiptToStorage(due.id, due.receipt_url);
    due = {
      ...due,
      receipt_url: generateReceiptSvg({
        amount: due.amount,
        reason: due.reason,
        department: due.department,
        studentId: due.student_id,
        refNumber: due.transaction_ref,
      }),
    };
  }
  const dues = getDues();
  const idx = dues.findIndex((d) => d.id === due.id);
  if (idx >= 0) {
    dues[idx] = due;
  } else {
    dues.unshift(due);
  }
  safeSetItem(STORAGE_KEYS.DUES, JSON.stringify(dues));
}


export async function addDue(params: {
  student_id: string;
  department: DepartmentId;
  reason: string;
  amount: number;
}): Promise<CodeDue> {
  const rec = await getClearanceRecord(params.student_id);
  if (rec.certificate_generated) {
    throw new Error('Certificate Lock: This student\'s No-Dues Certificate has already been issued and digitally sealed. New dues cannot be raised against a certified student.');
  }

  const newDue: CodeDue = {

    id: `due-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    student_id: params.student_id.toLowerCase(),
    department: params.department,
    reason: params.reason,
    amount: params.amount,
    status: 'Unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveDue(newDue);

  // Mark student's department status as pending
  rec.departments[params.department] = {
    department: params.department,
    status: 'pending',
    last_updated: new Date().toISOString(),
  };
  // Also reset certificate if it was generated
  rec.certificate_generated = false;
  await saveClearanceRecord(rec);

  // Add in-app notification to student
  const student = getStudentById(params.student_id);
  await addNotification({
    recipient_type: 'student',
    recipient_id: params.student_id,
    title: `New Due Added: ${params.department.toUpperCase()}`,
    message: `A due of ₹${params.amount} has been added for: "${params.reason}". Please clear via SBI Collect.`,
    type: 'warning',
  });

  return newDue;
}

// Student uploads receipt for a due
// NEW REQUIRED FLOW: Routes first to Transaction Verification queue (Finance Officer)
export async function submitDueReceipt(params: {
  dueId: string;
  receiptUrl: string;
  receiptFileName?: string;
  transactionRef?: string;
}): Promise<void> {
  const dues = getDues();
  const due = dues.find((d) => d.id === params.dueId);
  if (!due) return;

  // Offload full receipt document to IndexedDB & memory cache to prevent localStorage overflow
  saveReceiptToStorage(params.dueId, params.receiptUrl);

  due.status = 'Payment Submitted — Awaiting Transaction Verification';
  if (params.receiptUrl && params.receiptUrl.length > 20000) {
    due.receipt_url = generateReceiptSvg({
      amount: due.amount,
      reason: due.reason,
      department: due.department,
      studentId: due.student_id,
      refNumber: params.transactionRef,
    });
  } else {
    due.receipt_url = params.receiptUrl;
  }
  due.receipt_file_name = params.receiptFileName || 'payment_receipt.pdf';
  due.transaction_ref = params.transactionRef || '';
  due.updated_at = new Date().toISOString();

  // Route to Transaction Verification queue (Pending review by Finance Officer)
  due.verification_status = 'Pending';
  delete due.verification_officer;
  delete due.verification_timestamp;
  delete due.verification_remarks;
  await saveDue(due);

  // Update department status to 'under_review'
  const rec = await getClearanceRecord(due.student_id);
  rec.departments[due.department] = {
    ...rec.departments[due.department],
    status: 'under_review',
    last_updated: new Date().toISOString(),
  };
  await saveClearanceRecord(rec);

  
  // Internal notification to Transaction Verification Officer (Finance Officer)
  const student = getStudentById(due.student_id);
  await addNotification({
    recipient_type: 'dept',
    recipient_id: 'verification',
    title: `New Transaction Awaiting Verification (${due.student_id.toUpperCase()})`,
    message: `Payment receipt submitted for ₹${due.amount} (${due.reason}) in ${due.department.toUpperCase()}. SBI Ref: ${due.transaction_ref || 'N/A'}. Awaiting Transaction Verification.`,
    type: 'info',
  });

  // Notification to the original department admin
  await addNotification({
    recipient_type: 'dept',
    recipient_id: due.department,
    title: `Payment Receipt Submitted (${due.student_id.toUpperCase()})`,
    message: `Student ${student?.name || due.student_id.toUpperCase()} submitted a payment/transaction proof for ₹${due.amount} (${due.reason}). Currently awaiting finance verification.`,
    type: 'info',
  });
}


// Transaction Verification (Finance Officer) approves transaction reference and receipt
export async function approveTransactionVerification(params: {
  dueId: string;
  officerName: string;
  remarks?: string;
}): Promise<void> {
  const dues = getDues();
  const due = dues.find((d) => d.id === params.dueId);
  if (!due) return;

  due.status = 'Payment Verified — Pending Department Clearance';
  due.verification_status = 'Approved';
  due.verification_officer = params.officerName;
  due.verification_timestamp = new Date().toISOString();
  due.verification_remarks = params.remarks || 'SBI Collect transaction verified against university accounts.';
  due.updated_at = new Date().toISOString();
  await saveDue(due);

  // Notify concerned department admin that payment receipt has been verified by finance officer
  // and is now actionable in their dashboard
  const student = getStudentById(due.student_id);
  await addNotification({
    recipient_type: 'dept',
    recipient_id: due.department,
    title: `Payment Verified by Finance (${student?.name || due.student_id.toUpperCase()})`,
    message: `Payment receipt of ₹${due.amount} for ${due.reason} (Ref: ${due.transaction_ref || 'N/A'}) was verified by ${params.officerName}. Ready for departmental clearance review.`,
    type: 'success',
  });
  // Notify department by email
  const ACADEMIC_ROLE_ACCOUNTS = (await import('../constants')).ACADEMIC_ROLE_ACCOUNTS;
  const deptAccount = Object.values(ACADEMIC_ROLE_ACCOUNTS).find(a => a?.department === due.department);
  if (deptAccount) {
    const { sendEmailNotification } = await import('./emailService');
    await sendEmailNotification({
      to: deptAccount.email,
      studentId: due.student_id,
      recipientName: deptAccount.name,
      from: 'finance@rguktrkv.ac.in',
      fromName: 'Finance Verification',
      departmentId: due.department,
      departmentName: due.department.toUpperCase(),
      actionType: 'approved',
      status: 'Approved',
      subject: `Payment Verified - ${student?.name || due.student_id.toUpperCase()} (${due.department.toUpperCase()})`,
      body: `A payment receipt of ₹${due.amount} for student ${student?.name || due.student_id.toUpperCase()} has been verified by the Transaction Verification Officer (${params.officerName}). Please review their profile in the No-Dues portal and take final clearance action.`,
      timestamp: new Date().toISOString()
    });
  }
}

// Transaction Verification (Finance Officer) denies/rejects transaction reference
export async function denyTransactionVerification(params: {
  dueId: string;
  officerName: string;
  reason: string;
}): Promise<void> {
  const dues = getDues();
  const due = dues.find((d) => d.id === params.dueId);
  if (!due) return;

  due.status = 'Payment Rejected — Please Resubmit';
  due.verification_status = 'Denied';
  due.verification_officer = params.officerName;
  due.verification_timestamp = new Date().toISOString();
  due.verification_remarks = params.reason;
  due.updated_at = new Date().toISOString();
  await saveDue(due);

  // Notify concerned department admin that payment was not verified
  const student = getStudentById(due.student_id);
  await addNotification({
    recipient_type: 'student',
    recipient_id: due.student_id,
    title: `Payment Rejected — Please Resubmit`,
    message: `Your payment receipt of ₹${due.amount} for ${due.department.toUpperCase()} was denied. Reason: ${params.reason}. Please upload a valid receipt.`,
    type: 'error',
  });
  if (student) {
    const { sendEmailNotification } = await import('./emailService');
    await sendEmailNotification({
      to: student.email,
      studentId: student.id,
      recipientName: student.name,
      from: 'finance@rguktrkv.ac.in',
      fromName: 'Finance Verification',
      departmentId: due.department,
      departmentName: due.department.toUpperCase(),
      actionType: 'denied',
      status: 'Denied',
      subject: `Payment Rejected - Action Required (${due.department.toUpperCase()})`,
      body: `Your payment receipt of ₹${due.amount} for ${due.department.toUpperCase()} has been rejected by the Transaction Verification Officer. Reason: ${params.reason}. Please log in to the portal and resubmit a valid receipt.`,
      reasonOrRemarks: params.reason,
      timestamp: new Date().toISOString()
    });
  }
}

// Department admin verifies and approves receipt (only after Transaction Verification has approved)
export async function verifyAndApproveReceipt(params: {
  dueId: string;
  staffName: string;
  designation: string;
}): Promise<void> {
  const dues = getDues();
  const due = dues.find((d) => d.id === params.dueId);
  if (!due) return;

  // Guard: Only actionable if Transaction Verification approved
  if (due.verification_status !== 'Approved') {
    console.warn('Cannot approve receipt: Transaction Verification is not approved.');
    return;
  }

  due.status = 'Approved';
  due.updated_at = new Date().toISOString();
  await saveDue(due);

  // Check if any other unpaid/receipt-submitted dues remain for this student in this dept
  const studentDues = getDues(due.student_id).filter((d) => d.department === due.department);
  const hasRemainingUnresolved = studentDues.some(
    (d) => d.status === 'Unpaid' || d.status === 'Payment Submitted — Awaiting Transaction Verification' || d.status === 'Rejected'
  );

  if (!hasRemainingUnresolved) {
    // Mark department as cleared / approved with digital signature
    const hash = generateVerificationHash(due.department, due.student_id);
    const rec = await getClearanceRecord(due.student_id);
    rec.departments[due.department] = {
      department: due.department,
      status: 'approved',
      digital_signature: {
        staff_name: params.staffName,
        designation: params.designation,
        department: due.department,
        timestamp: new Date().toISOString(),
        verification_hash: hash,
      },
      last_updated: new Date().toISOString(),
    };
    await saveClearanceRecord(rec);

    // Automated Email Notification to student (Requirement 1)
    const student = getStudentById(due.student_id);
    if (student) {
      await sendDepartmentStatusEmail({
        student,
        departmentId: due.department,
        status: 'Approved',
        staffName: params.staffName,
        designation: params.designation,
      });
    }

    await checkAndForwardToHod(due.student_id);
  }

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: due.student_id,
    title: `Payment Receipt Approved (${due.department.toUpperCase()})`,
    message: `Your payment receipt for ₹${due.amount} (${due.reason}) was verified and cleared by ${params.staffName}.`,
    type: 'success',
  });
}

// Department admin rejects receipt
export async function rejectReceipt(params: {
  dueId: string;
  adminComment: string;
  staffName: string;
}): Promise<void> {
  const dues = getDues();
  const due = dues.find((d) => d.id === params.dueId);
  if (!due) return;

  due.status = 'Rejected';
  due.admin_comment = params.adminComment;
  due.updated_at = new Date().toISOString();
  await saveDue(due);

  // Department status returns to 'pending' or 'rejected'
  const rec = await getClearanceRecord(due.student_id);
  rec.departments[due.department] = {
    ...rec.departments[due.department],
    status: 'pending',
    rejection_reason: `Receipt rejected: ${params.adminComment}`,
    last_updated: new Date().toISOString(),
  };
  await saveClearanceRecord(rec);

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: due.student_id,
    title: `Receipt Rejected (${due.department.toUpperCase()})`,
    message: `Your receipt for ₹${due.amount} was rejected: "${params.adminComment}". Please check reference/amount and re-upload.`,
    type: 'error',
  });

  // Automated Email Notification to student (Requirement 1)
  const student = getStudentById(due.student_id);
  if (student) {
    await sendDepartmentStatusEmail({
      student,
      departmentId: due.department,
      status: 'Denied',
      reason: `Payment receipt was rejected by ${params.staffName}: "${params.adminComment}"`,
      staffName: params.staffName,
      pendingDueAmount: due.amount,
    });
  }
}

// Department direct approve clearance (for student who has no dues)
export async function approveDepartmentClearance(params: {
  studentId: string;
  department: DepartmentId;
  staffName: string;
  designation: string;
  account?: DeptAccount;
}): Promise<void> {
  const hash = generateVerificationHash(params.department, params.studentId);
  await getClearanceRecord(params.studentId); // Ensure document exists
  const docRef = doc(db, 'clearanceRecords', params.studentId.toLowerCase());
  
  const now = new Date().toISOString();
  await updateDoc(docRef, {
    [`departments.${params.department}.department`]: params.department,
    [`departments.${params.department}.status`]: 'approved',
    [`departments.${params.department}.digital_signature`]: {
      staff_name: params.staffName,
      designation: params.designation,
      department: params.department,
      timestamp: now,
      verification_hash: hash,
    },
    [`departments.${params.department}.last_updated`]: now,
  });

  
  // Keep local storage in sync for legacy code
  const records = getClearanceRecords();
  if (records[params.studentId.toLowerCase()]) {
    records[params.studentId.toLowerCase()].departments[params.department] = {
      department: params.department,
      status: 'approved',
      digital_signature: {
        staff_name: params.staffName,
        designation: params.designation,
        department: params.department,
        timestamp: now,
        verification_hash: hash,
      },
      last_updated: now,
    };
    safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
  }

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: `Department Cleared: ${params.department.toUpperCase()}`,
    message: `${params.department.toUpperCase()} has digitally cleared your dues. Signature affixed by ${params.staffName}.`,
    type: 'success',
  });

  await checkAndForwardToHod(params.studentId);

}

// Department reject clearance
export async function rejectDepartmentClearance(params: {
  studentId: string;
  department: DepartmentId;
  reason: string;
  staffName: string;
  designation?: string;
  account?: DeptAccount;
}): Promise<void> {
  await getClearanceRecord(params.studentId); // Ensure document exists
  const docRef = doc(db, 'clearanceRecords', params.studentId.toLowerCase());
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    [`departments.${params.department}.department`]: params.department,
    [`departments.${params.department}.status`]: 'rejected',
    [`departments.${params.department}.rejection_reason`]: params.reason,
    [`departments.${params.department}.last_updated`]: now,
  });

  const records = getClearanceRecords();
  if (records[params.studentId.toLowerCase()]) {
    records[params.studentId.toLowerCase()].departments[params.department] = {
      department: params.department,
      status: 'rejected',
      rejection_reason: params.reason,
      last_updated: now,
    };

    safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
  }

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: `Clearance Disapproved: ${params.department.toUpperCase()}`,
    message: `${params.department.toUpperCase()} has disapproved your clearance. Reason: ${params.reason}.`,
    type: 'error',
  });
}


// Check if all 6 departments have approved -> trigger auto-forward to HOD or Dean
export async function checkAndForwardToHod(studentId: string): Promise<void> {
  const rec = await getClearanceRecord(studentId);
  const student = getStudentById(studentId);
  const deptKeys: DepartmentId[] = ['library', 'hostel', 'lab', 'finance', 'sports', 'itinfra'];
  const allApproved = deptKeys.every((k) => rec.departments[k]?.status === 'approved');

  if (allApproved && !rec.hod_approval) {
    const isPuc = student?.studentType === 'puc';
    const approverTitle = isPuc ? 'Dean of Academics' : 'Head of Department (HOD)';
    const recipientId = isPuc ? 'dean' : 'hod';

    await addNotification({
      recipient_type: 'student',
      recipient_id: studentId,
      title: 'All 6 Departments Cleared! Forwarded for Final Sign-off',
      message: `All six university departments have granted digital clearance. Your application is now with the ${approverTitle} for final approval.`,
      type: 'success',
    });

    await addNotification({
      recipient_type: 'hod',
      recipient_id: recipientId,
      title: `Final Sign-off Required: ${student?.name || studentId}`,
      message: `${student?.name} (${student?.id.toUpperCase()}, ${student?.branch}) has cleared all 6 departments and is awaiting your final signature.`,
      type: 'info',
    });
  }
}

// HOD or Dean final approval -> triggers certificate generation
export async function hodApproveClearance(params: {
  studentId: string;
  staffName: string;
  designation: string;
  remarks?: string;
  account?: DeptAccount;
}): Promise<{ success: boolean; error?: string }> {
  const student = getStudentById(params.studentId);
  if (!student) return { success: false, error: 'Student record not found.' };

  // Data-query & mutation level RBAC branch security check
  if (params.account && params.account.allowedBranchCodes && params.account.allowedBranchCodes.length > 0) {
    const isDirectorOrDean =
      params.account.department === 'director' ||
      params.account.department === 'dean' ||
      params.account.role === 'director' ||
      params.account.role === 'dean';

    if (!isDirectorOrDean) {
      const studentBranch = student.branchCode || getStudentBranchCode(student);
      if (!params.account.allowedBranchCodes.includes(studentBranch)) {
        return {
          success: false,
          error: `Permission Denied: Your account only has statutory jurisdiction over ${params.account.branchName || 'your branch'}. Student ${student.name} belongs to ${student.branch}.`,
        };
      }
    }
  }

  const rec = await getClearanceRecord(params.studentId);
  const certHash = generateCertificateNumber(params.studentId, student?.branch || 'ENG');
  const sigHash = generateVerificationHash('FINAL-SIG', params.studentId);

  rec.hod_approval = {
    approved: true,
    staff_name: params.staffName,
    designation: params.designation,
    timestamp: new Date().toISOString(),
    verification_hash: sigHash,
    remarks: params.remarks || 'All academic and administrative obligations cleared.',
  };
  rec.certificate_generated = true;
  rec.certificate_hash = certHash;
  rec.certificate_date = new Date().toISOString();
  await saveClearanceRecord(rec);

  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: '🎉 Digital No-Dues Certificate Issued!',
    message: `Final approval granted by ${params.staffName}. Your verified Digital No-Dues Certificate is now available for download.`,
    type: 'success',
  });

  // Automated Final Certificate Email with PDF soft-copy attachment (Requirement 2)
  await sendFinalCertificateEmail({
    student,
    record: rec,
    approverName: params.staffName,
    approverDesignation: params.designation,
    account: params.account,
  });

  return { success: true };
}

// HOD or Dean rejection
export async function hodRejectClearance(params: {
  studentId: string;
  staffName: string;
  reason: string;
  account?: DeptAccount;
}): Promise<{ success: boolean; error?: string }> {
  const student = getStudentById(params.studentId);
  if (!student) return { success: false, error: 'Student record not found.' };

  // Data-query & mutation level RBAC branch security check
  if (params.account && params.account.allowedBranchCodes && params.account.allowedBranchCodes.length > 0) {
    const isDirectorOrDean =
      params.account.department === 'director' ||
      params.account.department === 'dean' ||
      params.account.role === 'director' ||
      params.account.role === 'dean';

    if (!isDirectorOrDean) {
      const studentBranch = student.branchCode || getStudentBranchCode(student);
      if (!params.account.allowedBranchCodes.includes(studentBranch)) {
        return {
          success: false,
          error: `Permission Denied: Your account only has statutory jurisdiction over ${params.account.branchName || 'your branch'}.`,
        };
      }
    }
  }

  const rec = await getClearanceRecord(params.studentId);
  delete rec.hod_approval;
  rec.certificate_generated = false;
  // Mark one or flag
  await saveClearanceRecord(rec);

  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: 'Application Returned by HOD / Academic Authority',
    message: `Your final clearance request was returned by ${params.staffName}: "${params.reason}".`,
    type: 'error',
  });

  // Automated Email Notification to student (Requirement 1)
  await sendDepartmentStatusEmail({
    student,
    departmentId: 'hod',
    status: 'Denied',
    reason: params.reason,
    staffName: params.staffName,
    account: params.account,
  });

  return { success: true };
}

// Notifications
export function getNotifications(
  recipientType?: 'student' | 'dept' | 'hod' | 'all',
  recipientId?: string
): InAppNotification[] {
  initStorage();
  const raw = safeGetItem(STORAGE_KEYS.NOTIFICATIONS);
  const list: InAppNotification[] = raw ? JSON.parse(raw) : [];

  return list.filter((item) => {
    // 1. Broadcast notifications always display for everyone on all pages
    if (item.recipient_type === 'all' || item.recipient_id === 'all') return true;

    // 2. If no specific recipient type requested (public/landing/login pages), only broadcast items show
    if (!recipientType) return false;

    // 3. For student, dept, or hod:
    if (item.recipient_type === recipientType) {
      if (!recipientId) return true;
      return item.recipient_id.toLowerCase() === recipientId.toLowerCase();
    }
    return false;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addNotification(
  notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
): Promise<InAppNotification> {
  const newNotif: InAppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  try {
    if (db) {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    }
  } catch (err) {
    console.error("Error adding notification to Firebase:", err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rgukt_notification_updated', { detail: newNotif }));
  }

  return newNotif;
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    if (db) {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    }
  } catch (err) {
    console.error("Error marking notification read in Firebase:", err);
  }
}

export async function markAllNotificationsRead(recipientType?: 'student' | 'dept' | 'hod' | 'all', recipientId?: string): Promise<void> {
  try {
    if (!db) return;
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    
    // Batch updates would be better here, but doing sequentially/Promise.all for simplicity
    const updatePromises: Promise<void>[] = [];
    
    notificationsSnapshot.docs.forEach(docSnap => {
      const n = docSnap.data() as InAppNotification;
      let shouldMark = false;
      
      if (!n.read) {
        if (!recipientType) {
          shouldMark = true;
        } else if (n.recipient_type === 'all' || n.recipient_id === 'all') {
          shouldMark = true;
        } else if (
          n.recipient_type === recipientType &&
          (!recipientId || n.recipient_id.toLowerCase() === recipientId.toLowerCase())
        ) {
          shouldMark = true;
        }
      }
      
      if (shouldMark) {
        updatePromises.push(updateDoc(docSnap.ref, { read: true }));
      }
    });
    
    await Promise.all(updatePromises);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_notification_updated'));
    }
  } catch (err) {
    console.error("Error marking all notifications read in Firebase:", err);
  }
}

// Session persistence
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = safeGetItem(STORAGE_KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}

export async function setSession(session: AuthSession): Promise<void> {
  safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  safeRemoveItem(STORAGE_KEYS.SESSION);
}

// Reset database for test convenience
export async function resetDemoData(): Promise<void> {
  safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
  safeSetItem(
    STORAGE_KEYS.CLEARANCE_RECORDS,
    JSON.stringify(INITIAL_CLEARANCE_RECORDS)
  );
  safeSetItem(STORAGE_KEYS.DUES, JSON.stringify(INITIAL_DUES));
  safeRemoveItem(STORAGE_KEYS.NOTIFICATIONS);
  safeRemoveItem('rgukt_sent_emails');
  initStorage();
}

// Re-export email utilities for centralized access
export {
  getAllSentEmails,
  saveAllSentEmails,
  getStudentEmails,
  markEmailAsRead,
  markAllStudentEmailsAsRead,
  sendDepartmentStatusEmail,
  sendFinalCertificateEmail,
};
