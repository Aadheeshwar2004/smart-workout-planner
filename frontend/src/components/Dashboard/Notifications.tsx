import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';
import { format } from 'date-fns';


export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

      <div className="space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${
              notification.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                notification.is_read ? 'bg-gray-100' : 'bg-blue-100'
              }`}>
                <Bell className={notification.is_read ? 'text-gray-500' : 'text-blue-600'} size={20} />
              </div>
              
              <div className="flex-1">
                <p className="text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(notification.created_at), 'MMM dd, yyyy • h:mm a')}
                </p>
              </div>

              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-700 p-2"
                  title="Mark as read"
                >
                  <Check size={20} />
                </button>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}