import { useMemo, useState } from 'react';
import { CheckSquare, Plus, Pencil, Trash2, Check, Search, Flag } from 'lucide-react';
import { Task, Priority, PRIORITY_META } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, Input, Select, TextArea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { uid, formatDate, daysUntil, isOverdue } from '@/utils/helpers';

interface TasksProps {
  tasks: Task[];
  setTasks: (v: Task[] | ((prev: Task[]) => Task[])) => void;
}

type Filter = 'all' | 'pending' | 'completed';
type PriorityFilter = 'all' | Priority;

interface FormState {
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
}

const EMPTY: FormState = { title: '', description: '', deadline: '', priority: 'medium' };

export function Tasks({ tasks, setTasks }: TasksProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [search, setSearch] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, deadline: t.deadline, priority: t.priority });
    setErrors({});
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    if (!form.deadline) e.deadline = 'Deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editing) {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...editing, ...form } : t)));
    } else {
      setTasks((prev) => [...prev, { id: uid(), ...form, completed: false, createdAt: new Date().toISOString() }]);
    }
    setOpen(false);
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDelete = () => {
    if (deleteId) setTasks((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === 'pending' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return daysUntil(a.deadline) - daysUntil(b.deadline);
      });
  }, [tasks, filter, priorityFilter, search]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tasks"
        subtitle="Stay on top of your assignments and deadlines"
        icon={<CheckSquare size={18} />}
        action={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add task
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1 dark:bg-slate-900 dark:border-slate-800">
          {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {f} <span className={`ml-1 text-xs ${filter === f ? 'text-white/70' : 'text-slate-400'}`}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)} className="max-w-[140px]">
            <option value="all">All priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={24} />}
            title={tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            message={tasks.length === 0 ? 'Create your first task to start tracking your work.' : 'Try adjusting your filters.'}
            action={
              tasks.length === 0 ? (
                <button className="btn-primary" onClick={openAdd}>
                  <Plus size={16} /> Add task
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => {
              const d = daysUntil(t.deadline);
              const overdue = isOverdue(t.deadline) && !t.completed;
              return (
                <div
                  key={t.id}
                  className="group flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <button
                    onClick={() => toggleComplete(t.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                      t.completed
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-slate-300 hover:border-brand-500 dark:border-slate-600'
                    }`}
                    aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {t.completed && <Check size={13} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${PRIORITY_META[t.priority].classes}`}>
                        {PRIORITY_META[t.priority].label}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          overdue ? 'text-red-500' : d <= 1 && !t.completed ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      >
                        {formatDate(t.deadline)}
                      </span>
                      {!t.completed && (
                        <span
                          className={`text-xs ${
                            overdue ? 'text-red-500' : d <= 1 ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        >
                          · {overdue ? `${Math.abs(d)}d overdue` : d === 0 ? '· today' : `· ${d}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button className="btn-ghost p-1.5" onClick={() => openEdit(t)} aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setDeleteId(t.id)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
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
        title={editing ? 'Edit task' : 'Add task'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              {editing ? 'Save changes' : 'Add task'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" error={errors.title} required>
            <Input
              value={form.title}
              invalid={!!errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Submit DBMS assignment"
              autoFocus
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional details..."
              rows={3}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline" error={errors.deadline} required>
              <Input type="date" value={form.deadline} invalid={!!errors.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete task"
        message="This task will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
