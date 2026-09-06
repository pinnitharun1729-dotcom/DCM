import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react';
import { AuthSession, InAppNotification } from '../types';
import { getNotifications, markNotificationRead } from '../utils/storage';

interface NotificationToastProps {
  session: AuthSession | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ session }) => {
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

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

  // Listen for realtime notifications
  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<InAppNotification | undefined>;
      const newNotif = customEvent.detail;
      if (newNotif) {
        // Check if recipient matches
        const matches =
          newNotif.recipient_type === 'all' ||
          newNotif.recipient_id === 'all' ||
          (recipientType && newNotif.recipient_type === recipientType && (!recipientId || newNotif.recipient_id.toLowerCase() === recipientId.toLowerCase()));

        if (matches && !dismissedIds.has(newNotif.id)) {
          setActiveToast(newNotif);
        }
      } else {
        // Updated generally, check for recent unread
        const unread = getNotifications(recipientType, recipientId).filter((n) => !n.read);
        if (unread.length > 0 && !dismissedIds.has(unread[0].id)) {
          setActiveToast(unread[0]);
        }
      }
    };

    window.addEventListener('rgukt_notification_updated', handleNewNotification);
    return () => {
      window.removeEventListener('rgukt_notification_updated', handleNewNotification);
    };
  }, [recipientType, recipientId, dismissedIds]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const handleDismiss = () => {
    if (activeToast) {
      setDismissedIds((prev) => new Set(prev).add(activeToast.id));
      markNotificationRead(activeToast.id);
    }
    setActiveToast(null);
  };

  const getIcon = () => {
    switch (activeToast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <aside
      role="status"
      aria-label="New notification alert"
      className="fixed bottom-4 inset-x-3 max-w-sm mx-auto sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-auto sm:mx-0 sm:w-96 z-50 bg-white text-slate-900 border border-slate-200/90 rounded-2xl shadow-xl p-3.5 flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {activeToast.recipient_type === 'all' ? 'Announcement' : 'Portal Alert'}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{activeToast.title}</p>
        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
          {activeToast.message}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Just now</span>
          <button
            onClick={handleDismiss}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
