import fs from 'fs';

let content = fs.readFileSync('src/utils/certificate.ts', 'utf-8');

// 1. Fix the top left logo size and position slightly
content = content.replace(
  /doc\.addImage\(LOGO_BASE64, 'PNG', 20, 18, 16, 16\);/,
  "doc.addImage(LOGO_BASE64, 'PNG', 20, 16, 20, 20);"
);

// 2. Fix the HOD box text alignment and overflow
const hodBoxCode = `
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 40, 40);
  doc.text('FINAL STATUTORY APPROVAL & DIGITAL ENDORSEMENT', 20, hodBoxY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 60, 75);
  doc.text(
    \`Having verified that all six department clearances are complete with valid cryptographic hashes,\`,
    20,
    hodBoxY + 13
  );
  doc.text(
    \`the undersigned authority hereby grants full academic and institutional clearance for graduation and certificate release.\`,
    20,
    hodBoxY + 18
  );

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 43, 73);
  doc.text(approverName, pageWidth - 20, hodBoxY + 26, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 90, 105);
  const splitTitle = doc.splitTextToSize(approverTitle, 75);
  let titleY = hodBoxY + 30;
  splitTitle.forEach(line => {
    doc.text(line, pageWidth - 20, titleY, { align: 'right' });
    titleY += 3.5;
  });
  doc.text(\`Signed: \${approverTs}\`, pageWidth - 20, titleY, { align: 'right' });

  // Security & Verification Seal box on left
  doc.setDrawColor(180, 140, 60);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, hodBoxY + 23, 75, 13, 1, 1);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 80, 20);
  doc.text(\`HASH: \${approverHash}\`, 22, hodBoxY + 27.5);
  doc.text('STATUS: DIGITALLY SEALED & VERIFIED', 22, hodBoxY + 32);
`;
content = content.replace(/doc\.setFont\('helvetica', 'bold'\);\s*doc\.setFontSize\(9\);\s*doc\.setTextColor\(140, 40, 40\);[\s\S]*?doc\.text\('STATUS: DIGITALLY SEALED & VERIFIED', 22, hodBoxY \+ 32\);/, hodBoxCode);

// 3. Fix the QR code position and remove "Scan to Verify"
const qrCodeRepl = `
  // QR Code bottom right, strictly below the text and inside border
  const qrData = JSON.stringify({
    certId: certNo,
    studentId: student.id.toUpperCase(),
    date: issueDate
  });
  const qrBase64 = await QRCode.toDataURL(qrData, { margin: 1, color: { dark: '#1E293B', light: '#FFFFFF' } });
  
  const qrSize = 20;
  const qrX = pageWidth - 16 - qrSize - 4;
  const qrY = footerY - qrSize - 4;
  
  doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
  
  // Return the completed jsPDF document
`;
content = content.replace(/\/\/ QR Code bottom right[\s\S]*?\/\/ Return the completed jsPDF document/, qrCodeRepl);

// 4. Fix table designation overflow
content = content.replace(
  /doc\.text\(sig\?\.designation \|\| 'Authorized Admin', 18 \+ colWidths\.dept \+ colWidths\.status, currentY \+ 10\);/,
  "const desigText = sig?.designation || 'Authorized Admin';\n    const splitDesig = doc.splitTextToSize(desigText, colWidths.signatory - 2);\n    doc.text(splitDesig, 18 + colWidths.dept + colWidths.status, currentY + 10);"
);

// 5. Fix program branch overflow
content = content.replace(
  /doc\.text\(`\$\{student\.studentType === 'puc' \? 'PUC' : 'B\.Tech'\} - \$\{student\.branch\}`\, 45\, 74\);/,
  "const branchStr = `${student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - ${student.branch}`;\n  const splitBranch = doc.splitTextToSize(branchStr, 75);\n  doc.text(splitBranch, 45, splitBranch.length > 1 ? 72 : 74);"
);

fs.writeFileSync('src/utils/certificate.ts', content);
