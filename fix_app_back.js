import fs from 'fs';

let content = fs.readFileSync('src/main.tsx', 'utf-8');

const pluginCode = `
import { App as CapApp } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  // Handle Android hardware back button
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      CapApp.exitApp();
    } else {
      window.history.back();
    }
  });
}
`;

content = content.replace(
  /if \(Capacitor\.isNativePlatform\(\)\) \{/,
  pluginCode + "\nif (Capacitor.isNativePlatform()) {"
);

fs.writeFileSync('src/main.tsx', content);
