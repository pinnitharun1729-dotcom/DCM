/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

// Use environment variables for Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const db = firebaseConfig.apiKey ? getFirestore(app!) : null;
export const auth = firebaseConfig.apiKey ? getAuth(app!) : null;

export const googleProvider = new GoogleAuthProvider();

// Google Identity Services (GIS) OAuth Client ID
// Explicitly defining the Client ID for any raw GIS/One Tap implementations.
// Note: For standard Firebase signInWithPopup, this Client ID must also be 
// configured in the Firebase Console (Authentication > Sign-in method > Google).
export const GOOGLE_CLIENT_ID = "473450817298-09h3eevnmc7mh2lirhi0nlb9b0eulgqv.apps.googleusercontent.com";


// Messaging is only supported in browsers with Service Workers & Push API
let messagingInstance = null;
if (firebaseConfig.apiKey) {
  try {
    messagingInstance = getMessaging(app);
  } catch (e) {
    console.warn("Firebase Messaging is not supported in this environment.", e);
  }
}
export const messaging = messagingInstance;

// FCM VAPID Key Placeholder
export const VAPID_KEY = "YOUR_VAPID_KEY_HERE";
