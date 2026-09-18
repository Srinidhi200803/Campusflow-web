import { useState } from 'react';
import { CalendarCheck, Plus, Pencil, Trash2, TrendingUp, AlertTriangle, Minus, PlusCircle } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { uid } from '@/utils/helpers';

interface AttendanceProps {
  records: AttendanceRecord[];
  setRecords: (v: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => void;
}

interface FormState {
  subject: string;
  totalClasses: string;
  attendedClasses: string;
}

const EMPTY: FormState = { subject: '', totalClasses: '', attendedClasses: '' };
const THRESHOLD = 75;

export function Attendance({ records, setRecords }: AttendanceProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (r: AttendanceRecord) => {
    setEditing(r);
    setForm({ subject: r.subject, totalClasses: String(r.totalClasses), attendedClasses: String(r.attendedClasses) });
    setErrors({});
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.subject.trim()) e.subject = 'Subject name is required';
    const total = parseInt(form.totalClasses);
    const attended = parseInt(form.attendedClasses);
    if (!form.totalClasses || isNaN(total) || total < 0) e.totalClasses = 'Enter a valid number';
    if (!form.attendedClasses || isNaN(attended) || attended < 0) e.attendedClasses = 'Enter a valid number';
    if (!e.totalClasses && !e.attendedClasses && attended > total) e.attendedClasses = "Can't exceed total classes";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      subject: form.subject.trim(),
      totalClasses: parseInt(form.totalClasses),
      attendedClasses: parseInt(form.attendedClasses),
    };
    if (editing) {
      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...payload } : r)));
    } else {
      setRecords((prev) => [...prev, { id: uid(), ...payload }]);
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  };

  const adjust = (id: string, attended: boolean) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (attended) {
          return { ...r, totalClasses: r.totalClasses + 1, attendedClasses: r.attendedClasses + 1 };
        }
        return { ...r, totalClasses: r.totalClasses + 1 };
      })
    );
  };

  const overall = records.length === 0
    ? { pct: 0, total: 0, attended: 0 }
    : {
        total: records.reduce((s, r) => s + r.totalClasses, 0),
        attended: records.reduce((s, r) => s + r.attendedClasses, 0),
      };
  const overallPct = overall.total === 0 ? 0 : (overall.attended / overall.total) * 100;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Attendance"
        subtitle="Track attendance and stay above 75%"
        icon={<CalendarCheck size={18} />}
        action={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add subject
          </button>
        }
      />

      {/* Overall summary */}
      {records.length > 0 && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-slate-200 dark:stroke-slate-800" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className={overallPct >= 75 ? 'stroke-emerald-500' : overallPct >= 65 ? 'stroke-amber-500' : 'stroke-red-500'}
                    strokeDasharray={`${(overallPct / 100) * 214} 214`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold tabular-nums">{overallPct.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overall attendance</p>
                <p className="text-xs text-slate-400">
                  {overall.attended} of {overall.total} classes attended
                </p>
                <p className={`text-xs font-medium mt-1 ${overallPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {overallPct >= 75 ? 'Above threshold' : 'Below 75% — attend more!'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {records.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={24} />}
            title="No subjects tracked"
            message="Add your subjects to track attendance and see how many classes you can miss."
            action={
              <button className="btn-primary" onClick={openAdd}>
                <Plus size={16} /> Add subject
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {records.map((r) => {
              const pct = r.totalClasses === 0 ? 0 : (r.attendedClasses / r.totalClasses) * 100;
              const color = pct >= 75 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500';
              const canMiss = calcMissable(r.attendedClasses, r.totalClasses);
              return (
                <div key={r.id} className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.subject}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {r.attendedClasses} attended · {r.totalClasses} total
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button className="btn-ghost p-1.5" onClick={() => openEdit(r)} aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setDeleteId(r.id)} aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <ProgressBar value={pct} colorClass={color} showLabel />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjust(r.id, true)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition"
                      >
                        <PlusCircle size={13} /> Attended
                      </button>
                      <button
                        onClick={() => adjust(r.id, false)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      >
                        <Minus size={13} /> Missed
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {canMiss >= 0 ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp size={13} />
                          Can miss {canMiss} more {canMiss === 1 ? 'class' : 'classes'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <AlertTriangle size={13} />
                          Attend {-canMiss} to reach 75%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit subject' : 'Add subject'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              {editing ? 'Save changes' : 'Add subject'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subject name" error={errors.subject} required>
            <Input
              value={form.subject}
              invalid={!!errors.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Operating Systems"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total classes" error={errors.totalClasses} required>
              <Input
                type="number"
                min="0"
                value={form.totalClasses}
                invalid={!!errors.totalClasses}
                onChange={(e) => setForm({ ...form, totalClasses: e.target.value })}
                placeholder="0"
              />
            </Field>
            <Field label="Attended classes" error={errors.attendedClasses} required>
              <Input
                type="number"
                min="0"
                value={form.attendedClasses}
                invalid={!!errors.attendedClasses}
                onChange={(e) => setForm({ ...form, attendedClasses: e.target.value })}
                placeholder="0"
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete subject"
        message="This subject and its attendance record will be removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

// How many classes can be missed while keeping >= 75%.
// Solve: attended / (total + miss) >= 0.75  =>  miss <= (attended/0.75) - total
function calcMissable(attended: number, total: number): number {
  if (total === 0) return 0;
  const miss = Math.floor(attended / (THRESHOLD / 100) - total);
  return miss;
}
