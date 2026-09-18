import { LayoutDashboard, CalendarDays, CheckSquare, CalendarCheck, Calculator, GraduationCap, Moon, Sun, X, User as UserIcon, LogOut } from 'lucide-react';
import { Page } from '@/types';
import { Theme } from '@/hooks/useTheme';
import type { Profile } from '@/types';

interface SidebarProps {
  current: Page;
  onNavigate: (p: Page) => void;
  theme: Theme;
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  profile: Profile | null;
  onSignOut: () => void;
}

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'timetable', label: 'Timetable', icon: <CalendarDays size={18} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
  { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={18} /> },
  { id: 'cgpa', label: 'CGPA', icon: <Calculator size={18} /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
];

export function Sidebar({ current, onNavigate, theme, onToggleTheme, mobileOpen, onCloseMobile, profile, onSignOut }: SidebarProps) {
  const initials = (profile?.full_name || '?').slice(0, 2).toUpperCase();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 flex flex-col bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="font-bold tracking-tight leading-none">CampusFlow</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">College life, organized</p>
            </div>
          </div>
          <button className="lg:hidden btn-ghost p-1.5" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className={active ? 'text-brand-600 dark:text-brand-400' : ''}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-3 pb-3">
          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              current === 'profile'
                ? 'bg-brand-50 dark:bg-brand-500/15'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold uppercase">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{profile?.full_name || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.email || ''}</p>
            </div>
          </button>
        </div>

        <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
            <span
              className={`relative h-5 w-9 rounded-full transition ${
                theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  theme === 'dark' ? 'left-4' : 'left-0.5'
                }`}
              />
            </span>
          </button>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
