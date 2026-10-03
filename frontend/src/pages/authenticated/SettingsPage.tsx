import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api, getErrorMessage } from '../../services/api';
import { Lock, Shield, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Validation Error', 'New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Validation Error', 'New password must be at least 8 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users/change-password', { currentPassword, newPassword });
      addToast('Password Changed', 'Your account credentials have been updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('Update Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Security credentials, cryptographic session keys, and preferences
        </p>
      </div>

      {/* Password Change Form */}
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
              <p className="text-xs text-slate-400">Ensure your password is at least 8 characters long</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              required
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Update Password
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* API Keys & Developers */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Keys & REST Integration</h3>
              <p className="text-xs text-slate-400">Access document transformations programmatically via Bearer JWT</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400">
            Authorization: Bearer clouddoc_live_sk_********************
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            API endpoints accept multipart uploads and return asynchronous job identifiers conforming to OpenAPI v3 specifications.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
