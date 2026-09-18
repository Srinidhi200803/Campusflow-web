export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface ClassEntry {
  id: string;
  name: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM" 24h
  endTime: string; // "HH:MM" 24h
  room: string;
  instructor: string;
  color: string; // tailwind gradient key
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date string
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  totalClasses: number;
  attendedClasses: number;
}

export type Grade = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

export interface CgpaSubject {
  id: string;
  name: string;
  credits: number;
  grade: Grade;
}

export type Page = 'dashboard' | 'timetable' | 'tasks' | 'attendance' | 'cgpa' | 'profile';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  semester: string;
  onboarded: boolean;
}

export const GRADE_POINTS: Record<Grade, number> = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  'C+': 5,
  C: 4,
  D: 3,
  F: 0,
};

export const GRADES: Grade[] = ['O', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

export const PRIORITY_META: Record<Priority, { label: string; classes: string; dot: string }> = {
  high: { label: 'High', classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400', dot: 'bg-red-500' },
  medium: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { label: 'Low', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

export const CLASS_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-500',
  'from-lime-500 to-green-500',
];
