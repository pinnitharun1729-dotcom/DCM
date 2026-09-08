import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

const qrCodeRepl = `
  const qrSize = 18;
  const qrX = pageWidth - 16 - qrSize - 2;
  const qrY = hodBoxY + 42;
  
  doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
`;
content = content.replace(/const qrSize = 20;\s*const qrX = pageWidth - 16 - qrSize - 4;\s*const qrY = footerY - qrSize - 4;\s*doc\.addImage\(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize\);/, qrCodeRepl);

fs.writeFileSync('src/utils/certificate.ts', content);
