import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// Shift table down to 110
content = content.replace(/const tableStartY = 104;/, 'const tableStartY = 110;');

fs.writeFileSync('src/utils/certificate.ts', content);
