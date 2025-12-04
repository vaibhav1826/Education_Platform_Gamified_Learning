import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '../hooks/useNotifications.js';
import useSocket from '../hooks/useSocket.js';

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
        <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between text-sm">
            <p className="font-semibold text-white">Notifications</p>
            <button type="button" onClick={refetch} className="text-xs text-slate-400">
              Refresh
            </button>
          </div>
          <ul className="space-y-3 text-sm">
            {notifications.length === 0 && <li className="text-slate-500">No notifications yet.</li>}
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`rounded-xl border border-white/5 p-3 ${
                  notification.readAt ? 'bg-white/5 text-slate-300' : 'bg-primary/10 text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-xs text-slate-300">{notification.message}</p>
                  </div>
                  {!notification.readAt && (
                    <button
                      type="button"
                      className="text-xs text-primary underline"
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

