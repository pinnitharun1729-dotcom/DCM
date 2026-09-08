import fs from 'fs';

const newLogoBase64 = fs.readFileSync('official_logo.txt', 'utf-8').trim();
const newLogoStr = `export const LOGO_BASE64 = "data:image/png;base64,${newLogoBase64}";\n`;

let constants = fs.readFileSync('src/constants.ts', 'utf-8');
// replace the existing LOGO_BASE64 export
constants = constants.replace(/export const LOGO_BASE64 = "data:image\/png;base64,.*?";\n/s, newLogoStr);

fs.writeFileSync('src/constants.ts', constants);
