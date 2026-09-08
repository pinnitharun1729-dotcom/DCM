import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { StudentProfile, StudentClearanceRecord, CodeDue, InAppNotification, EmailNotification } from '../types';

export const collections = {
  students: collection(db, 'students'),
  clearanceRecords: collection(db, 'clearanceRecords'),
  dues: collection(db, 'dues'),
  notifications: collection(db, 'notifications'),
  emails: collection(db, 'emails')
};

export async function fetchAllStudents(): Promise<StudentProfile[]> {
  const snapshot = await getDocs(collections.students);
  return snapshot.docs.map(doc => doc.data() as StudentProfile);
}

export async function fetchStudentClearanceRecord(studentId: string): Promise<StudentClearanceRecord | null> {
  const docRef = doc(db, 'clearanceRecords', studentId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() as StudentClearanceRecord : null;
}

export async function saveStudentClearanceRecord(studentId: string, record: StudentClearanceRecord): Promise<void> {
  const docRef = doc(db, 'clearanceRecords', studentId);
  await setDoc(docRef, record, { merge: true });
}

export async function fetchAllClearanceRecords(): Promise<Record<string, StudentClearanceRecord>> {
  const snapshot = await getDocs(collections.clearanceRecords);
  const records: Record<string, StudentClearanceRecord> = {};
  snapshot.docs.forEach(doc => {
    records[doc.id] = doc.data() as StudentClearanceRecord;
  });
  return records;
}

export async function fetchDues(): Promise<CodeDue[]> {
  const snapshot = await getDocs(collections.dues);
  return snapshot.docs.map(doc => doc.data() as CodeDue);
}

export async function saveDue(due: CodeDue): Promise<void> {
  const docRef = doc(db, 'dues', due.id);
  await setDoc(docRef, due, { merge: true });
}

export async function deleteDueFromFirebase(dueId: string): Promise<void> {
  const docRef = doc(db, 'dues', dueId);
  await deleteDoc(docRef);
}

export async function updateDueInFirebase(dueId: string, updates: Partial<CodeDue>): Promise<void> {
  const docRef = doc(db, 'dues', dueId);
  await updateDoc(docRef, updates);
}

export async function fetchNotifications(): Promise<InAppNotification[]> {
  const snapshot = await getDocs(collections.notifications);
  return snapshot.docs.map(doc => doc.data() as InAppNotification);
}

export async function saveNotification(notif: InAppNotification): Promise<void> {
  const docRef = doc(db, 'notifications', notif.id);
  await setDoc(docRef, notif, { merge: true });
}

export async function fetchEmails(): Promise<EmailNotification[]> {
  const snapshot = await getDocs(collections.emails);
  return snapshot.docs.map(doc => doc.data() as EmailNotification);
}

export async function saveEmailNotification(email: EmailNotification): Promise<void> {
  const docRef = doc(db, 'emails', email.id);
  await setDoc(docRef, email, { merge: true });
}
