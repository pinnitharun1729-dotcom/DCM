import fs from 'fs';

let content = fs.readFileSync('src/components/CertificatePreviewModal.tsx', 'utf-8');

// The line is:
// generateNoDuesPDF(student, record);
content = content.replace("generateNoDuesPDF(student, record);", "await generateNoDuesPDF(student, record);");

// And the handler needs to be async:
// const handleDownload = () => {
content = content.replace("const handleDownload = () => {", "const handleDownload = async () => {");

fs.writeFileSync('src/components/CertificatePreviewModal.tsx', content);
