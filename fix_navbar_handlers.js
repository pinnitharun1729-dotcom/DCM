import fs from 'fs';

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');

const handlersReplacement = `
  const handleMarkAllRead = () => {
    if (recipientType && recipientId) {
      markAllNotificationsRead(recipientType, recipientId);
    }
    setShowNotifications(false);
  };

  const handleMarkItemRead = (id: string) => {
    markNotificationRead(id);
  };
`;

content = content.replace(
  /  const handleMarkAllRead = \(\) => \{[\s\S]*?\}\);[\s\S]*?  \};/,
  handlersReplacement
);

fs.writeFileSync('src/components/Navbar.tsx', content);
