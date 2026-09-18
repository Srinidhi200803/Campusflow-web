/*
# CampusFlow — Authentication, Profiles, and Per-User Data Tables

## Overview
Adds full multi-user support to CampusFlow. Every student gets their own
private set of timetable entries, tasks, attendance records, CGPA subjects,
exams, notes, and study sessions. No student can ever see or modify another
student's data — this is enforced at the database level by Row Level Security
(RLS), not merely by the frontend.

## 1. New Tables

### profiles
Stores each user's personal and academic information.
- `id` (uuid, primary key) — matches the user's Supabase auth ID.
- `full_name` (text) — the student's full name.
- `email` (text) — the student's email (mirrors auth email).
- `college` (text) — college / institution name.
- `degree` (text) — e.g. B.Tech.
- `branch` (text) — e.g. Computer Science.
- `year` (text) — e.g. 2nd Year.
- `semester` (text) — e.g. Semester 3.
- `onboarded` (boolean, default false) — whether the user completed the
  sample-data onboarding prompt.
- `created_at` (timestamptz).

### timetable
Weekly class schedule entries, one row per class.
- `id` (text, primary key) — app-generated identifier.
- `user_id` (uuid, defaults to the authenticated user).
- `name`, `day`, `start_time`, `end_time`, `room`, `instructor`, `color`.
- `created_at`.

### tasks
Assignments and to-dos.
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `title`, `description`, `deadline` (date), `priority`, `completed` (boolean).
- `created_at`.

### attendance
Per-subject attendance tracking.
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `subject`, `total_classes` (int), `attended_classes` (int).
- `created_at`.

### semester_subjects
Subjects used for CGPA calculation.
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `name`, `credits` (int), `grade`.
- `created_at`.

### exams
Upcoming exam reminders (schema ready for future UI).
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `title`, `subject`, `exam_date` (date).
- `created_at`.

### notes
Study notes (schema ready for future UI).
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `title`, `content` (text).
- `created_at`.

### study_sessions
Study session logs (schema ready for future UI).
- `id` (text, primary key).
- `user_id` (uuid, defaults to the authenticated user).
- `subject`, `duration_minutes` (int), `session_date` (date).
- `created_at`.

## 2. Relationships
- Every data table has `user_id uuid NOT NULL DEFAULT auth.uid()` referencing
  `auth.users(id)` with `ON DELETE CASCADE`, so deleting a user removes their
  data automatically.
- `profiles.id` references `auth.users(id)` with `ON DELETE CASCADE`.

## 3. Security — Row Level Security
RLS is enabled on every table. Four separate policies (SELECT, INSERT, UPDATE,
DELETE) are created per table, scoped to `TO authenticated`, using
`auth.uid() = user_id` (or `auth.uid() = id` for profiles). This guarantees:
- A user can only SELECT their own rows.
- A user can only INSERT rows where `user_id` equals themselves.
- A user can only UPDATE/DELETE rows they own.
- `user_id` defaults to `auth.uid()` so inserts that omit `user_id` still pass
  the `WITH CHECK` policy.

## 4. Indexes
- Added an index on `user_id` for every data table to speed up per-user queries.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  college text NOT NULL DEFAULT '',
  degree text NOT NULL DEFAULT '',
  branch text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  semester text NOT NULL DEFAULT '',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- timetable ----------
CREATE TABLE IF NOT EXISTS timetable (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  day text NOT NULL DEFAULT 'Monday',
  start_time text NOT NULL DEFAULT '09:00',
  end_time text NOT NULL DEFAULT '10:00',
  room text NOT NULL DEFAULT '',
  instructor text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'from-blue-500 to-indigo-500',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_timetable_user_id ON timetable(user_id);

DROP POLICY IF EXISTS "select_own_timetable" ON timetable;
CREATE POLICY "select_own_timetable" ON timetable FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_timetable" ON timetable;
CREATE POLICY "insert_own_timetable" ON timetable FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_timetable" ON timetable;
CREATE POLICY "update_own_timetable" ON timetable FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_timetable" ON timetable;
CREATE POLICY "delete_own_timetable" ON timetable FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- tasks ----------
CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  deadline date NOT NULL DEFAULT CURRENT_DATE,
  priority text NOT NULL DEFAULT 'medium',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- attendance ----------
CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  total_classes int NOT NULL DEFAULT 0,
  attended_classes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);

DROP POLICY IF EXISTS "select_own_attendance" ON attendance;
CREATE POLICY "select_own_attendance" ON attendance FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attendance" ON attendance;
CREATE POLICY "insert_own_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attendance" ON attendance;
CREATE POLICY "update_own_attendance" ON attendance FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attendance" ON attendance;
CREATE POLICY "delete_own_attendance" ON attendance FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- semester_subjects ----------
CREATE TABLE IF NOT EXISTS semester_subjects (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  credits int NOT NULL DEFAULT 4,
  grade text NOT NULL DEFAULT 'A',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE semester_subjects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_semester_subjects_user_id ON semester_subjects(user_id);

DROP POLICY IF EXISTS "select_own_semester_subjects" ON semester_subjects;
CREATE POLICY "select_own_semester_subjects" ON semester_subjects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_semester_subjects" ON semester_subjects;
CREATE POLICY "insert_own_semester_subjects" ON semester_subjects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_semester_subjects" ON semester_subjects;
CREATE POLICY "update_own_semester_subjects" ON semester_subjects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_semester_subjects" ON semester_subjects;
CREATE POLICY "delete_own_semester_subjects" ON semester_subjects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- exams ----------
CREATE TABLE IF NOT EXISTS exams (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  exam_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);

DROP POLICY IF EXISTS "select_own_exams" ON exams;
CREATE POLICY "select_own_exams" ON exams FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_exams" ON exams;
CREATE POLICY "insert_own_exams" ON exams FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_exams" ON exams;
CREATE POLICY "update_own_exams" ON exams FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_exams" ON exams;
CREATE POLICY "delete_own_exams" ON exams FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- notes ----------
CREATE TABLE IF NOT EXISTS notes (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

DROP POLICY IF EXISTS "select_own_notes" ON notes;
CREATE POLICY "select_own_notes" ON notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON notes;
CREATE POLICY "insert_own_notes" ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON notes;
CREATE POLICY "update_own_notes" ON notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON notes;
CREATE POLICY "delete_own_notes" ON notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- study_sessions ----------
CREATE TABLE IF NOT EXISTS study_sessions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  duration_minutes int NOT NULL DEFAULT 0,
  session_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);

DROP POLICY IF EXISTS "select_own_study_sessions" ON study_sessions;
CREATE POLICY "select_own_study_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_study_sessions" ON study_sessions;
CREATE POLICY "insert_own_study_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_study_sessions" ON study_sessions;
CREATE POLICY "update_own_study_sessions" ON study_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_study_sessions" ON study_sessions;
CREATE POLICY "delete_own_study_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
