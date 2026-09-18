import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  message: string | null;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Maps Supabase auth error messages to friendly text. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try logging in instead.';
  if (m.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (m.includes('password should be at least'))
    return 'Password must be at least 6 characters long.';
  if (m.includes('unable to send') || m.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.';
  if (m.includes('session expired') || m.includes('session not found'))
    return 'Your session has expired. Please sign in again.';
  return message;
}
