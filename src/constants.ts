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
  {
    id: 'itinfra',
    name: 'IT Infrastructure',
    code: 'ITINFRA',
    location: 'Computer Center, Academic Block',
    iconName: 'Laptop',
    description: 'Laptop return, network access clearance, and hardware dues.',
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
  { code: 'PUC', label: 'Pre-University Course (PUC)', shortLabel: 'PUC' },
];

export interface AcademicAccountMapping {
  id: string;
  email: string;
  role: 'hod' | 'director' | 'dean';
  department: 'hod' | 'director' | 'dean';
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
  'doa@rguktrkv.ac.in': {
    id: 'dept-dean-puc',
    email: 'doa@rguktrkv.ac.in',
    role: 'dean',
    department: 'dean',
    name: 'Office of the Dean of Academics',
    officerName: 'Dean of Academics',
    designation: 'Dean of Academics (PUC)',
    headerTitle: 'Dean of Academics (PUC)',
    branchName: 'Pre-University Course (PUC)',
    allowedBranchCodes: ['PUC'],
    password: 'rgukt@doa2025',
    avatar: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=160&auto=format&fit=crop&q=80',
  },
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
  {
    id: 'dept-itinfra-01',
    department: 'itinfra',
    name: 'IT Infrastructure',
    email: 'itinfra@rguktrkv.ac.in',
    password: 'rgukt@itinfra2025',
    officerName: 'Prof. S. Ranga Rao',
    designation: 'Head of IT Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=160&auto=format&fit=crop&q=80',
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
      itinfra: { department: 'itinfra', status: 'pending', last_updated: new Date().toISOString() },
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
      itinfra: { department: 'itinfra', status: 'pending', last_updated: new Date().toISOString() },
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
      itinfra: { department: 'itinfra', status: 'pending', last_updated: new Date().toISOString() },
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
      itinfra: { department: 'itinfra', status: 'pending', last_updated: new Date().toISOString() },
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

export const LOGO_BASE64 = "data:image/png;base64,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";
