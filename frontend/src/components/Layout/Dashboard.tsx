import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  Bell,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

import Overview from '../Dashboard/Overview';
import Workouts from '../Dashboard/Workouts';
import Profile from '../Dashboard/Profile';
import Notifications from '../Dashboard/Notifications';
import AIAssistant from '../AI/AIAssistant';

import { notificationsAPI } from '@/services/api';
import type { User } from '@/types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await notificationsAPI.getAll();
        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to load notifications');
      }
    };

    loadNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Dumbbell /> FitTrack
          </h1>
          <p className="text-sm text-gray-600 mt-1">Hey, {user.username}!</p>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={20} />
            Overview
          </Link>

          <Link
            to="/dashboard/workouts"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive('/dashboard/workouts')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Dumbbell size={20} />
            Workouts
          </Link>

          <Link
            to="/dashboard/ai"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive('/dashboard/ai')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Sparkles size={20} />
            AI Assistant
          </Link>

          <Link
            to="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive('/dashboard/profile')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserIcon size={20} />
            Profile
          </Link>

          {/* 🔔 Notifications with badge */}
          <Link
            to="/dashboard/notifications"
            className={`flex items-center justify-between px-4 py-3 rounded-lg ${
              isActive('/dashboard/notifications')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={20} />
              Notifications
            </div>

            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 mt-auto absolute bottom-6 w-52"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<Overview user={user} />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
}
