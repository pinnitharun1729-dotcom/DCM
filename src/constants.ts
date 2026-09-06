import { DeptAccount, DepartmentId, StudentProfile, CodeDue, StudentClearanceRecord, StudentBranchCode, Role } from './types';
import { FULL_REAL_STUDENTS } from './data/rguktStudentsData';

// Configurable SBI Collect Redirect URL placeholder as specified in prompt
export const SBI_COLLECT_URL = 'https://www.onlinesbi.sbi/sbicollect/icollecthome.htm';

export const RGUKT_INFO = {
  name: 'Rajiv Gandhi University of Knowledge Technologies',
  campus: 'RK Valley Campus (Idupulapaya)',
  state: 'Andhra Pradesh - 516330',
  motto: 'Catering to the Educational Needs of Gifted Rural Youth',
  portalName: 'Digital No-Dues & Clearance Portal',
  established: '2008',
};

export interface DepartmentMeta {
  id: DepartmentId;
  name: string;
  code: string;
  location: string;
  iconName: string;
  description: string;
}

export const DEPARTMENTS: DepartmentMeta[] = [
  {
    id: 'library',
    name: 'Central Library',
    code: 'LIB',
    location: 'Central Library Building, 2nd Floor',
    iconName: 'BookOpen',
    description: 'Book return verification, overdue book fines, and journal clearance.',
  },
  {
    id: 'hostel',
    name: 'Hostel Management',
    code: 'HOSTEL',
    location: 'Chief Warden Office, Student Amenities Block',
    iconName: 'Building',
    description: 'Room handover, inventory check, furniture damage dues, and mess bill clearance.',
  },
  {
    id: 'lab',
    name: 'Laboratories & Workshop',
    code: 'LAB',
    location: 'Academic Block-1 & Workshop Complex',
    iconName: 'FlaskConical',
    description: 'Component return, equipment inspection, and lab breakage clearance.',
  },
  {
    id: 'finance',
    name: 'Finance & Accounts Department',
    code: 'FIN',
    location: 'Administrative Block, Ground Floor',
    iconName: 'CreditCard',
    description: 'Tuition fee reconciliation, scholarship dues, and university deposits.',
  },
  {
    id: 'sports',
    name: 'Department of Physical Education & Sports',
    code: 'SPORTS',
    location: 'SAC (Student Activity Center) / Sports Complex',
    iconName: 'Trophy',
    description: 'Sports equipment return, jersey clearance, and gymnasium dues.',
  },
];

// Branch metadata for RBAC and filtering
export interface BranchOption {
  code: StudentBranchCode;
  label: string;
  shortLabel: string;
}

export const ALL_BRANCH_OPTIONS: BranchOption[] = [
  { code: 'CSE', label: 'Computer Science & Engineering (CSE)', shortLabel: 'CSE' },
  { code: 'AIML', label: 'Artificial Intelligence & Machine Learning (AIML)', shortLabel: 'AI/ML' },
  { code: 'ECE', label: 'Electronics & Communication Engineering (ECE)', shortLabel: 'ECE' },
  { code: 'EEE', label: 'Electrical & Electronics Engineering (EEE)', shortLabel: 'EEE' },
  { code: 'CE', label: 'Civil Engineering (CE)', shortLabel: 'Civil (CE)' },
  { code: 'ME', label: 'Mechanical Engineering (ME)', shortLabel: 'Mechanical (ME)' },
  { code: 'CHEMICAL', label: 'Chemical Engineering (CHEM)', shortLabel: 'Chemical' },
  { code: 'MME', label: 'Metallurgical & Materials Engineering (MME)', shortLabel: 'MME' },
];

export interface AcademicAccountMapping {
  id: string;
  email: string;
  role: 'hod' | 'director';
  department: 'hod' | 'director';
  name: string;
  officerName: string;
  designation: string;
  headerTitle: string;
  branchName: string;
  allowedBranchCodes: StudentBranchCode[];
  password: string;
  secondaryPasswords?: string[];
  avatar: string;
}

