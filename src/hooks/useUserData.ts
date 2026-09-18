import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useCollection } from './useCollection';
import type { ClassEntry, Task, AttendanceRecord, CgpaSubject, DayOfWeek, Priority, Grade } from '@/types';

const classToDb = (c: ClassEntry) => ({
  id: c.id,
  name: c.name,
  day: c.day,
  start_time: c.startTime,
  end_time: c.endTime,
  room: c.room,
  instructor: c.instructor,
  color: c.color,
});

const dbToClass = (r: Record<string, unknown>): ClassEntry => ({
  id: r.id as string,
  name: r.name as string,
  day: r.day as DayOfWeek,
  startTime: r.start_time as string,
  endTime: r.end_time as string,
  room: r.room as string,
  instructor: r.instructor as string,
  color: r.color as string,
});

export function useTimetable(userId: string | null | undefined) {
  const col = useCollection<ClassEntry>('timetable', userId, classToDb, dbToClass, {
    column: 'start_time',
    ascending: true,
  });

  const setClasses = useCallback(
    (v: ClassEntry[] | ((prev: ClassEntry[]) => ClassEntry[])) => {
      const prev = col.data;
      const next = typeof v === 'function' ? (v as (p: ClassEntry[]) => ClassEntry[])(prev) : v;

      // Diff: inserts, updates, deletes
      const nextMap = new Map(next.map((c) => [c.id, c]));
      const prevMap = new Map(prev.map((c) => [c.id, c]));

      for (const c of next) {
        const old = prevMap.get(c.id);
        if (!old) {
          col.insert(c);
        } else if (JSON.stringify(old) !== JSON.stringify(c)) {
          col.update(c.id, c);
        }
      }
      for (const [id] of prevMap) {
        if (!nextMap.has(id)) col.remove(id);
      }
      col.setData(next);
    },
    [col]
  );

  return { classes: col.data, setClasses, loading: col.loading, error: col.error };
}

const taskToDb = (t: Task) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  deadline: t.deadline,
  priority: t.priority,
  completed: t.completed,
});

const dbToTask = (r: Record<string, unknown>): Task => ({
  id: r.id as string,
  title: r.title as string,
  description: (r.description as string) ?? '',
  deadline: r.deadline as string,
  priority: r.priority as Priority,
  completed: (r.completed as boolean) ?? false,
  createdAt: (r.created_at as string) ?? new Date().toISOString(),
});

export function useTasks(userId: string | null | undefined) {
  const col = useCollection<Task>('tasks', userId, taskToDb, dbToTask, {
    column: 'created_at',
    ascending: true,
  });

  const setTasks = useCallback(
    (v: Task[] | ((prev: Task[]) => Task[])) => {
      const prev = col.data;
      const next = typeof v === 'function' ? (v as (p: Task[]) => Task[])(prev) : v;

      const nextMap = new Map(next.map((t) => [t.id, t]));
      const prevMap = new Map(prev.map((t) => [t.id, t]));

      for (const t of next) {
        const old = prevMap.get(t.id);
        if (!old) {
          col.insert({ ...t, createdAt: t.createdAt ?? new Date().toISOString() });
        } else if (JSON.stringify(old) !== JSON.stringify(t)) {
          col.update(t.id, t);
        }
      }
      for (const [id] of prevMap) {
        if (!nextMap.has(id)) col.remove(id);
      }
      col.setData(next);
    },
    [col]
  );

  return { tasks: col.data, setTasks, loading: col.loading, error: col.error };
}

const attendanceToDb = (a: AttendanceRecord) => ({
  id: a.id,
  subject: a.subject,
  total_classes: a.totalClasses,
  attended_classes: a.attendedClasses,
});

const dbToAttendance = (r: Record<string, unknown>): AttendanceRecord => ({
  id: r.id as string,
  subject: r.subject as string,
  totalClasses: (r.total_classes as number) ?? 0,
  attendedClasses: (r.attended_classes as number) ?? 0,
});

