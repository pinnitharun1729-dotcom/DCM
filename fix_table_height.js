import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// Change rowHeight from 16 to 15
content = content.replace(/const rowHeight = 16;/, 'const rowHeight = 15;');

// Also ensure QR code fits nicely below HOD box
// Let's position it at footerY - qrSize - 4
content = content.replace(/const qrY = hodBoxY \+ 42;/, 'const qrY = footerY - qrSize - 6;');

fs.writeFileSync('src/utils/certificate.ts', content);
