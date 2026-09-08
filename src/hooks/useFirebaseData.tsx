import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { StudentProfile, StudentClearanceRecord, CodeDue, InAppNotification, EmailNotification, DeptAccount } from '../types';

interface FirebaseDataContextType {
  students: StudentProfile[];
  clearanceRecords: Record<string, StudentClearanceRecord>;
  dues: CodeDue[];
  notifications: InAppNotification[];
  emails: EmailNotification[];
  loading: boolean;
  error: string | null;
}

const FirebaseDataContext = createContext<FirebaseDataContextType | undefined>(undefined);

export const FirebaseDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [clearanceRecords, setClearanceRecords] = useState<Record<string, StudentClearanceRecord>>({});
  const [dues, setDues] = useState<CodeDue[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubStudents: () => void;
    let unsubClearance: () => void;
    let unsubDues: () => void;
    let unsubNotifs: () => void;
    let unsubEmails: () => void;

    if (!db) {
      setLoading(false);
      setError("Firebase is not configured. Please add your configuration variables in Settings.");
      return;
    }

    try {
      unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        setStudents(snapshot.docs.map(doc => doc.data() as StudentProfile));
      }, (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to load students data.");
      });

      unsubClearance = onSnapshot(collection(db, 'clearanceRecords'), (snapshot) => {
        const records: Record<string, StudentClearanceRecord> = {};
        snapshot.docs.forEach(doc => {
          records[doc.id] = doc.data() as StudentClearanceRecord;
        });
        setClearanceRecords(records);
      }, (err) => {
        console.error("Error fetching clearance records:", err);
      });

      unsubDues = onSnapshot(collection(db, 'dues'), (snapshot) => {
        setDues(snapshot.docs.map(doc => doc.data() as CodeDue));
      }, (err) => {
        console.error("Error fetching dues:", err);
      });

      unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        setNotifications(snapshot.docs.map(doc => doc.data() as InAppNotification));
      }, (err) => {
        console.error("Error fetching notifications:", err);
      });

      unsubEmails = onSnapshot(collection(db, 'emails'), (snapshot) => {
        setEmails(snapshot.docs.map(doc => doc.data() as EmailNotification));
        setLoading(false);
      }, (err) => {
        console.error("Error fetching emails:", err);
        setLoading(false);
      });

    } catch (e: any) {
      console.error("Firebase subscription error:", e);
      setError(e.message);
      setLoading(false);
    }

    return () => {
      unsubStudents?.();
      unsubClearance?.();
      unsubDues?.();
      unsubNotifs?.();
      unsubEmails?.();
    };
  }, []);

  return (
    <FirebaseDataContext.Provider value={{ students, clearanceRecords, dues, notifications, emails, loading, error }}>
      {children}
    </FirebaseDataContext.Provider>
  );
};

export const useFirebaseData = () => {
  const context = useContext(FirebaseDataContext);
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseDataProvider');
  }
  return context;
};

export const getStudentBranchCode = (
  input: Partial<StudentProfile> | string | undefined | null
) => {
  if (!input) return 'CSE';
  const branchText = typeof input === 'string' ? input : input.branch || '';
  const b = branchText.toUpperCase().trim();
  if (b.includes('EEE') || b.includes('ELECTRICAL')) return 'EEE';
  if (typeof input !== 'string' && input.branchCode) {
    if (input.branchCode === 'EEE') return 'EEE';
    if (input.branchCode === 'ECE' && (b.includes('EEE') || b.includes('ELECTRICAL'))) return 'EEE';
    return input.branchCode;
  }
  if (b.includes('AIML') || b.includes('MACHINE LEARNING') || b.includes('AI/ML')) return 'AIML';
  if (b.includes('CSE') || b.includes('COMPUTER')) return 'CSE';
  if (b.includes('ECE') || b.includes('COMMUNICATION') || b.includes('ELECTRONICS')) return 'ECE';
  if (b.includes('CIVIL') || b.includes('(CE)') || b.includes(' CE')) return 'CE';
  if (b.includes('MECH') || b.includes('(ME)') || b.includes(' ME')) return 'ME';
  if (b.includes('CHEM')) return 'CHEMICAL';
  if (b.includes('METAL') || b.includes('MME') || b.includes('MATERIALS')) return 'MME';
  return 'CSE';
};

export const useFirebaseDataForAccount = (account: DeptAccount | undefined) => {
  const data = useFirebaseData();
  
  const authorizedStudents = React.useMemo(() => {
    if (!account) return [];
    if (
      account.department === 'director' ||
      account.department === 'dean' ||
      account.role === 'director' ||
      account.role === 'dean' ||
      !account.allowedBranchCodes ||
      account.allowedBranchCodes.length === 0
    ) {
      return data.students;
    }
    const allowedSet = new Set(account.allowedBranchCodes);
    return data.students.filter((st) => {
      const bCode = st.branchCode || getStudentBranchCode(st);
      return allowedSet.has(bCode);
    });
  }, [data.students, account]);

  const authorizedClearanceRecords = React.useMemo(() => {
    const authStudentIds = new Set(authorizedStudents.map((s) => s.id.toLowerCase()));
    const filteredRecords: Record<string, StudentClearanceRecord> = {};
    Object.entries(data.clearanceRecords).forEach(([key, rec]: [string, any]) => {
      if (authStudentIds.has(key.toLowerCase()) || authStudentIds.has(rec.student_id.toLowerCase())) {
        filteredRecords[key] = rec;
      }
    });
    return filteredRecords;
  }, [data.clearanceRecords, authorizedStudents]);

  const authorizedDues = React.useMemo(() => {
    const authStudentIds = new Set(authorizedStudents.map((s) => s.id.toLowerCase()));
    return data.dues.filter((due) => authStudentIds.has(due.student_id.toLowerCase()));
  }, [data.dues, authorizedStudents]);

  return {
    ...data,
    students: authorizedStudents,
    clearanceRecords: authorizedClearanceRecords,
    dues: authorizedDues
  };
};
