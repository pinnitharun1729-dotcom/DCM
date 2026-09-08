import fs from 'fs';

let content = fs.readFileSync('src/components/NotificationToast.tsx', 'utf-8');

// Replace getNotifications import
content = content.replace(
  /import \{ getNotifications, markNotificationRead \} from '\.\.\/utils\/storage';/,
  "import { markNotificationRead } from '../utils/storage';\nimport { useFirebaseData } from '../hooks/useFirebaseData';"
);

// Add useFirebaseData hook
const hookImplementation = `
  const { notifications: allNotifications } = useFirebaseData();

  // Listen for realtime notifications
  useEffect(() => {
    // Filter notifications for this recipient
    const recipientNotifications = allNotifications.filter(n => {
      const isRecipientTypeMatch = n.recipient_type === recipientType || n.recipient_type === 'all';
      const isRecipientIdMatch =
        !n.recipient_id ||
        n.recipient_id === 'all' ||
        (recipientId && n.recipient_id.toLowerCase() === recipientId.toLowerCase());
      return isRecipientTypeMatch && isRecipientIdMatch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Find the most recent unread notification that hasn't been dismissed
    const unread = recipientNotifications.filter(n => !n.read && !dismissedIds.has(n.id));

    if (unread.length > 0) {
      // Check if this is a newly arrived notification by timestamp (within last 10 seconds)
      const isRecent = new Date().getTime() - new Date(unread[0].timestamp).getTime() < 10000;
      if (isRecent && activeToast?.id !== unread[0].id) {
        setActiveToast(unread[0]);
      }
    }
  }, [allNotifications, recipientType, recipientId, dismissedIds, activeToast?.id]);
`;

content = content.replace(
  /  \/\/ Listen for realtime notifications[\s\S]*?\}, \[recipientType, recipientId, dismissedIds\]\);/m,
  hookImplementation
);

fs.writeFileSync('src/components/NotificationToast.tsx', content);
