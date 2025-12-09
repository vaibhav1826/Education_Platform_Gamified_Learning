import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ notifications = [], onRefresh, onMarkRead }) => (
  <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl">
    <div className="mb-3 flex items-center justify-between text-sm">
      <p className="font-semibold text-white">Notifications</p>
      <button type="button" onClick={onRefresh} className="text-xs text-slate-400">
        Refresh
      </button>
    </div>
    <ul className="space-y-3 text-sm">
      {notifications.length === 0 && <li className="text-slate-500">No notifications yet.</li>}
      {notifications.map((notification) => (
        <li
          key={notification._id}
          className={`rounded-xl border border-white/5 p-3 transition ${
            notification.readAt ? 'bg-white/5 text-slate-300' : 'bg-primary/10 text-white shadow-neon'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-xs text-slate-300">{notification.message}</p>
            </div>
            {!notification.readAt && (
              <button type="button" className="text-xs text-primary underline" onClick={() => onMarkRead?.(notification._id)}>
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
);

export default NotificationDropdown;


