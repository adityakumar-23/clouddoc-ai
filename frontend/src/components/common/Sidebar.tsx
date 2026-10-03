import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Files,
  UploadCloud,
  Wrench,
  Sparkles,
  History,
  Star,
  Settings,
  Shield,
  HardDrive,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

export const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Documents', href: '/documents', icon: Files },
    { name: 'Upload Document', href: '/upload', icon: UploadCloud },
    { name: 'Tools Hub', href: '/tools', icon: Wrench },
    { name: 'AI Workspace', href: '/ai', icon: Sparkles },
    { name: 'Processing History', href: '/history', icon: History },
    { name: 'Favorites', href: '/favorites', icon: Star },
  ];

  const secondaryNav = [
    { name: 'Profile & Usage', href: '/profile', icon: UserIcon },
    { name: 'Account Settings', href: '/settings', icon: Settings },
  ];

  const storageUsedMB = Math.round((user?.storageUsedBytes || 0) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 524288000) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsedMB / Math.max(1, storageLimitMB)) * 100));

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {user?.fullName || 'User'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="primary" size="sm">
                {user?.plan || 'PRO'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Main Workspace
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Account & Preferences
          </p>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                }`
              }
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Storage Quota Meter */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold text-[11px]">S3 Cloud Storage</span>
          </div>
          <span className="font-mono text-[11px]">{storagePercent}%</span>
        </div>
        <Progress value={storagePercent} size="sm" />
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>{storageUsedMB} MB used</span>
          <span>{storageLimitMB} MB limit</span>
        </div>
      </div>
    </aside>
  );
};
