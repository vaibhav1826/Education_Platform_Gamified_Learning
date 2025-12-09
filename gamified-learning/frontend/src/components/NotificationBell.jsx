import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '../hooks/useNotifications.js';
import useSocket from '../hooks/useSocket.js';
import NotificationDropdown from './NotificationDropdown.jsx';

const NotificationBell = () => {
  const { notifications, refetch, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const bindings = useMemo(
    () => [
      { event: 'announcement:new', handler: refetch },
      { event: 'quiz:result', handler: refetch }
    ],
    [refetch]
  );
  useSocket(bindings);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[1.2rem] rounded-full bg-primary px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onRefresh={refetch}
          onMarkRead={markAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;

