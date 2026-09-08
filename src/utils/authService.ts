import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { auth, db, googleProvider, messaging, VAPID_KEY } from '../firebaseConfig';
import { StudentProfile, DeptAccount, AuthSession } from '../types';
import { ACADEMIC_ROLE_ACCOUNTS, STATUTORY_DEPT_ACCOUNTS, TRANSACTION_VERIFICATION_ACCOUNT } from '../constants';
import { buildStudentProfiles } from '../data/rguktStudentsData'; // For generating profile if missing

async function saveFcmToken(userId: string) {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        await setDoc(doc(db, 'fcmTokens', userId), { token, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve FCM token', error);
  }
}

export async function loginWithGoogle(): Promise<{ session?: AuthSession; error?: string }> {
  try {
    if (!auth) {
      return { error: 'Firebase is not configured. Please add your Firebase configuration variables in the AI Studio Settings (Secrets).' };
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email?.toLowerCase();

    if (!email) {
      return { error: 'Failed to retrieve email from Google login.' };
    }

    const userId = user.uid;
    // Save FCM token in background
    saveFcmToken(userId);

    // Check if it's a Faculty/Admin account
    const isAcademic = ACADEMIC_ROLE_ACCOUNTS[email];
    if (isAcademic) {
      let role = 'dept_admin';
      if (isAcademic.department === 'director' || isAcademic.role === 'director') role = 'director';
      else if (isAcademic.department === 'hod' || isAcademic.role === 'hod') role = 'hod';
      else if (isAcademic.department === 'dean' || isAcademic.role === 'dean') role = 'dean';

      return {
        session: {
          role: role as any,
          deptAccount: isAcademic as DeptAccount,
          activeDepartment: isAcademic.department as any,
        }
      };
    }

    const isStatutory = STATUTORY_DEPT_ACCOUNTS.find(a => a.email.toLowerCase() === email);
    if (isStatutory) {
      return {
        session: {
          role: 'dept_admin',
          deptAccount: isStatutory as DeptAccount,
          activeDepartment: isStatutory.department as any,
        }
      };
    }

    if (email === TRANSACTION_VERIFICATION_ACCOUNT.email.toLowerCase()) {
      return {
        session: {
          role: 'verification_officer',
          deptAccount: TRANSACTION_VERIFICATION_ACCOUNT as DeptAccount,
          activeDepartment: 'verification_officer' as any,
        }
      };
    }

    // Otherwise, assume it's a Student
    if (!email.endsWith('@rguktrkv.ac.in')) {
      if (auth) await signOut(auth);
      return { error: 'Access restricted to rguktrkv.ac.in domain only.' };
    }

    const rollNumber = email.split('@')[0].toUpperCase();
    const studentId = rollNumber.toLowerCase();

    // Check Firestore for existing student record
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    let studentProfile: StudentProfile;

    if (studentSnap.exists()) {
      studentProfile = studentSnap.data() as StudentProfile;
    } else {
      // Fallback: Check if they are in the hardcoded SEED list or create a generic profile
      const allSeeds = buildStudentProfiles();
      const seed = allSeeds.find(s => s.id === studentId);
      if (seed) {
        studentProfile = seed;
      } else {
        studentProfile = {
          id: studentId,
          rollNumber: rollNumber,
          name: user.displayName || 'Unknown Student',
          email: email,
          branch: 'General', // Would need real data mapping
          branchCode: 'CSE',
          batch: 'Unknown',
          studentType: rollNumber.startsWith('R') || rollNumber.startsWith('O') || rollNumber.startsWith('S') ? 'engineering' : 'puc',
          gender: 'M',
          photoUrl: user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${studentId}`,
          phone: '',
          admissionYear: new Date().getFullYear(),
          passwordHash: '',
          hasChangedPassword: true,
        };
      }
      // Save to Firestore
      await setDoc(studentRef, studentProfile);
    }

    return {
      session: {
        role: 'student',
        student: studentProfile
      }
    };

  } catch (error: any) {
    console.error('Google Sign-In Error', error);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      // User cancelled the login, just return empty to not show a red error box
      return { error: 'cancelled' };
    }
    
    let errorMessage = error.message || 'An error occurred during sign-in.';
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error: Please check your internet connection, disable ad-blockers, or try opening the app in a new tab if you are inside a preview iframe.';
    }
    return { error: errorMessage };
  }
}

export async function loginFacultyWithPassword(email: string, password: string): Promise<{ session?: AuthSession; error?: string }> {
  try {
    if (!auth) {
      return { error: 'Firebase is not configured. Please add your Firebase configuration variables in the AI Studio Settings (Secrets).' };
    }

    const userEmailForCheck = email.toLowerCase();
    const isAcademic = ACADEMIC_ROLE_ACCOUNTS[userEmailForCheck];
    const isStatutory = STATUTORY_DEPT_ACCOUNTS.find(a => a.email.toLowerCase() === userEmailForCheck);
    const isVerification = userEmailForCheck === TRANSACTION_VERIFICATION_ACCOUNT.email.toLowerCase();

    if (!isAcademic && !isStatutory && !isVerification) {
      return { error: 'Unauthorized email address or not recognized as a Faculty/Admin account.' };
    }

    let result;
    try {
      result = await signInWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials') {
        try {
          result = await createUserWithEmailAndPassword(auth, email, password);
        } catch (createError) {
          throw authError;
        }
      } else {
        throw authError;
      }
    }
    const user = result.user;
    const userEmail = user.email?.toLowerCase();

    if (!userEmail) {
      return { error: 'Failed to retrieve email from login.' };
    }

    const userId = user.uid;
    // Save FCM token in background
    saveFcmToken(userId);

    // Check if it's a Faculty/Admin account
    if (isAcademic) {
      let role = 'dept_admin';
      if (isAcademic.department === 'director' || isAcademic.role === 'director') role = 'director';
      else if (isAcademic.department === 'hod' || isAcademic.role === 'hod') role = 'hod';
      else if (isAcademic.department === 'dean' || isAcademic.role === 'dean') role = 'dean';

      return {
        session: {
          role: role as any,
          deptAccount: isAcademic as DeptAccount,
          activeDepartment: isAcademic.department as any,
        }
      };
    }

    if (isStatutory) {
      return {
        session: {
          role: 'dept_admin',
          deptAccount: isStatutory as DeptAccount,
          activeDepartment: isStatutory.department as any,
        }
      };
    }

    if (isVerification) {
      return {
        session: {
          role: 'verification_officer',
          deptAccount: TRANSACTION_VERIFICATION_ACCOUNT as DeptAccount,
          activeDepartment: 'verification_officer' as any,
        }
      };
    }

    // Not recognized as faculty
    if (auth) await signOut(auth);
    return { error: 'Unauthorized email address or not recognized as a Faculty/Admin account.' };

  } catch (error: any) {
    console.error('Email/Password Sign-In Error', error);
    let errorMessage = error.message || 'Incorrect email or password.';
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error: Please check your internet connection, disable ad-blockers, or try opening the app in a new tab if you are inside a preview iframe.';
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMessage = 'Incorrect email or password.';
    }
    return { error: errorMessage };
  }
}
