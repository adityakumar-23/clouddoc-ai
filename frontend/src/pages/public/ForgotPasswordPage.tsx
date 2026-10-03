import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.data.resetToken) {
        setDemoToken(res.data.data.resetToken);
      }
      addToast('Reset Dispatched', 'Password reset instructions have been generated', 'success');
    } catch (err) {
      addToast('Request Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        <Card>
          <CardBody>
            {submitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If an account exists for <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched.
                </p>

                {demoToken && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs space-y-1">
                    <p className="font-bold text-brand-600 dark:text-brand-400">Development Mode Direct Link:</p>
                    <Link
                      to={`/reset-password?token=${demoToken}`}
                      className="underline text-brand-500 hover:text-brand-600 break-all"
                    >
                      /reset-password?token={demoToken}
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Work Email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
