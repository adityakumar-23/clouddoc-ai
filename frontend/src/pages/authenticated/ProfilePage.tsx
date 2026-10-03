import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { api, getErrorMessage } from '../../services/api';
import { User, HardDrive, Cpu, Sparkles, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/users/me', { fullName });
      updateUser(res.data.data);
      addToast('Profile Updated', 'Your profile details have been saved', 'success');
    } catch (err) {
      addToast('Update Failed', getErrorMessage(err), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const storageUsedMB = Math.round((user?.storageUsedBytes || 0) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 524288000) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsedMB / Math.max(1, storageLimitMB)) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Profile & Usage Quotas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your cloud workspace subscription and compute allowances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
                <Badge variant="primary" size="sm">{user?.role || 'USER'}</Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="Full Display Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Subscription Plan Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</span>
            <Badge variant="success" size="sm">ACTIVE</Badge>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {user?.plan || 'PRO'} Tier
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unlimited conversions and priority BullMQ processing queues.
            </p>
          </div>

          <div className="pt-2">
            <a href="/pricing">
              <Button variant="outline" size="sm" className="w-full">
                Change Subscription Plan
              </Button>
            </a>
          </div>
        </Card>
      </div>

      {/* Quota & Usage Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Cloud Resource Consumption
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">S3 Object Storage</span>
              <HardDrive className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {storageUsedMB} <span className="text-xs text-slate-400 font-normal">/ {storageLimitMB} MB</span>
            </p>
            <Progress value={storagePercent} size="sm" />
            <p className="text-[10px] text-slate-400">{storagePercent}% capacity consumed</p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Worker Conversions</span>
              <Cpu className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              Unlimited <span className="text-xs text-slate-400 font-normal">in Pro</span>
            </p>
            <Progress value={20} size="sm" variant="success" />
            <p className="text-[10px] text-slate-400">Low queue latency</p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">AI RAG Requests</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              64 <span className="text-xs text-slate-400 font-normal">/ 500 this period</span>
            </p>
            <Progress value={13} size="sm" variant="brand" />
            <p className="text-[10px] text-slate-400">Resets on 1st of month</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