export function useAttendance(userId: string | null | undefined) {
  const col = useCollection<AttendanceRecord>('attendance', userId, attendanceToDb, dbToAttendance);

  const setRecords = useCallback(
    (v: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => {
      const prev = col.data;
      const next = typeof v === 'function' ? (v as (p: AttendanceRecord[]) => AttendanceRecord[])(prev) : v;

      const nextMap = new Map(next.map((a) => [a.id, a]));
      const prevMap = new Map(prev.map((a) => [a.id, a]));

      for (const a of next) {
        const old = prevMap.get(a.id);
        if (!old) {
          col.insert(a);
        } else if (JSON.stringify(old) !== JSON.stringify(a)) {
          col.update(a.id, a);
        }
      }
      for (const [id] of prevMap) {
        if (!nextMap.has(id)) col.remove(id);
      }
      col.setData(next);
    },
    [col]
  );

  return { records: col.data, setRecords, loading: col.loading, error: col.error };
}

const subjectToDb = (s: CgpaSubject) => ({
  id: s.id,
  name: s.name,
  credits: s.credits,
  grade: s.grade,
});

const dbToSubject = (r: Record<string, unknown>): CgpaSubject => ({
  id: r.id as string,
  name: r.name as string,
  credits: (r.credits as number) ?? 4,
  grade: r.grade as Grade,
});

export function useSubjects(userId: string | null | undefined) {
  const col = useCollection<CgpaSubject>('semester_subjects', userId, subjectToDb, dbToSubject);

  const setSubjects = useCallback(
    (v: CgpaSubject[] | ((prev: CgpaSubject[]) => CgpaSubject[])) => {
      const prev = col.data;
      const next = typeof v === 'function' ? (v as (p: CgpaSubject[]) => CgpaSubject[])(prev) : v;

      const nextMap = new Map(next.map((s) => [s.id, s]));
      const prevMap = new Map(prev.map((s) => [s.id, s]));

      for (const s of next) {
        const old = prevMap.get(s.id);
        if (!old) {
          col.insert(s);
        } else if (JSON.stringify(old) !== JSON.stringify(s)) {
          col.update(s.id, s);
        }
      }
      for (const [id] of prevMap) {
        if (!nextMap.has(id)) col.remove(id);
      }
      col.setData(next);
    },
    [col]
  );

  return { subjects: col.data, setSubjects, loading: col.loading, error: col.error };
}

/**
 * Inserts multiple sample rows for a new user in a single batch.
 * Used by the onboarding step.
 */
export async function insertSampleData(userId: string) {
  const now = new Date().toISOString().slice(0, 10);

  const timetable = [
    { id: 'sample-c1', user_id: userId, name: 'Data Structures', day: 'Monday', start_time: '09:00', end_time: '10:00', room: 'B-204', instructor: 'Dr. Smith', color: 'from-blue-500 to-indigo-500' },
    { id: 'sample-c2', user_id: userId, name: 'Operating Systems', day: 'Monday', start_time: '11:00', end_time: '12:00', room: 'A-110', instructor: 'Prof. Rao', color: 'from-emerald-500 to-teal-500' },
    { id: 'sample-c3', user_id: userId, name: 'DBMS Lab', day: 'Wednesday', start_time: '14:00', end_time: '16:00', room: 'Lab 3', instructor: 'Dr. Khan', color: 'from-rose-500 to-pink-500' },
  ];
  const tasks = [
    { id: 'sample-t1', user_id: userId, title: 'Submit DBMS assignment', description: 'Chapter 4 problems', deadline: now, priority: 'high', completed: false },
    { id: 'sample-t2', user_id: userId, title: 'Read OS Chapter 5', description: 'Process scheduling', deadline: now, priority: 'medium', completed: false },
    { id: 'sample-t3', user_id: userId, title: 'Buy lab notebook', description: '', deadline: now, priority: 'low', completed: true },
  ];
  const attendance = [
    { id: 'sample-a1', user_id: userId, subject: 'Data Structures', total_classes: 20, attended_classes: 18 },
    { id: 'sample-a2', user_id: userId, subject: 'Operating Systems', total_classes: 18, attended_classes: 12 },
    { id: 'sample-a3', user_id: userId, subject: 'DBMS', total_classes: 16, attended_classes: 15 },
  ];
  const subjects = [
    { id: 'sample-s1', user_id: userId, name: 'Data Structures', credits: 4, grade: 'A' },
    { id: 'sample-s2', user_id: userId, name: 'Operating Systems', credits: 3, grade: 'B+' },
    { id: 'sample-s3', user_id: userId, name: 'DBMS', credits: 4, grade: 'A+' },
  ];

  await Promise.all([
    supabase.from('timetable').insert(timetable),
    supabase.from('tasks').insert(tasks),
    supabase.from('attendance').insert(attendance),
    supabase.from('semester_subjects').insert(subjects),
  ]);
}
