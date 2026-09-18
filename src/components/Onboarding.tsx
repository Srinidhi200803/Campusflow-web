import { useState } from 'react';
import { GraduationCap, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { insertSampleData } from '@/hooks/useUserData';

interface OnboardingProps {
  userId: string;
  fullName: string;
  onDone: () => void;
}

export function Onboarding({ userId, fullName, onDone }: OnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = fullName.split(' ')[0] || 'there';

  const startEmpty = async () => {
    setLoading(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', userId);
    setLoading(false);
    if (err) setError(err.message);
    else onDone();
  };

  const addSample = async () => {
    setLoading(true);
    setError(null);
    try {
      await insertSampleData(userId);
      const { error: err } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', userId);
      if (err) throw err;
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm mb-4">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {firstName}!</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Let's set up your CampusFlow dashboard.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Would you like to start with an empty dashboard, or add some sample
            student data so you can explore the app right away?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={startEmpty}
              disabled={loading}
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5 disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
                <GraduationCap size={18} />
              </div>
              <p className="font-semibold text-sm">Start empty</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Begin with a clean slate.
              </p>
            </button>

            <button
              onClick={addSample}
              disabled={loading}
              className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5 disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 mb-3">
                <Sparkles size={18} />
              </div>
              <p className="font-semibold text-sm">Add sample data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Explore with example classes, tasks & more.
              </p>
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={15} className="animate-spin" />
              Setting up your dashboard...
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          You can always add or remove data later.
        </p>
      </div>
    </div>
  );
}
