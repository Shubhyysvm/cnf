'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Search and Breadcrumb */}
      <div className="flex items-center gap-8 flex-1">
        <div className="text-sm text-slate-500">
          <span className="font-medium">Catalog</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-700">Admin Panel</span>
        </div>
      </div>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 relative group">
          <Bell size={20} className="text-slate-600 group-hover:text-slate-900" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
