'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Package,
  Grid,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', icon: Home, href: '/admin', exact: true },
    { label: 'Orders', icon: Package, href: '/admin/orders' },
    { label: 'Products', icon: Package, href: '/admin/products' },
    { label: 'Categories', icon: Grid, href: '/admin/categories' },
    { label: 'Inventory', icon: BarChart3, href: '/admin/inventory' },
    { label: 'Sync Manager', icon: RefreshCw, href: '/admin/sync' },
    { label: 'Coupons', icon: Settings, href: '/admin/coupons' },
    { label: 'Reviews', icon: BarChart3, href: '/admin/reviews' },
    { label: 'Payments', icon: BarChart3, href: '/admin/payments' },
    { label: 'Refunds', icon: BarChart3, href: '/admin/refunds' },
    { label: 'Returns', icon: BarChart3, href: '/admin/returns' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
    { label: 'Users', icon: Users, href: '/admin/users' },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    logout();
    router.push('/login');
  };

  return (
    <div
      className={`${
        isOpen ? 'w-72' : 'w-24'
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-out flex flex-col h-screen border-r border-slate-700/50 shadow-2xl`}
    >
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-slate-700/30 flex items-center justify-between">
        {isOpen && (
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-lg tracking-tight">CNF</h2>
            <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          <ChevronLeft size={20} className={isOpen ? '' : 'rotate-180'} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 group relative ${
                isActive(item.href, item.exact)
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {isActive(item.href, item.exact) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-lg" />
              )}
              <item.icon size={22} className="flex-shrink-0" />
              {isOpen && (
                <span className="font-medium text-sm tracking-narrow">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="px-4 py-6 border-t border-slate-700/30 space-y-4">
        {isOpen && (
          <div className="bg-slate-700/20 rounded-lg px-4 py-3 border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Logged In</p>
            <p className="text-sm font-semibold text-slate-100 mt-1 truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role || 'ADMIN'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-red-600/20 transition-all duration-200 group"
          title="Logout"
        >
          <LogOut size={22} className="flex-shrink-0" />
          {isOpen && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
