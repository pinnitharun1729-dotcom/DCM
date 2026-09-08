import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// Fix candidate name
content = content.replace(
  /doc\.text\(student\.name, 45, 67\);/,
  "const splitName = doc.splitTextToSize(student.name, 75);\n  doc.text(splitName, 45, splitName.length > 1 ? 65.5 : 67);"
);

// Fix email
content = content.replace(
  /doc\.text\(student\.email, 45, 81\);/,
  "const splitEmail = doc.splitTextToSize(student.email, 75);\n  doc.text(splitEmail, 45, splitEmail.length > 1 ? 79.5 : 81);"
);

fs.writeFileSync('src/utils/certificate.ts', content);
