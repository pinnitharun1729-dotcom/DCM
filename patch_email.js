import fs from 'fs';

let content = fs.readFileSync('src/utils/emailService.ts', 'utf-8');

// The line is:
// pdfDataUri = generateNoDuesPDFDataUri(student, record);
content = content.replace("pdfDataUri = generateNoDuesPDFDataUri(student, record);", "pdfDataUri = await generateNoDuesPDFDataUri(student, record);");

fs.writeFileSync('src/utils/emailService.ts', content);
