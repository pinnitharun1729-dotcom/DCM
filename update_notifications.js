import fs from 'fs';

let content = fs.readFileSync('src/utils/storage.ts', 'utf-8');

// Replace addNotification
content = content.replace(
  /export async function addNotification\([\s\S]*?return newNotif;\n\}/m,
  `export async function addNotification(
  notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
): Promise<InAppNotification> {
  const newNotif: InAppNotification = {
    ...notif,
    id: \`notif-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  try {
    if (db) {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    }
  } catch (err) {
    console.error("Error adding notification to Firebase:", err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rgukt_notification_updated', { detail: newNotif }));
  }

  return newNotif;
}`
);

// Replace markNotificationRead
content = content.replace(
  /export async function markNotificationRead\(id: string\): Promise<void> \{[\s\S]*?\n\}/m,
  `export async function markNotificationRead(id: string): Promise<void> {
  try {
    if (db) {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    }
  } catch (err) {
    console.error("Error marking notification read in Firebase:", err);
  }
}`
);

// Replace markAllNotificationsRead
content = content.replace(
  /export async function markAllNotificationsRead\(recipientType\?: 'student' \| 'dept' \| 'hod' \| 'all', recipientId\?: string\): Promise<void> \{[\s\S]*?window\.dispatchEvent\(new CustomEvent\('rgukt_notification_updated'\)\);\n  \}\n\}/m,
  `export async function markAllNotificationsRead(recipientType?: 'student' | 'dept' | 'hod' | 'all', recipientId?: string): Promise<void> {
  try {
    if (!db) return;
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    
    // Batch updates would be better here, but doing sequentially/Promise.all for simplicity
    const updatePromises: Promise<void>[] = [];
    
    notificationsSnapshot.docs.forEach(docSnap => {
      const n = docSnap.data() as InAppNotification;
      let shouldMark = false;
      
      if (!n.read) {
        if (!recipientType) {
          shouldMark = true;
        } else if (n.recipient_type === 'all' || n.recipient_id === 'all') {
          shouldMark = true;
        } else if (
          n.recipient_type === recipientType &&
          (!recipientId || n.recipient_id.toLowerCase() === recipientId.toLowerCase())
        ) {
          shouldMark = true;
        }
      }
      
      if (shouldMark) {
        updatePromises.push(updateDoc(docSnap.ref, { read: true }));
      }
    });
    
    await Promise.all(updatePromises);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rgukt_notification_updated'));
    }
  } catch (err) {
    console.error("Error marking all notifications read in Firebase:", err);
  }
}`
);

fs.writeFileSync('src/utils/storage.ts', content);
