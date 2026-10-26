import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../app/AppContext';
import { formatDateVN } from '../lib/utils';
import { Bell } from 'lucide-react';

export const NotificationsPopover: React.FC = () => {
  const { notifications, markNotificationAsRead, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user or system admin
  const userNotifications = currentUser
    ? notifications.filter(
        n => n.recipientId === currentUser.id || currentUser.role === 'ADMIN'
      )
    : [];

  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Thông báo Outbox"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden fade-in">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Hàng đợi Thông báo (Outbox)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-medium">
                {userNotifications.length} tin
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => userNotifications.forEach(n => markNotificationAsRead(n.id))}
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {userNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {currentUser ? 'Hộp thư trống. Không có thông báo nào mới.' : 'Đăng nhập để nhận thông báo từ hệ thống.'}
              </div>
            ) : (
              userNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3.5 transition-colors cursor-pointer text-xs space-y-1 ${
                    n.read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/40 text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 block pt-0.5">
                    {formatDateVN(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
