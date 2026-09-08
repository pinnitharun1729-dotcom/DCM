import fs from 'fs';

let content = fs.readFileSync('src/utils/storage.ts', 'utf-8');

// 1. In submitDueReceipt, change 'Receipt Submitted' to 'Payment Submitted — Awaiting Transaction Verification'
content = content.replace(
  /due\.status = 'Receipt Submitted';/,
  "due.status = 'Payment Submitted — Awaiting Transaction Verification';"
);

// 2. In approveTransactionVerification, set due.status to 'Payment Verified — Pending Department Clearance'
// And send an email to the department.
content = content.replace(
  /export async function approveTransactionVerification[\s\S]*?\}\n/m,
  (match) => {
    let replaced = match;
    replaced = replaced.replace(
      /due\.verification_status = 'Approved';/,
      "due.status = 'Payment Verified — Pending Department Clearance';\n  due.verification_status = 'Approved';"
    );
    // Add email to department
    replaced = replaced.replace(
      /await addNotification\(\{[\s\S]*?\}\);/m,
      `$&
  // Notify department by email
  const ACADEMIC_ROLE_ACCOUNTS = (await import('../constants')).ACADEMIC_ROLE_ACCOUNTS;
  const deptAccount = Object.values(ACADEMIC_ROLE_ACCOUNTS).find(a => a?.department === due.department);
  if (deptAccount) {
    const { sendEmailNotification } = await import('./emailService');
    await sendEmailNotification({
      to: deptAccount.email,
      studentId: due.student_id,
      recipientName: deptAccount.name,
      from: 'finance@rguktrkv.ac.in',
      fromName: 'Finance Verification',
      departmentId: due.department,
      departmentName: due.department.toUpperCase(),
      actionType: 'approved',
      status: 'Approved',
      subject: \`Payment Verified - \${student?.name || due.student_id.toUpperCase()} (\${due.department.toUpperCase()})\`,
      body: \`A payment receipt of ₹\${due.amount} for student \${student?.name || due.student_id.toUpperCase()} has been verified by the Transaction Verification Officer (\${params.officerName}). Please review their profile in the No-Dues portal and take final clearance action.\`,
      timestamp: new Date().toISOString()
    });
  }`
    );
    return replaced;
  }
);

// 3. In denyTransactionVerification, set due.status to 'Payment Rejected — Please Resubmit'
// And send an email to the STUDENT, not just department notification. Let's send in-app to student and email to student.
content = content.replace(
  /export async function denyTransactionVerification[\s\S]*?\}\n/m,
  (match) => {
    let replaced = match;
    replaced = replaced.replace(
      /due\.verification_status = 'Denied';/,
      "due.status = 'Payment Rejected — Please Resubmit';\n  due.verification_status = 'Denied';"
    );
    // Change notification recipient from department to student
    replaced = replaced.replace(
      /recipient_type: 'dept',\n\s*recipient_id: due\.department,/,
      "recipient_type: 'student',\n    recipient_id: due.student_id,"
    );
    replaced = replaced.replace(
      /title: `Payment Not Verified: Tx Denied.*/,
      "title: `Payment Rejected — Please Resubmit`,"
    );
    replaced = replaced.replace(
      /message: `Payment receipt of ₹\${due\.amount}.*/,
      "message: `Your payment receipt of ₹${due.amount} for ${due.department.toUpperCase()} was denied. Reason: ${params.reason}. Please upload a valid receipt.`,"
    );
    // Add email to student
    replaced = replaced.replace(
      /await addNotification\(\{[\s\S]*?\}\);/m,
      `$&
  if (student) {
    const { sendEmailNotification } = await import('./emailService');
    await sendEmailNotification({
      to: student.email,
      studentId: student.id,
      recipientName: student.name,
      from: 'finance@rguktrkv.ac.in',
      fromName: 'Finance Verification',
      departmentId: due.department,
      departmentName: due.department.toUpperCase(),
      actionType: 'denied',
      status: 'Denied',
      subject: \`Payment Rejected - Action Required (\${due.department.toUpperCase()})\`,
      body: \`Your payment receipt of ₹\${due.amount} for \${due.department.toUpperCase()} has been rejected by the Transaction Verification Officer. Reason: \${params.reason}. Please log in to the portal and resubmit a valid receipt.\`,
      reasonOrRemarks: params.reason,
      timestamp: new Date().toISOString()
    });
  }`
    );
    return replaced;
  }
);

// 4. Update the references in getDues() normalize logic (if any) or wherever 'Receipt Submitted' is hardcoded
content = content.replace(
  /d\.status === 'Receipt Submitted'/g,
  "d.status === 'Payment Submitted — Awaiting Transaction Verification'"
);

fs.writeFileSync('src/utils/storage.ts', content);
