import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { AuthSession } from '../types';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/storage';
import { formatTimestamp } from '../utils/crypto';

interface NavbarProps {
  session: AuthSession | null;
  onLogout: () => void;
  onOpenCredentials: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  onOpenCredentials,
  onNavigateHome,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  const [notifications, setNotifications] = useState(() => getNotifications(recipientType, recipientId));

  React.useEffect(() => {
    const update = () => {
      setNotifications(getNotifications(recipientType, recipientId));
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('rgukt_notification_updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('rgukt_notification_updated', update);
    };
  }, [recipientType, recipientId]);

  // Click outside to close notification dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead(recipientType, recipientId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setShowNotifications(false);
  };

  const handleMarkItemRead = (id: string) => {
    markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 h-16 w-full shrink-0">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 relative">
        {/* Logo & Title */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0 shrink"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-bold text-xs xs:text-sm sm:text-base md:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors truncate whitespace-nowrap">
                RGUKT RK Valley
              </span>
              <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full shrink-0 whitespace-nowrap">
                No-Dues Portal
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden lg:block truncate max-w-xs xl:max-w-md">
              Rajiv Gandhi University of Knowledge Technologies • Andhra Pradesh
            </p>
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Credentials Helper Button (Logins) */}
          <button
            id="btn-demo-credentials"
            onClick={onOpenCredentials}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap"
            title="Faculty & Department Logins"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Logins</span>
          </button>

          {/* Notification Bell (Always Visible & Interactive on ALL Pages) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                showNotifications
                  ? 'bg-slate-800 text-white ring-1 ring-amber-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="View notifications"
              title="Notifications and Announcements"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Dimmed Backdrop */}
            {showNotifications && (
              <div
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs sm:hidden"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
            )}

            {/* Notifications Dropdown (Properly bounded on both mobile and desktop) */}
            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="fixed inset-x-3 top-16 mt-2 max-w-sm mx-auto sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-none sm:mx-0 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="p-3 sm:p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                    <Bell className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] sm:text-xs bg-rose-100 text-rose-700 font-medium px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-200/60"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(75vh-5rem)] sm:max-h-84 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No notifications available at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkItemRead(notif.id)}
                        className={`p-3 sm:p-3.5 hover:bg-slate-50 transition-colors text-left flex space-x-3 cursor-pointer ${
                          !notif.read ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : notif.type === 'error' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="text-xs font-semibold text-slate-900 leading-tight truncate">
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatTimestamp(notif.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {session && (
            <>
              {/* Mobile Compact Avatar */}
              <div className="sm:hidden flex items-center pl-1 border-l border-slate-800 shrink-0">
                {session.role === 'student' && session.student && (
                  <img
                    src={session.student.photoUrl}
                    alt={session.student.name}
                    className="w-7 h-7 rounded-full ring-1 ring-amber-400/60 object-cover"
                    referrerPolicy="no-referrer"
                    title={`${session.student.name} (${session.student.id.toUpperCase()})`}
                  />
                )}
                {(session.role === 'dept_admin' || session.role === 'hod' || session.role === 'dean' || session.role === 'director' || session.role === 'verification_officer') &&
                  session.deptAccount && (
                    <img
                      src={session.deptAccount.avatar}
                      alt={session.deptAccount.officerName}
                      className="w-7 h-7 rounded-full ring-1 ring-blue-400/60 object-cover"
                      referrerPolicy="no-referrer"
                      title={`${session.deptAccount.officerName} - ${session.deptAccount.name}`}
                    />
                  )}
              </div>

              {/* Desktop User Avatar & Info */}
              <div className="hidden sm:flex items-center space-x-2.5 pl-2 border-l border-slate-800 shrink-0">
                {session.role === 'student' && session.student && (
                  <>
                    <img
                      src={session.student.photoUrl}
                      alt={session.student.name}
                      className="w-7 h-7 rounded-full ring-2 ring-amber-400/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left text-xs leading-none">
                      <p className="font-semibold text-slate-200 truncate max-w-[110px] md:max-w-[140px]">
                        {session.student.name}
                      </p>
                      <p className="text-amber-400 font-mono text-[10px] mt-0.5">
                        {session.student.id.toUpperCase()}
                      </p>
                    </div>
                  </>
                )}

                {(session.role === 'dept_admin' || session.role === 'hod' || session.role === 'dean' || session.role === 'director' || session.role === 'verification_officer') &&
                  session.deptAccount && (
                    <>
                      <img
                        src={session.deptAccount.avatar}
                        alt={session.deptAccount.officerName}
                        className="w-7 h-7 rounded-full ring-2 ring-blue-400/50 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left text-xs leading-none">
                        <p className="font-semibold text-slate-200 truncate max-w-[110px] md:max-w-[140px]">
                          {session.deptAccount.officerName}
                        </p>
                        <p className="text-blue-300 font-medium text-[10px] mt-0.5 truncate max-w-[110px] md:max-w-[140px]">
                          {session.deptAccount.name}
                        </p>
                      </div>
                    </>
                  )}
              </div>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-rose-900/40 hover:bg-rose-800/70 text-rose-200 hover:text-white rounded-lg border border-rose-700/50 transition-colors shrink-0 cursor-pointer"
                title="Sign out of current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
