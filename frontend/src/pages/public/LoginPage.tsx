import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Cloud, Lock, Mail, Shield, User, ArrowRight } from 'lucide-react';
import { getErrorMessage } from '../../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, quickDemoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      addToast('Welcome back!', 'Session authenticated successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Authentication Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'ADMIN' | 'USER') => {
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
      addToast('Signed in as Demo User', `Role: ${role}`, 'success');
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      addToast('Demo Login Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Cloud className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CloudDoc<span className="text-brand-600 dark:text-brand-400 font-extrabold ml-1">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your encrypted documents and AI processing pipelines
          </p>
        </div>

        {/* Demo Fast Login Shortcuts */}
        <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 space-y-2.5">
          <p className="text-[11px] font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoSignIn('USER')}
              leftIcon={<User className="w-3.5 h-3.5" />}
              className="bg-white dark:bg-slate-900 text-xs"
            >
              Demo User
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoSignIn('ADMIN')}
              leftIcon={<Shield className="w-3.5 h-3.5 text-amber-500" />}
              className="bg-white dark:bg-slate-900 text-xs"
            >
              Demo Admin
            </Button>
          </div>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email Address"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
