import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');
const logoBase64 = fs.readFileSync('rgukt_logo_base64.txt', 'utf-8');

// Add imports
if (!content.includes('import QRCode')) {
  content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport QRCode from 'qrcode';");
}

// Make functions async
content = content.replace("export function buildNoDuesDoc(", "export async function buildNoDuesDoc(");
content = content.replace("): jsPDF {", "): Promise<jsPDF> {");

content = content.replace("export function generateNoDuesPDF(", "export async function generateNoDuesPDF(");
content = content.replace("): void {", "): Promise<void> {");
content = content.replace("const doc = buildNoDuesDoc(student, record);", "const doc = await buildNoDuesDoc(student, record);");

content = content.replace("export function generateNoDuesPDFDataUri(", "export async function generateNoDuesPDFDataUri(");
content = content.replace("): string {", "): Promise<string> {");
content = content.replace("const doc = buildNoDuesDoc(student, record);", "const doc = await buildNoDuesDoc(student, record);");

// Add watermark
const logoCode = `
  // Background Watermark (opacity 0.08)
  doc.setGState(new doc.GState({opacity: 0.08}));
  // Center of the page, size 120x120
  doc.addImage(LOGO_BASE64, 'PNG', (pageWidth - 120) / 2, (pageHeight - 120) / 2, 120, 120);
  doc.setGState(new doc.GState({opacity: 1.0}));
`;

content = content.replace("  // University Header", logoCode + "\n  // University Header");

// Add Logo
const topLogoCode = `
  // College Logo top-left
  doc.addImage(LOGO_BASE64, 'PNG', 20, 18, 16, 16);
`;
content = content.replace("  // University Header", "  // University Header\n" + topLogoCode);

// Adjust title position to accommodate logo
content = content.replace("doc.text(RGUKT_INFO.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });", "doc.text(RGUKT_INFO.name.toUpperCase(), (pageWidth / 2) + 5, 20, { align: 'center' });");
content = content.replace("`${RGUKT_INFO.campus}, ${RGUKT_INFO.state} (Est. ${RGUKT_INFO.established})`,\n    pageWidth / 2,", "`${RGUKT_INFO.campus}, ${RGUKT_INFO.state} (Est. ${RGUKT_INFO.established})`,\n    (pageWidth / 2) + 5,");
content = content.replace("'OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE',\n    pageWidth / 2,", "'OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE',\n    (pageWidth / 2) + 5,");

// Add QR Code at bottom right
const certNoExtract = "const certNo = record.certificate_hash || `RGUKT-RKV/ND/${new Date().getFullYear()}/${student.id.toUpperCase()}`;";
const issueDateExtract = "const issueDate = record.certificate_date ? formatTimestamp(record.certificate_date) : formatTimestamp(new Date().toISOString());";

const qrCodeLogic = `
  // QR Code bottom right
  const qrData = JSON.stringify({
    certId: certNo,
    studentId: student.id.toUpperCase(),
    date: issueDate
  });
  const qrBase64 = await QRCode.toDataURL(qrData, { margin: 1, color: { dark: '#1E293B', light: '#FFFFFF' } });
  
  // Position bottom right corner inside border
  const qrSize = 25; // approx 95px
  const qrX = pageWidth - 16 - qrSize - 4;
  const qrY = pageHeight - 16 - qrSize - 20;
  
  doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
  
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 120);
  doc.text("Scan to Verify", qrX + (qrSize/2), qrY + qrSize + 3, { align: 'center' });
`;

content = content.replace("  // Return the completed jsPDF document", qrCodeLogic + "\n\n  // Return the completed jsPDF document");

content = `const LOGO_BASE64 = "${logoBase64}";\n` + content;

fs.writeFileSync('src/utils/certificate.ts', content);
