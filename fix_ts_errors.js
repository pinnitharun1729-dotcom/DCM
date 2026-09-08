import fs from 'fs';

let cert = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

cert = cert.replace(
  "export function generateNoDuesPDFFilename(student: StudentProfile): Promise<string> {",
  "export function generateNoDuesPDFFilename(student: StudentProfile): string {"
);

cert = cert.replace(
  "export async function generateNoDuesPDFDataUri(\n  student: StudentProfile,\n  record: StudentClearanceRecord\n): string {",
  "export async function generateNoDuesPDFDataUri(\n  student: StudentProfile,\n  record: StudentClearanceRecord\n): Promise<string> {"
);

// fix gstate
cert = cert.replace("doc.setGState(new doc.GState({opacity: 0.08}));", "// @ts-ignore\n  doc.setGState(new doc.GState({opacity: 0.08}));");
cert = cert.replace("doc.setGState(new doc.GState({opacity: 1.0}));", "// @ts-ignore\n  doc.setGState(new doc.GState({opacity: 1.0}));");

fs.writeFileSync('src/utils/certificate.ts', cert);

let email = fs.readFileSync('src/utils/emailService.ts', 'utf-8');
email = email.replace("const pdfFilename = generateNoDuesPDFFilename(student);", "const pdfFilename = generateNoDuesPDFFilename(student);");
// wait, emailService had an error: `src/utils/emailService.ts(424,9): error TS2322: Type 'Promise<string>' is not assignable to type 'string'.`
// Let's check where that is.
