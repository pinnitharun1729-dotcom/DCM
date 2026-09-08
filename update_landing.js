import fs from 'fs';

let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

// Import useFirebaseData
content = content.replace(
  /import \{ getNotifications \} from '\.\.\/utils\/storage';/,
  "import { useFirebaseData } from '../hooks/useFirebaseData';"
);

// Replace useState and useEffect with useFirebaseData
const hookReplacement = `
  const { notifications } = useFirebaseData();
  const announcements = React.useMemo(() => {
    return notifications.filter(n => n.recipient_type === 'all' || n.recipient_id === 'all');
  }, [notifications]);
`;

content = content.replace(
  /  const \[announcements, setAnnouncements\] = useState<InAppNotification\[\]>\(\(\) =>[\s\S]*?  \}, \[\]\);/m,
  hookReplacement
);

fs.writeFileSync('src/views/LandingView.tsx', content);
