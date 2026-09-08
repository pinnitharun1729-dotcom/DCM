import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// Change rowHeight to 14
content = content.replace(/const rowHeight = 15;/, 'const rowHeight = 14;');

// Make sure qrY is footerY - qrSize - 3
content = content.replace(/const qrY = footerY - qrSize - 6;/, 'const qrY = footerY - qrSize - 3;');

fs.writeFileSync('src/utils/certificate.ts', content);
