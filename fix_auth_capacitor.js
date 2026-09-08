import fs from 'fs';

let content = fs.readFileSync('src/utils/authService.ts', 'utf-8');

// Import signInWithRedirect and getRedirectResult
content = content.replace(
  /import \{ signInWithPopup, signInWithEmailAndPassword/,
  "import { signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword"
);

// Add Capacitor core import
content = "import { Capacitor } from '@capacitor/core';\n" + content;

const loginReplacement = `
    let user;
    if (Capacitor.isNativePlatform()) {
      // For Capacitor (Android/iOS), use redirect because popup is blocked by WebViews
      await signInWithRedirect(auth, googleProvider);
      return {}; // Will reload the app, handle result in getRedirectResult
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }
`;

content = content.replace(
  /const result = await signInWithPopup\(auth, googleProvider\);\n\s*const user = result\.user;/,
  loginReplacement
);

fs.writeFileSync('src/utils/authService.ts', content);
