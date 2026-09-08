import fs from 'fs';

let content = fs.readFileSync('src/firebaseConfig.ts', 'utf-8');

// Add the client ID configuration
const googleProviderReplacement = `
export const googleProvider = new GoogleAuthProvider();

// Google Identity Services (GIS) OAuth Client ID
// Explicitly defining the Client ID for any raw GIS/One Tap implementations.
// Note: For standard Firebase signInWithPopup, this Client ID must also be 
// configured in the Firebase Console (Authentication > Sign-in method > Google).
export const GOOGLE_CLIENT_ID = "473450817298-09h3eevnmc7mh2lirhi0nlb9b0eulgqv.apps.googleusercontent.com";
`;

content = content.replace(
  /export const googleProvider = new GoogleAuthProvider\(\);/,
  googleProviderReplacement
);

fs.writeFileSync('src/firebaseConfig.ts', content);
