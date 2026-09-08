import fs from 'fs';

function replaceInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Replace universally
    content = content.replace(/'Receipt Submitted'/g, "'Payment Submitted — Awaiting Transaction Verification'");
    
    // In DepartmentDashboard, they should only look for Verified payments!
    if (filePath.includes('DepartmentDashboard.tsx')) {
      content = content.replace(
        /'Payment Submitted — Awaiting Transaction Verification'/g,
        "'Payment Verified — Pending Department Clearance'"
      );
    }
    
    // In ManageStudentsView, if they check status, it might be both
    
    fs.writeFileSync(filePath, content);
  }
}

const files = [
  'src/components/ClearanceTracker.tsx',
  'src/views/TransactionVerificationDashboard.tsx',
  'src/views/DepartmentDashboard.tsx',
  'src/components/ReceiptViewerModal.tsx',
  'src/constants.ts'
];

files.forEach(replaceInFile);
