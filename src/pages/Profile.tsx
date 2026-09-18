import { useState } from 'react';
import { User as UserIcon, Mail, Building2, GraduationCap, GitBranch, Calendar, BookOpen, Loader2, Check, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile as ProfileType } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { AuthError } from '@/components/auth/AuthError';

interface ProfileProps {
  profile: ProfileType;
  onSaved: () => void;
  onSignOut: () => void;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

export function Profile({ profile, onSaved, onSignOut }: ProfileProps) {
  const [form, setForm] = useState({
    full_name: profile.full_name,
    email: profile.email,
    college: profile.college,
    degree: profile.degree,
    branch: profile.branch,
    year: profile.year,
    semester: profile.semester,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        college: form.college,
        degree: form.degree,
        branch: form.branch,
        year: form.year,
        semester: form.semester,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        subtitle="Manage your personal and academic information"
        icon={<UserIcon size={18} />}
      />

      {/* Profile summary card */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold uppercase">
            {(form.full_name || '?').slice(0, 2)}
          </div>
          <div>
            <p className="text-xl font-bold">{form.full_name || 'Student'}</p>
            <p className="text-sm text-white/70">{form.email}</p>
            {form.branch && (
              <p className="text-xs text-white/60 mt-1">
                {[form.degree, form.branch, form.year, form.semester].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <AuthError message={error} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="pl-9" placeholder="Your name" />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={form.email} disabled className="pl-9 opacity-60" />
              </div>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="College">
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="pl-9" placeholder="e.g. NIT Trichy" />
              </div>
            </Field>
            <Field label="Degree">
              <div className="relative">
                <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="pl-9" placeholder="e.g. B.Tech" />
              </div>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Branch">
              <div className="relative">
                <GitBranch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="pl-9" placeholder="e.g. Computer Science" />
              </div>
            </Field>
            <Field label="Year">
              <Select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Semester">
            <Select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onSignOut}
              className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} /> Sign out
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
