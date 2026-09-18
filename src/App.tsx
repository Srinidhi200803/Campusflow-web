import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Page } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useTimetable, useTasks, useAttendance, useSubjects } from '@/hooks/useUserData';
import { Sidebar } from '@/components/Sidebar';
import { Topbar, pageTitle } from '@/components/Topbar';
import { Dashboard } from '@/pages/Dashboard';
import { Timetable } from '@/pages/Timetable';
import { Tasks } from '@/pages/Tasks';
import { Attendance } from '@/pages/Attendance';
import { Cgpa } from '@/pages/Cgpa';
import { Profile } from '@/pages/Profile';
import { Login } from '@/pages/auth/Login';
import { SignUp } from '@/pages/auth/SignUp';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Onboarding } from '@/components/Onboarding';

type AuthView = 'login' | 'signup' | 'forgot';

export default function App() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [page, setPage] = useState<Page>('dashboard');
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const timetable = useTimetable(user?.id);
  const tasks = useTasks(user?.id);
  const attendance = useAttendance(user?.id);
  const subjects = useSubjects(user?.id);

  const navigate = (p: Page) => {
    setPage(p);
    setMobileOpen(false);
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading CampusFlow...</p>
        </div>
      </div>
    );
  }

  // ---- Not authenticated: show auth screens ----
  if (!user) {
    if (authView === 'signup') {
      return <SignUp onSwitchToLogin={() => setAuthView('login')} onSuccess={() => setAuthView('login')} />;
    }
    if (authView === 'forgot') {
      return <ForgotPassword onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onSwitchToSignUp={() => setAuthView('signup')}
        onSwitchToForgot={() => setAuthView('forgot')}
      />
    );
  }

  // ---- Authenticated but no profile row yet (edge case during signup race) ----
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // ---- Onboarding: new user hasn't chosen sample data vs empty ----
  if (!profile.onboarded) {
    return (
      <Onboarding
        userId={user.id}
        fullName={profile.full_name}
        onDone={refreshProfile}
      />
    );
  }

  // ---- Main authenticated app ----
  return (
    <div className="flex min-h-screen">
      <Sidebar
        current={page}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        profile={profile}
        onSignOut={signOut}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} title={pageTitle(page)} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto">
          {page === 'dashboard' && (
            <Dashboard classes={timetable.classes} tasks={tasks.tasks} attendance={attendance.records} onNavigate={navigate} />
          )}
          {page === 'timetable' && <Timetable classes={timetable.classes} setClasses={timetable.setClasses} />}
          {page === 'tasks' && <Tasks tasks={tasks.tasks} setTasks={tasks.setTasks} />}
          {page === 'attendance' && <Attendance records={attendance.records} setRecords={attendance.setRecords} />}
          {page === 'cgpa' && <Cgpa subjects={subjects.subjects} setSubjects={subjects.setSubjects} />}
          {page === 'profile' && (
            <Profile profile={profile} onSaved={refreshProfile} onSignOut={signOut} />
          )}
        </main>
        <footer className="px-4 sm:px-6 pb-6 pt-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Built with 💜 by Srinidhi
          </p>
        </footer>
      </div>
    </div>
  );
}
