import fs from 'fs';

let content = fs.readFileSync('src/views/DepartmentDashboard.tsx', 'utf-8');

// Reset line 207
content = content.replace(
  /const allSubmittedReceipts = dues\.filter\(\(d\) => d\.status === 'Payment Submitted — Awaiting Transaction Verification' \|\| \(d\.status === 'Payment Verified — Pending Department Clearance' \|\| d\.status === 'Payment Submitted — Awaiting Transaction Verification'\) \|\| d\.status === 'Payment Rejected — Please Resubmit'\);/,
  "const allSubmittedReceipts = dues.filter((d) => d.status === 'Payment Submitted — Awaiting Transaction Verification' || d.status === 'Payment Verified — Pending Department Clearance' || d.status === 'Payment Rejected — Please Resubmit');"
);

// Reset line 208
content = content.replace(
  /const actionableReceipts = allSubmittedReceipts\.filter\(\(d\) => \(d\.status === 'Payment Verified — Pending Department Clearance' \|\| d\.status === 'Payment Submitted — Awaiting Transaction Verification'\)\);/,
  "const actionableReceipts = allSubmittedReceipts.filter((d) => d.status === 'Payment Verified — Pending Department Clearance');"
);

// Reset line 745
content = content.replace(
  /\(d\.status === 'Payment Verified — Pending Department Clearance' \|\| d\.status === 'Payment Submitted — Awaiting Transaction Verification'\) \|\| d\.status === 'Payment Submitted — Awaiting Transaction Verification' \|\| d\.status === 'Payment Rejected — Please Resubmit' \|\| d\.status === 'Rejected' \|\|/,
  "d.status === 'Payment Verified — Pending Department Clearance' || d.status === 'Payment Submitted — Awaiting Transaction Verification' || d.status === 'Payment Rejected — Please Resubmit' || d.status === 'Rejected' ||"
);

fs.writeFileSync('src/views/DepartmentDashboard.tsx', content);
