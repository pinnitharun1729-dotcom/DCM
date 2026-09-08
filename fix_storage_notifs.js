import fs from 'fs';

let content = fs.readFileSync('src/utils/storage.ts', 'utf-8');

// 1. In approveDepartmentClearance
const approveReplacement = `
  // Keep local storage in sync for legacy code
  const records = getClearanceRecords();
  if (records[params.studentId.toLowerCase()]) {
    records[params.studentId.toLowerCase()].departments[params.department] = {
      department: params.department,
      status: 'approved',
      digital_signature: {
        staff_name: params.staffName,
        designation: params.designation,
        department: params.department,
        timestamp: now,
        verification_hash: hash,
      },
      last_updated: now,
    };
    safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
  }

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: \`Department Cleared: \${params.department.toUpperCase()}\`,
    message: \`\${params.department.toUpperCase()} has digitally cleared your dues. Signature affixed by \${params.staffName}.\`,
    type: 'success',
  });

  await checkAndForwardToHod(params.studentId);
`;
content = content.replace(
  /\/\/ Keep local storage in sync for legacy code[\s\S]*?await checkAndForwardToHod\(params\.studentId\);/,
  approveReplacement
);

// 2. In rejectDepartmentClearance
const rejectReplacement = `
    safeSetItem(STORAGE_KEYS.CLEARANCE_RECORDS, JSON.stringify(records));
  }

  // Notification to student
  await addNotification({
    recipient_type: 'student',
    recipient_id: params.studentId,
    title: \`Clearance Disapproved: \${params.department.toUpperCase()}\`,
    message: \`\${params.department.toUpperCase()} has disapproved your clearance. Reason: \${params.reason}.\`,
    type: 'error',
  });
}
`;
content = content.replace(
  /    safeSetItem\(STORAGE_KEYS\.CLEARANCE_RECORDS, JSON\.stringify\(records\)\);\s*\}\s*\}/,
  rejectReplacement
);

// 3. In submitDueReceipt
const submitDueReplacement = `
  // Internal notification to Transaction Verification Officer (Finance Officer)
  const student = getStudentById(due.student_id);
  await addNotification({
    recipient_type: 'dept',
    recipient_id: 'verification',
    title: \`New Transaction Awaiting Verification (\${due.student_id.toUpperCase()})\`,
    message: \`Payment receipt submitted for ₹\${due.amount} (\${due.reason}) in \${due.department.toUpperCase()}. SBI Ref: \${due.transaction_ref || 'N/A'}. Awaiting Transaction Verification.\`,
    type: 'info',
  });

  // Notification to the original department admin
  await addNotification({
    recipient_type: 'dept',
    recipient_id: due.department,
    title: \`Payment Receipt Submitted (\${due.student_id.toUpperCase()})\`,
    message: \`Student \${student?.name || due.student_id.toUpperCase()} submitted a payment/transaction proof for ₹\${due.amount} (\${due.reason}). Currently awaiting finance verification.\`,
    type: 'info',
  });
}
`;
content = content.replace(
  /\/\/ Internal notification to Transaction Verification Officer[\s\S]*?type: 'info',\s*\}\);\s*\}/,
  submitDueReplacement
);

fs.writeFileSync('src/utils/storage.ts', content);
