import fs from 'fs';

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');

// Add import for useFirebaseData
if (!content.includes('useFirebaseData')) {
  content = content.replace(
    /import \{ AuthSession \} from '\.\.\/types';/,
    `import { AuthSession } from '../types';\nimport { useFirebaseData } from '../hooks/useFirebaseData';`
  );
}

const hookReplacement = `
  const { notifications: allNotifications } = useFirebaseData();

  let recipientType: 'student' | 'dept' | 'hod' | undefined;
  let recipientId: string | undefined;

  if (session?.role === 'student' && session.student) {
    recipientType = 'student';
    recipientId = session.student.id;
  } else if ((session?.role === 'dept_admin' || session?.role === 'verification_officer') && session.deptAccount) {
    recipientType = 'dept';
    recipientId = session.deptAccount.department as string;
  } else if ((session?.role === 'hod' || session?.role === 'dean' || session?.role === 'director') && session.deptAccount) {
    recipientType = 'hod';
    recipientId = session.deptAccount.department;
  }

  // Use Firebase realtime notifications, fallback to empty array if still loading
  // and filter dynamically just like getNotifications does.
  const notifications = React.useMemo(() => {
    return allNotifications.filter(n => {
      if (!recipientType) return false;
      const isRecipientTypeMatch = n.recipient_type === recipientType || n.recipient_type === 'all';
      const isRecipientIdMatch =
        !n.recipient_id ||
        n.recipient_id === 'all' ||
        (recipientId && n.recipient_id.toLowerCase() === recipientId.toLowerCase());
      return isRecipientTypeMatch && isRecipientIdMatch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
  }, [allNotifications, recipientType, recipientId]);
`;

content = content.replace(
  /  let recipientType: 'student' \| 'dept' \| 'hod' \| undefined;[\s\S]*?\}, \[recipientType, recipientId\]\);/,
  hookReplacement
);

fs.writeFileSync('src/components/Navbar.tsx', content);
