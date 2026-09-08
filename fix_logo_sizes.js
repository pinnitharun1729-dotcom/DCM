import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// Fix watermark size and position
// Width = 93, Height = 120
// x = (210 - 93) / 2 = 58.5
// y = (297 - 120) / 2 = 88.5
content = content.replace(
  /doc\.addImage\(LOGO_BASE64, 'PNG', \(pageWidth - 120\) \/ 2, \(pageHeight - 120\) \/ 2, 120, 120\);/,
  "doc.addImage(LOGO_BASE64, 'PNG', (pageWidth - 93) / 2, (pageHeight - 120) / 2, 93, 120);"
);

// Fix top-left logo size and position
// Let's use height = 20, width = 15.5. x = 16, y = 16
content = content.replace(
  /doc\.addImage\(LOGO_BASE64, 'PNG', 20, 16, 20, 20\);/,
  "doc.addImage(LOGO_BASE64, 'PNG', 16, 16, 15.5, 20);"
);

fs.writeFileSync('src/utils/certificate.ts', content);
