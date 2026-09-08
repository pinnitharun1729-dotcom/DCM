import fs from 'fs';

let content = fs.readFileSync('src/utils/storage.ts', 'utf-8');

const notifReplacement = `
export async function addNotification(
  notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
): Promise<InAppNotification> {
  const list = getNotifications();
  const newNotif: InAppNotification = {
    ...notif,
    id: \`notif-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  list.unshift(newNotif);
  
  // Save to Firebase for real-time sync across devices
  if (db) {
    try {
      const docRef = doc(db, 'notifications', newNotif.id);
      await setDoc(docRef, newNotif, { merge: true });
    } catch (e) {
      console.error("Failed to sync notification to Firebase", e);
    }
  }

  // Cap in-memory/stored notifications to prevent unbounded growth
  const trimmed = list.slice(0, 50);
  safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rgukt_notification_updated', { detail: newNotif }));
  }

  return newNotif;
}

export async function markNotificationRead(id: string): Promise<void> {
  const list = getNotifications();
  const found = list.find((n) => n.id === id);
  if (found) {
    found.read = true;
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    
    // Sync read status to Firebase
    if (db) {
      try {
        const docRef = doc(db, 'notifications', id);
        await updateDoc(docRef, { read: true });
      } catch (e) {
        console.error("Failed to update notification read status in Firebase", e);
      }
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_notification_updated'));
    }
  }
}

export async function markAllNotificationsRead(
  recipientType: 'student' | 'dept' | 'hod',
  recipientId: string
): Promise<void> {
  const list = getNotifications();
  let changed = false;
  
  const toUpdateIds: string[] = [];
  list.forEach((n) => {
    if (
      !n.read &&
      (n.recipient_type === recipientType || n.recipient_type === 'all') &&
      (n.recipient_id === recipientId || n.recipient_id === 'all' || !n.recipient_id)
    ) {
      n.read = true;
      changed = true;
      toUpdateIds.push(n.id);
    }
  });

  if (changed) {
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    
    // Sync all read statuses to Firebase
    if (db) {
      try {
        await Promise.all(toUpdateIds.map(id => updateDoc(doc(db, 'notifications', id), { read: true })));
      } catch (e) {
        console.error("Failed to update all notifications read status in Firebase", e);
      }
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_notification_updated'));
    }
  }
}
`;

content = content.replace(
  /export async function addNotification\([\s\S]*?if \(changed\) \{\s*safeSetItem\(STORAGE_KEYS\.NOTIFICATIONS, JSON\.stringify\(list\)\);\s*if \(typeof window !== 'undefined'\) \{\s*window\.dispatchEvent\(new CustomEvent\('rgukt_notification_updated'\)\);\s*\}\s*\}\s*\}/,
  notifReplacement
);

fs.writeFileSync('src/utils/storage.ts', content);
