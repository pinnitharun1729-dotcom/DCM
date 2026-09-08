import fs from 'fs';

let content = fs.readFileSync('src/views/DepartmentDashboard.tsx', 'utf-8');

const replacement = `
  const handleAddDue = async (params: {
    student_id: string;
    department: DepartmentId;
    reason: string;
    amount: number;
  }) => {
    try {
      await addDue(params);
    } catch (e: any) {
      alert(e.message);
    }
    setIsSubmitting(false);
  };
`;

content = content.replace(
  /const handleAddDue = async \(params: \{[\s\S]*?\}\) => \{\s*addDue\(params\);\s*setIsSubmitting\(false\);\s*\};/,
  replacement
);

fs.writeFileSync('src/views/DepartmentDashboard.tsx', content);
