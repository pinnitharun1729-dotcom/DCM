import fs from 'fs';

let content = fs.readFileSync('src/utils/storage.ts', 'utf-8');

// Update addDue to throw error if certificate is generated
const addDueLogic = `
export async function addDue(params: {
  student_id: string;
  department: DepartmentId;
  reason: string;
  amount: number;
}): Promise<CodeDue> {
  const rec = await getClearanceRecord(params.student_id);
  if (rec.certificate_generated) {
    throw new Error('Certificate Lock: This student\\'s No-Dues Certificate has already been issued and digitally sealed. New dues cannot be raised against a certified student.');
  }

  const newDue: CodeDue = {
`;

content = content.replace(
  /export async function addDue\(params: \{[\s\S]*?\}\): Promise<CodeDue> \{\s*const newDue: CodeDue = \{/,
  addDueLogic
);

// We need to remove the old lines that get clearance record
content = content.replace(
  /  const rec = await getClearanceRecord\(params\.student_id\);\s*rec\.departments\[params\.department\] = \{/,
  "  rec.departments[params.department] = {"
);

fs.writeFileSync('src/utils/storage.ts', content);
