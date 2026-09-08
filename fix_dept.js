import fs from 'fs';

let content = fs.readFileSync('src/views/DepartmentDashboard.tsx', 'utf-8');

// For allSubmittedReceipts, we want to include both "Awaiting Transaction Verification" AND "Pending Department Clearance"
// Let's replace the line:
content = content.replace(
  /const allSubmittedReceipts = dues\.filter\(\(d\) => d\.status === 'Payment Verified — Pending Department Clearance'\);/,
  "const allSubmittedReceipts = dues.filter((d) => d.status === 'Payment Submitted — Awaiting Transaction Verification' || d.status === 'Payment Verified — Pending Department Clearance' || d.status === 'Payment Rejected — Please Resubmit');"
);

// We need to fix the pending, actionable, denied logic.
content = content.replace(
  /const actionableReceipts = allSubmittedReceipts\.filter\(\(d\) => d\.verification_status === 'Approved'\);/,
  "const actionableReceipts = allSubmittedReceipts.filter((d) => d.status === 'Payment Verified — Pending Department Clearance');"
);

content = content.replace(
  /const pendingTxReceipts = allSubmittedReceipts\.filter\([\s\S]*?d\.verification_status === 'Pending'\s*\);/m,
  "const pendingTxReceipts = allSubmittedReceipts.filter((d) => d.status === 'Payment Submitted — Awaiting Transaction Verification');"
);

content = content.replace(
  /const deniedTxReceipts = allSubmittedReceipts\.filter\(\(d\) => d\.verification_status === 'Denied'\);/,
  "const deniedTxReceipts = allSubmittedReceipts.filter((d) => d.status === 'Payment Rejected — Please Resubmit');"
);

// We should also replace other places in DepartmentDashboard where it checks statuses
content = content.replace(
  /d\.status === 'Payment Verified — Pending Department Clearance' \|\|\n\s*d\.status === 'Rejected' \|\|\n\s*d\.verification_status === 'Denied'/g,
  "d.status === 'Payment Verified — Pending Department Clearance' || d.status === 'Payment Submitted — Awaiting Transaction Verification' || d.status === 'Payment Rejected — Please Resubmit' || d.status === 'Rejected'"
);

content = content.replace(
  /d\.status === 'Payment Verified — Pending Department Clearance'/g,
  "(d.status === 'Payment Verified — Pending Department Clearance' || d.status === 'Payment Submitted — Awaiting Transaction Verification')"
);

fs.writeFileSync('src/views/DepartmentDashboard.tsx', content);
