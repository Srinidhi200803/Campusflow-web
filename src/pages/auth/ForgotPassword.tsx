import { useState } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthError, friendlyAuthError } from '@/components/auth/AuthError';

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
}

export function ForgotPassword({ onSwitchToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (resetError) {
      setError(friendlyAuthError(resetError.message));
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a password reset link to your email."
      footer={
        <button onClick={onSwitchToLogin} className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          <ArrowLeft size={14} /> Back to sign in
        </button>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-semibold">Check your email</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              We've sent a password reset link to <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>. Follow the link to reset your password.
            </p>
          </div>
          <button onClick={onSwitchToLogin} className="btn-primary w-full">
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthError message={error} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                autoComplete="email"
                autoFocus
                className="input-base pl-9"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
