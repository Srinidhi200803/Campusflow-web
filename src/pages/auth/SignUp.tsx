import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthError, friendlyAuthError } from '@/components/auth/AuthError';

interface SignUpProps {
  onSwitchToLogin: () => void;
  onSuccess: (fullName: string) => void;
}

export function SignUp({ onSwitchToLogin, onSuccess }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (signUpError) {
      setLoading(false);
      setError(friendlyAuthError(signUpError.message));
      return;
    }
    // Create the profile row immediately so the user has one.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        onboarded: false,
      });
    }
    setLoading(false);
    onSuccess(fullName.trim());
  };

  const requirements = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Passwords match', met: confirm.length > 0 && password === confirm },
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your college life in seconds."
      footer={
        <>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Sign in
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              autoComplete="name"
              autoFocus
              className="input-base pl-9"
            />
          </div>
        </div>
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
              className="input-base pl-9"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="input-base pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className="input-base pl-9"
            />
          </div>
        </div>
        <ul className="space-y-1.5">
          {requirements.map((r) => (
            <li key={r.label} className={`flex items-center gap-2 text-xs ${r.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              <Check size={13} className={r.met ? '' : 'opacity-30'} />
              {r.label}
            </li>
          ))}
        </ul>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
