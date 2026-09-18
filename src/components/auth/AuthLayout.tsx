import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">CampusFlow</span>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              College life, organized.
            </h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              Your classes, tasks, attendance, and CGPA — all in one place,
              private to your account.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Timetable', value: 'Weekly schedule' },
                { label: 'Tasks', value: 'Deadlines & priorities' },
                { label: 'Attendance', value: 'Stay above 75%' },
                { label: 'CGPA', value: 'Grade calculator' },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                  <p className="font-semibold">{f.label}</p>
                  <p className="text-sm text-white/60 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/50">Your data stays yours. Private and secure.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight">CampusFlow</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
