import React from 'react';
import { Outlet, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Shield, Users, Files, Activity, Terminal, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-xs text-slate-500 font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const adminTabs = [
    { name: 'Overview', href: '/admin', icon: Activity },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Documents Inventory', href: '/admin/documents', icon: Files },
    { name: 'Worker Jobs', href: '/admin/jobs', icon: Terminal },
    { name: 'Audit Logs', href: '/admin/logs', icon: Shield },
    { name: 'System Config', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Admin Sub-Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  CloudDoc Enterprise Admin Console
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Staff Lead Access
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PostgreSQL RDS cluster monitoring, BullMQ workers telemetry, and audit compliance
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.name}
                  to={tab.href}
                  end={tab.href === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};
