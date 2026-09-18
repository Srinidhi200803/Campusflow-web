import { useMemo } from 'react';
import { CalendarDays, CheckSquare, CalendarCheck, TrendingUp, BookOpen, Clock, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { ClassEntry, Task, AttendanceRecord, Page, DAYS, PRIORITY_META } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime, formatDate, daysUntil, todayKey, isOverdue } from '@/utils/helpers';

interface DashboardProps {
  classes: ClassEntry[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  onNavigate: (p: Page) => void;
}

export function Dashboard({ classes, tasks, attendance, onNavigate }: DashboardProps) {
  const today = todayKey() as typeof DAYS[number];
  const todaysClasses = useMemo(
    () =>
      classes
        .filter((c) => c.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classes, today]
  );

  const pendingTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed)
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)),
    [tasks]
  );

  const overdueCount = pendingTasks.filter((t) => isOverdue(t.deadline)).length;

  const avgAttendance = useMemo(() => {
    if (attendance.length === 0) return 0;
    const total = attendance.reduce((s, r) => s + r.totalClasses, 0);
    const attended = attendance.reduce((s, r) => s + r.attendedClasses, 0);
    return total === 0 ? 0 : (attended / total) * 100;
  }, [attendance]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const studyProgress = tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100;

  const upcomingTasks = pendingTasks.slice(0, 4);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{greeting}, student!</p>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CalendarDays size={18} />}
          label="Today's classes"
          value={todaysClasses.length.toString()}
          accent="from-blue-500 to-indigo-500"
          onClick={() => onNavigate('timetable')}
        />
        <StatCard
          icon={<CheckSquare size={18} />}
          label="Pending tasks"
          value={pendingTasks.length.toString()}
          sub={overdueCount > 0 ? `${overdueCount} overdue` : undefined}
          subTone={overdueCount > 0 ? 'text-red-500' : undefined}
          accent="from-rose-500 to-pink-500"
          onClick={() => onNavigate('tasks')}
        />
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Avg attendance"
          value={`${avgAttendance.toFixed(0)}%`}
          accent="from-emerald-500 to-teal-500"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Study progress"
          value={`${studyProgress.toFixed(0)}%`}
          accent="from-amber-500 to-orange-500"
          onClick={() => onNavigate('tasks')}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's classes */}
        <Card>
          <SectionHeader
            title="Today's classes"
            icon={<CalendarDays size={18} />}
            action={
              <button className="btn-ghost text-xs" onClick={() => onNavigate('timetable')}>
                View all <ArrowRight size={14} />
              </button>
            }
          />
          {todaysClasses.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={24} />}
              title="No classes today"
              message="Enjoy your free day, or add a class to your timetable."
              action={
                <button className="btn-primary text-xs" onClick={() => onNavigate('timetable')}>
                  <Plus size={14} /> Add class
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  <div className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${c.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {c.room} · {c.instructor}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {formatTime(c.startTime)}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatTime(c.endTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming tasks */}
        <Card>
          <SectionHeader
            title="Upcoming tasks"
            icon={<CheckSquare size={18} />}
            action={
              <button className="btn-ghost text-xs" onClick={() => onNavigate('tasks')}>
                View all <ArrowRight size={14} />
              </button>
            }
          />
          {upcomingTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={24} />}
              title="All caught up"
              message="No pending tasks. Add one to get started."
              action={
                <button className="btn-primary text-xs" onClick={() => onNavigate('tasks')}>
                  <Plus size={14} /> Add task
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((t) => {
                const d = daysUntil(t.deadline);
                const overdue = d < 0;
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                    <span className={`h-2 w-2 rounded-full ${PRIORITY_META[t.priority].dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(t.deadline)}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${
                        overdue
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                          : d === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {overdue ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `${d}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Attendance + study progress */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Attendance overview" icon={<CalendarCheck size={18} />} />
          {attendance.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={24} />}
              title="No attendance tracked"
              message="Add your subjects to track attendance."
              action={
                <button className="btn-primary text-xs" onClick={() => onNavigate('attendance')}>
                  <Plus size={14} /> Add subject
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {attendance.slice(0, 4).map((r) => {
                const pct = r.totalClasses === 0 ? 0 : (r.attendedClasses / r.totalClasses) * 100;
                const color = pct >= 75 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium truncate">{r.subject}</p>
                      <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {r.attendedClasses}/{r.totalClasses} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar value={pct} colorClass={color} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader title="Study progress" icon={<BookOpen size={18} />} />
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-36 w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="stroke-brand-500 transition-all duration-700"
                  strokeDasharray={`${(studyProgress / 100) * 327} 327`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{studyProgress.toFixed(0)}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">tasks done</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                <span className="text-slate-600 dark:text-slate-300">{completedTasks} completed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-300">{tasks.length - completedTasks} pending</span>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subTone?: string;
  accent: string;
  onClick: () => void;
}

function StatCard({ icon, label, value, sub, subTone, accent, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${subTone ?? 'text-slate-500 dark:text-slate-400'}`}>
          {subTone && <AlertTriangle size={11} />}
          {sub}
        </p>
      )}
    </button>
  );
}
