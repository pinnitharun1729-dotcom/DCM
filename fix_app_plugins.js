import fs from 'fs';

let content = fs.readFileSync('src/main.tsx', 'utf-8');

const pluginCode = `
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

if (Capacitor.isNativePlatform()) {
  // Hide the splash (you can also use autoHide in capacitor.config.ts)
  SplashScreen.hide().catch(console.error);

  // Configure Status Bar
  StatusBar.setStyle({ style: Style.Light }).catch(console.error);
  StatusBar.setBackgroundColor({ color: '#f8fafc' }).catch(console.error); // match bg-slate-50
}
`;

content = content.replace(
  /import App from '\.\/App';/,
  "import App from './App';\n" + pluginCode
);

fs.writeFileSync('src/main.tsx', content);
