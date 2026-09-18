import { useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2, Clock, MapPin, User } from 'lucide-react';
import { ClassEntry, DayOfWeek, DAYS, CLASS_COLORS } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { uid, formatTime } from '@/utils/helpers';

interface TimetableProps {
  classes: ClassEntry[];
  setClasses: (v: ClassEntry[] | ((prev: ClassEntry[]) => ClassEntry[])) => void;
}

interface FormState {
  name: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  instructor: string;
  color: string;
}

const EMPTY: FormState = {
  name: '',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  room: '',
  instructor: '',
  color: CLASS_COLORS[0],
};

export function Timetable({ classes, setClasses }: TimetableProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassEntry | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, day: activeDay });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (c: ClassEntry) => {
    setEditing(c);
    setForm({ name: c.name, day: c.day, startTime: c.startTime, endTime: c.endTime, room: c.room, instructor: c.instructor, color: c.color });
    setErrors({});
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Class name is required';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = 'End must be after start';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editing) {
      setClasses((prev) => prev.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)));
    } else {
      setClasses((prev) => [...prev, { id: uid(), ...form }]);
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) setClasses((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  const dayClasses = classes
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Timetable"
        subtitle="Organize your weekly class schedule"
        icon={<CalendarDays size={18} />}
        action={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add class
          </button>
        }
      />

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map((d) => {
          const count = classes.filter((c) => c.day === d).length;
          const active = d === activeDay;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {d.slice(0, 3)}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <Card>
        {dayClasses.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title={`No classes on ${activeDay}`}
            message="Add your first class for this day to start building your schedule."
            action={
              <button className="btn-primary" onClick={openAdd}>
                <Plus size={16} /> Add class
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {dayClasses.map((c) => (
              <div
                key={c.id}
                className="group flex items-stretch rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className={`w-1.5 bg-gradient-to-b ${c.color}`} />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(c.startTime)} – {formatTime(c.endTime)}
                      </span>
                      {c.room && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {c.room}
                        </span>
                      )}
                      {c.instructor && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {c.instructor}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button className="btn-ghost p-2" onClick={() => openEdit(c)} aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setDeleteId(c.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit class' : 'Add class'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              {editing ? 'Save changes' : 'Add class'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Class name" error={errors.name} required>
            <Input
              value={form.name}
              invalid={!!errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Data Structures"
              autoFocus
            />
          </Field>
          <Field label="Day" required>
            <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as DayOfWeek })}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" error={errors.startTime} required>
              <Input type="time" value={form.startTime} invalid={!!errors.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </Field>
            <Field label="End time" error={errors.endTime} required>
              <Input type="time" value={form.endTime} invalid={!!errors.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room">
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. B-204" />
            </Field>
            <Field label="Instructor">
              <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Dr. Smith" />
            </Field>
          </div>
          <Field label="Color">
            <div className="flex gap-2 flex-wrap">
              {CLASS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${c} transition ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110' : ''
                  }`}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete class"
        message="This class will be permanently removed from your timetable."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
