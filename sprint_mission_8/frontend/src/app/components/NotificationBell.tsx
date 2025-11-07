'use client';

import { useEffect, useState } from 'react';
import { notificationAPI } from '@/lib/api';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import type { Notification } from '@/types/notification';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Initialize Socket.IO connection
    const socket = initSocket(token);
    socket.connect();

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('새 알림', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 20 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
