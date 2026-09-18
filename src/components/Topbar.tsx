import { Menu } from 'lucide-react';
import { Page } from '@/types';
import type { Profile } from '@/types';

interface TopbarProps {
  onOpenSidebar: () => void;
  title: string;
  profile: Profile | null;
}

export function Topbar({ onOpenSidebar, title, profile }: TopbarProps) {
  const initials = (profile?.full_name || '?').slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 sm:px-6 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:bg-transparent lg:dark:bg-transparent lg:border-0 lg:backdrop-blur-none">
      <button className="lg:hidden btn-ghost p-1.5" onClick={onOpenSidebar} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-bold tracking-tight lg:hidden">{title}</h1>
      <div className="hidden lg:block flex-1" />
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold uppercase">
          {initials}
        </div>
      </div>
    </header>
  );
}

export function pageTitle(page: Page): string {
  const map: Record<Page, string> = {
    dashboard: 'Dashboard',
    timetable: 'Timetable',
    tasks: 'Tasks',
    attendance: 'Attendance',
    cgpa: 'CGPA Calculator',
    profile: 'Profile',
  };
  return map[page];
}