// Authorized HOD & Director Lookup Table (Strict Role & Branch Mapping)
export const ACADEMIC_ROLE_ACCOUNTS: Record<string, AcademicAccountMapping> = {
  'hod.cse@rguktrkv.ac.in': {
    id: 'dept-hod-cse',
    email: 'hod.cse@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Computer Science & AI/ML',
    officerName: 'Prof. S. Chandrasekhar Rao',
    designation: 'Head of Department (CSE & AI/ML)',
    headerTitle: 'HOD – Computer Science & Engineering (CSE & AI/ML)',
    branchName: 'Computer Science & Engineering and AI/ML',
    allowedBranchCodes: ['CSE', 'AIML'],
    password: 'rgukt@cse2025',
    secondaryPasswords: ['rgukt@hod2025'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
  },
  'hod.ece@rguktrkv.ac.in': {
    id: 'dept-hod-ece',
    email: 'hod.ece@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Electronics & Communication Engineering',
    officerName: 'Dr. K. Srinivasulu',
    designation: 'Head of Department (ECE)',
    headerTitle: 'HOD – Electronics & Communication Engineering (ECE)',
    branchName: 'Electronics & Communication Engineering (ECE)',
    allowedBranchCodes: ['ECE'],
    password: 'rgukt@ece2025',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  },
  'hod.eee@rguktrkv.ac.in': {
    id: 'dept-hod-eee',
    email: 'hod.eee@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Electrical & Electronics Engineering',
    officerName: 'Dr. P. Venkatesh',
    designation: 'Head of Department (EEE)',
    headerTitle: 'HOD – Electrical & Electronics Engineering (EEE)',
    branchName: 'Electrical & Electronics Engineering (EEE)',
    allowedBranchCodes: ['EEE'],
    password: 'rgukt@eee2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  },
  'hod.ce@rguktrkv.ac.in': {
    id: 'dept-hod-ce',
    email: 'hod.ce@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Civil Engineering',
    officerName: 'Dr. B. Venkata Ramana',
    designation: 'Head of Department (Civil Engineering)',
    headerTitle: 'HOD – Civil Engineering (CE)',
    branchName: 'Civil Engineering (CE)',
    allowedBranchCodes: ['CE'],
    password: 'rgukt@ce2025',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  },
  'hod.me@rguktrkv.ac.in': {
    id: 'dept-hod-me',
    email: 'hod.me@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Mechanical Engineering',
    officerName: 'Prof. M. Raghunath',
    designation: 'Head of Department (Mechanical Engineering)',
    headerTitle: 'HOD – Mechanical Engineering (ME)',
    branchName: 'Mechanical Engineering (ME)',
    allowedBranchCodes: ['ME'],
    password: 'rgukt@me2025',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
  },
  'hod.chem@rguktrkv.ac.in': {
    id: 'dept-hod-chem',
    email: 'hod.chem@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Chemical Engineering',
    officerName: 'Dr. T. Sudhakar',
    designation: 'Head of Department (Chemical Engineering)',
    headerTitle: 'HOD – Chemical Engineering (CHEM)',
    branchName: 'Chemical Engineering (CHEM)',
    allowedBranchCodes: ['CHEMICAL'],
    password: 'rgukt@chem2025',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  },
  'hod.mme@rguktrkv.ac.in': {
    id: 'dept-hod-mme',
    email: 'hod.mme@rguktrkv.ac.in',
    role: 'hod',
    department: 'hod',
    name: 'Department of Metallurgical & Materials Engineering',
    officerName: 'Dr. N. Rajesh Kumar',
    designation: 'Head of Department (MME)',
    headerTitle: 'HOD – Metallurgical & Materials Engineering (MME)',
    branchName: 'Metallurgical & Materials Engineering (MME)',
    allowedBranchCodes: ['MME'],
    password: 'rgukt@mme2025',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
  },
  'director@rguktrkv.ac.in': {
    id: 'dept-director-academics',
    email: 'director@rguktrkv.ac.in',
    role: 'director',
    department: 'director',
    name: 'Directorate of Academic Affairs',
    officerName: 'Prof. K. Sandhya Rani',
    designation: 'Director of Academics & Institutional Approvals',
    headerTitle: 'Director of Academics',
    branchName: 'All Branches (Institutional Oversight)',
    allowedBranchCodes: ['CSE', 'AIML', 'ECE', 'EEE', 'CE', 'ME', 'CHEMICAL', 'MME'],
    password: 'rgukt@director2025',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  },
};

// Full real dataset of 81 RGUKT students imported from the official roster
export const SEED_STUDENTS: StudentProfile[] = FULL_REAL_STUDENTS;

// Core statutory department admin accounts
export const STATUTORY_DEPT_ACCOUNTS: DeptAccount[] = [
  {
    id: 'dept-lib-01',
    department: 'library',
    name: 'Central Library',
    email: 'library@rguktrkv.ac.in',
    password: 'rgukt@lib2025',
    officerName: 'Dr. K. Venkat Rao',
    designation: 'University Librarian & Head of Central Library',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'dept-hostel-01',
    department: 'hostel',
    name: 'Hostel Management',
    email: 'hostel@rguktrkv.ac.in',
    password: 'rgukt@hostel2025',
    officerName: 'Prof. M. Suresh Kumar',
    designation: 'Chief Warden & Hostel Administrative Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'dept-lab-01',
    department: 'lab',
    name: 'Laboratories & Workshop',
    email: 'lab@rguktrkv.ac.in',
    password: 'rgukt@lab2025',
    officerName: 'Dr. P. Ramesh Babu',
    designation: 'Central Lab In-charge & Workshop Superintendent',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'dept-fin-01',
    department: 'finance',
    name: 'Finance Department',
    email: 'finance@rguktrkv.ac.in',
    password: 'rgukt@fin2025',
    officerName: 'Mrs. G. Lakshmi Prasanna',
    designation: 'Finance Officer & Comptroller',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'dept-sports-01',
    department: 'sports',
    name: 'Sports & Physical Education',
    email: 'sports@rguktrkv.ac.in',
    password: 'rgukt@sports2025',
    officerName: 'Mr. B. Naidu',
    designation: 'Physical Director & Head of Athletics',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
  },
];

// Dedicated Internal Account for Transaction & Receipt Verification (Finance Officer)
export const TRANSACTION_VERIFICATION_ACCOUNT: DeptAccount = {
  id: 'dept-tx-verification-01',
  department: 'verification_officer',
  name: 'Transaction Verification Office',
  email: 'verify@rguktrkv.ac.in',
  password: 'rgukt@vfy2025',
  officerName: 'Mr. K. Raghava Rao',
  designation: 'Finance Officer (Transaction Verification)',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  role: 'verification_officer',
  headerTitle: 'Finance & Accounts – Transaction Verification Office',
};

// Combine all statutory, verification, and academic role accounts into full reference list
export const SEED_DEPT_ACCOUNTS: DeptAccount[] = [
  ...STATUTORY_DEPT_ACCOUNTS,
  TRANSACTION_VERIFICATION_ACCOUNT,
  ...Object.values(ACADEMIC_ROLE_ACCOUNTS).map((acc) => ({
    id: acc.id,
    department: acc.department,
    name: acc.name,
    email: acc.email,
    password: acc.password,
    officerName: acc.officerName,
    designation: acc.designation,
    avatar: acc.avatar,
    role: acc.role as Role,
    headerTitle: acc.headerTitle,
    branchName: acc.branchName,
    allowedBranchCodes: acc.allowedBranchCodes,
  })),
];

export const INITIAL_DUES: CodeDue[] = [
  // Vikrant (r240086, CSE) - Unpaid library fine + unpaid hostel breakage fee (ready to test Pay Now + Receipt upload)
  {
    id: 'due-01',
    student_id: 'r240086',
    department: 'library',
    reason: 'Overdue textbook fine: "Computer Organization and Architecture" by Stallings (42 days overdue)',
    amount: 350,
    status: 'Unpaid',
    created_at: '2025-05-10T10:15:00Z',
    updated_at: '2025-05-10T10:15:00Z',
  },
  {
    id: 'due-02',
    student_id: 'r240086',
    department: 'hostel',
    reason: 'Hostel Block-K Room 204: Replacement fee for damaged window mesh & lock',
    amount: 600,
    status: 'Unpaid',
    created_at: '2025-05-12T14:30:00Z',
    updated_at: '2025-05-12T14:30:00Z',
  },

  // Tharun Pinninti (r240212, CSE) - Submitted receipt for Lab fee awaiting Transaction Verification by Finance Officer!
  {
    id: 'due-03',
    student_id: 'r240212',
    department: 'lab',
    reason: 'Data Structures Lab: FPGA development kit cable replacement',
    amount: 450,
    status: 'Receipt Submitted',
    verification_status: 'Pending',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    receipt_file_name: 'SBI_Collect_Receipt_DUK88291.pdf',
    transaction_ref: 'DUK882910492',
    created_at: '2025-05-14T09:00:00Z',
    updated_at: '2025-05-15T11:20:00Z',
  },

  // Kondakrindi Navyakala (o240635, AIML) - Unpaid library fine
  {
    id: 'due-04',
    student_id: 'o240635',
    department: 'library',
    reason: 'Reference book overdue: "Pattern Recognition and Machine Learning" by Bishop',
    amount: 250,
    status: 'Unpaid',
    created_at: '2025-05-16T11:00:00Z',
    updated_at: '2025-05-16T11:00:00Z',
  },

  // Jai Sai Nagendra (r240359, ECE) - Unpaid sports fine
  {
    id: 'due-05',
    student_id: 'r240359',
    department: 'sports',
    reason: 'Table tennis bat rubber replacement and missing indoor equipment',
    amount: 280,
    status: 'Unpaid',
    created_at: '2025-05-18T16:00:00Z',
    updated_at: '2025-05-18T16:00:00Z',
  },

  // Kola Chakradhar (r240098, ME) - Workshop due
  {
    id: 'due-06',
    student_id: 'r240098',
    department: 'lab',
    reason: 'Foundry & Welding Workshop: High-carbon steel turning tool bit breakage',
    amount: 520,
    status: 'Unpaid',
    created_at: '2025-05-19T10:00:00Z',
    updated_at: '2025-05-19T10:00:00Z',
  },

  // B. Avinash (o241031, Chemical) - Finance due
  {
    id: 'due-07',
    student_id: 'o241031',
    department: 'finance',
    reason: 'Semester examination fee balance reconciliation & university deposit adjustment',
    amount: 800,
    status: 'Unpaid',
    created_at: '2025-05-20T09:30:00Z',
    updated_at: '2025-05-20T09:30:00Z',
  },
];

export const INITIAL_CLEARANCE_RECORDS: Record<string, StudentClearanceRecord> = {
  // Vikrant (r240086, CSE) - 2 dues pending (library, hostel), lab & sports approved, finance approved
  r240086: {
    student_id: 'r240086',
    departments: {
      library: {
        department: 'library',
        status: 'pending',
        last_updated: '2025-05-10T10:15:00Z',
      },
      hostel: {
        department: 'hostel',
        status: 'pending',
        last_updated: '2025-05-12T14:30:00Z',
      },
      lab: {
        department: 'lab',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. P. Ramesh Babu',
          designation: 'Central Lab In-charge',
          department: 'Laboratories & Workshop',
          timestamp: '2025-05-13T16:45:10Z',
          verification_hash: 'RGUKT-SIG-LAB-9F2B487A',
        },
        last_updated: '2025-05-13T16:45:10Z',
      },
      finance: {
        department: 'finance',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mrs. G. Lakshmi Prasanna',
          designation: 'Finance Officer',
          department: 'Finance & Accounts',
          timestamp: '2025-05-14T11:20:05Z',
          verification_hash: 'RGUKT-SIG-FIN-4C8D105E',
        },
        last_updated: '2025-05-14T11:20:05Z',
      },
      sports: {
        department: 'sports',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mr. B. Naidu',
          designation: 'Physical Director',
          department: 'Sports & Physical Ed',
          timestamp: '2025-05-11T12:00:00Z',
          verification_hash: 'RGUKT-SIG-SPT-7E1A990B',
        },
        last_updated: '2025-05-11T12:00:00Z',
      },
    },
    certificate_generated: false,
  },

  // Tharun Pinninti (r240212, CSE) - Library, Hostel, Finance, Sports approved; Lab is under review with submitted receipt!
  r240212: {
    student_id: 'r240212',
    departments: {
      library: {
        department: 'library',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. K. Venkat Rao',
          designation: 'University Librarian',
          department: 'Central Library',
          timestamp: '2025-05-11T15:00:00Z',
          verification_hash: 'RGUKT-SIG-LIB-1188AF2C',
        },
        last_updated: '2025-05-11T15:00:00Z',
      },
      hostel: {
        department: 'hostel',
        status: 'approved',
        digital_signature: {
          staff_name: 'Prof. M. Suresh Kumar',
          designation: 'Chief Warden',
          department: 'Hostel Management',
          timestamp: '2025-05-12T10:15:00Z',
          verification_hash: 'RGUKT-SIG-HST-2299CD4E',
        },
        last_updated: '2025-05-12T10:15:00Z',
      },
      lab: {
        department: 'lab',
        status: 'under_review',
        last_updated: '2025-05-15T11:20:00Z',
      },
      finance: {
        department: 'finance',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mrs. G. Lakshmi Prasanna',
          designation: 'Finance Officer',
          department: 'Finance & Accounts',
          timestamp: '2025-05-13T09:40:00Z',
          verification_hash: 'RGUKT-SIG-FIN-33AAEF5F',
        },
        last_updated: '2025-05-13T09:40:00Z',
      },
      sports: {
        department: 'sports',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mr. B. Naidu',
          designation: 'Physical Director',
          department: 'Sports & Physical Ed',
          timestamp: '2025-05-10T14:10:00Z',
          verification_hash: 'RGUKT-SIG-SPT-44BBFF6A',
        },
        last_updated: '2025-05-10T14:10:00Z',
      },
    },
    certificate_generated: false,
  },

  // Panjagalla Varshitha (r240639, EEE) - ALL 5 DEPARTMENTS APPROVED! Sitting in HOD queue awaiting final sign-off!
  r240639: {
    student_id: 'r240639',
    departments: {
      library: {
        department: 'library',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. K. Venkat Rao',
          designation: 'University Librarian',
          department: 'Central Library',
          timestamp: '2025-05-08T10:00:00Z',
          verification_hash: 'RGUKT-SIG-LIB-55CC1122',
        },
        last_updated: '2025-05-08T10:00:00Z',
      },
      hostel: {
        department: 'hostel',
        status: 'approved',
        digital_signature: {
          staff_name: 'Prof. M. Suresh Kumar',
          designation: 'Chief Warden',
          department: 'Hostel Management',
          timestamp: '2025-05-09T11:30:00Z',
          verification_hash: 'RGUKT-SIG-HST-66DD3344',
        },
        last_updated: '2025-05-09T11:30:00Z',
      },
      lab: {
        department: 'lab',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. P. Ramesh Babu',
          designation: 'Central Lab In-charge',
          department: 'Laboratories & Workshop',
          timestamp: '2025-05-10T12:00:00Z',
          verification_hash: 'RGUKT-SIG-LAB-77EE5566',
        },
        last_updated: '2025-05-10T12:00:00Z',
      },
      finance: {
        department: 'finance',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mrs. G. Lakshmi Prasanna',
          designation: 'Finance Officer',
          department: 'Finance & Accounts',
          timestamp: '2025-05-10T14:20:00Z',
          verification_hash: 'RGUKT-SIG-FIN-88FF7788',
        },
        last_updated: '2025-05-10T14:20:00Z',
      },
      sports: {
        department: 'sports',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mr. B. Naidu',
          designation: 'Physical Director',
          department: 'Sports & Physical Ed',
          timestamp: '2025-05-09T16:00:00Z',
          verification_hash: 'RGUKT-SIG-SPT-990099AA',
        },
        last_updated: '2025-05-09T16:00:00Z',
      },
    },
    certificate_generated: false,
  },

  // A. Sarath (s241324, Chemical) - ALL 5 DEPARTMENTS APPROVED & Endorsed by HOD! Certificate generated!
  s241324: {
    student_id: 's241324',
    departments: {
      library: {
        department: 'library',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. K. Venkat Rao',
          designation: 'University Librarian',
          department: 'Central Library',
          timestamp: '2025-05-05T09:30:00Z',
          verification_hash: 'RGUKT-SIG-LIB-A1B2C3D4',
        },
        last_updated: '2025-05-05T09:30:00Z',
      },
      hostel: {
        department: 'hostel',
        status: 'approved',
        digital_signature: {
          staff_name: 'Prof. M. Suresh Kumar',
          designation: 'Chief Warden',
          department: 'Hostel Management',
          timestamp: '2025-05-06T10:00:00Z',
          verification_hash: 'RGUKT-SIG-HST-E5F6A7B8',
        },
        last_updated: '2025-05-06T10:00:00Z',
      },
      lab: {
        department: 'lab',
        status: 'approved',
        digital_signature: {
          staff_name: 'Dr. P. Ramesh Babu',
          designation: 'Central Lab In-charge',
          department: 'Laboratories & Workshop',
          timestamp: '2025-05-06T14:15:00Z',
          verification_hash: 'RGUKT-SIG-LAB-C9D0E1F2',
        },
        last_updated: '2025-05-06T14:15:00Z',
      },
      finance: {
        department: 'finance',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mrs. G. Lakshmi Prasanna',
          designation: 'Finance Officer',
          department: 'Finance & Accounts',
          timestamp: '2025-05-07T11:00:00Z',
          verification_hash: 'RGUKT-SIG-FIN-A3B4C5D6',
        },
        last_updated: '2025-05-07T11:00:00Z',
      },
      sports: {
        department: 'sports',
        status: 'approved',
        digital_signature: {
          staff_name: 'Mr. B. Naidu',
          designation: 'Physical Director',
          department: 'Sports & Physical Ed',
          timestamp: '2025-05-05T16:30:00Z',
          verification_hash: 'RGUKT-SIG-SPT-E7F8A9B0',
        },
        last_updated: '2025-05-05T16:30:00Z',
      },
    },
    hod_approval: {
      approved: true,
      staff_name: 'Dr. K. Srinivasulu Reddy',
      designation: 'Head of Department (Chemical Engineering)',
      timestamp: '2025-05-08T15:00:00Z',
      verification_hash: 'RGUKT-SIG-HOD-CHEM-F43892EA',
      remarks: 'All laboratory work stations, pilot plant equipment, and library requisites cleared.',
    },
    certificate_generated: true,
    certificate_hash: 'RGUKT-CERT-ENGG-2025-S241324-78B4E1',
    certificate_date: '2025-05-08T15:05:00Z',
  },
};
