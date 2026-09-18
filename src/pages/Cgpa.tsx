import { useMemo, useState } from 'react';
import { Calculator, Plus, Trash2, GraduationCap, Award, BookOpen } from 'lucide-react';
import { CgpaSubject, Grade, GRADES, GRADE_POINTS } from '@/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { uid } from '@/utils/helpers';

interface CgpaProps {
  subjects: CgpaSubject[];
  setSubjects: (v: CgpaSubject[] | ((prev: CgpaSubject[]) => CgpaSubject[])) => void;
}

export function Cgpa({ subjects, setSubjects }: CgpaProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSubject = () => {
    setSubjects((prev) => [...prev, { id: uid(), name: '', credits: 4, grade: 'A' }]);
  };

  const updateSubject = (id: string, field: keyof CgpaSubject, value: string | number) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    setErrors({});
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const { cgpa, totalCredits, validSubjects } = useMemo(() => {
    const valid = subjects.filter((s) => s.credits > 0 && GRADE_POINTS[s.grade] !== undefined);
    const tc = valid.reduce((sum, s) => sum + s.credits, 0);
    const weighted = valid.reduce((sum, s) => sum + s.credits * GRADE_POINTS[s.grade], 0);
    return { cgpa: tc === 0 ? 0 : weighted / tc, totalCredits: tc, validSubjects: valid };
  }, [subjects]);

  const gradeColor = (g: Grade) => {
    const p = GRADE_POINTS[g];
    if (p >= 9) return 'text-emerald-600 dark:text-emerald-400';
    if (p >= 7) return 'text-brand-600 dark:text-brand-400';
    if (p >= 5) return 'text-amber-600 dark:text-amber-400';
    if (p >= 4) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="CGPA Calculator"
        subtitle="Calculate your grade point average"
        icon={<Calculator size={18} />}
        action={
          <button className="btn-primary" onClick={addSubject}>
            <Plus size={16} /> Add subject
          </button>
        }
      />

      {/* CGPA display */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Your CGPA</p>
            <p className="text-5xl font-bold tabular-nums mt-1">{cgpa.toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-2">
              {validSubjects.length} {validSubjects.length === 1 ? 'subject' : 'subjects'} · {totalCredits} credits
            </p>
          </div>
          <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
            <GraduationCap size={40} />
          </div>
        </div>
      </Card>

      <Card>
        {subjects.length === 0 ? (
          <EmptyState
            icon={<Calculator size={24} />}
            title="No subjects added"
            message="Add your subjects with credits and grades to calculate your CGPA."
            action={
              <button className="btn-primary" onClick={addSubject}>
                <Plus size={16} /> Add subject
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {/* Header row (desktop) */}
            <div className="hidden sm:grid grid-cols-[1fr_100px_100px_40px] gap-3 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Subject</span>
              <span>Credits</span>
              <span>Grade</span>
              <span />
            </div>

            {subjects.map((s) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_40px] gap-3 items-end sm:items-center rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <Field label="Subject" >
                  <Input
                    value={s.name}
                    onChange={(e) => updateSubject(s.id, 'name', e.target.value)}
                    placeholder="e.g. Data Structures"
                  />
                </Field>
                <Field label="Credits">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={s.credits}
                    onChange={(e) => updateSubject(s.id, 'credits', Math.max(1, parseInt(e.target.value) || 0))}
                    className="sm:text-center"
                  />
                </Field>
                <Field label="Grade">
                  <Select value={s.grade} onChange={(e) => updateSubject(s.id, 'grade', e.target.value as Grade)}>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g} ({GRADE_POINTS[g]})
                      </option>
                    ))}
                  </Select>
                </Field>
                <button
                  className="btn-ghost p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 justify-center"
                  onClick={() => removeSubject(s.id)}
                  aria-label="Remove subject"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button className="btn-ghost w-full justify-center border border-dashed border-slate-300 dark:border-slate-700 mt-2" onClick={addSubject}>
              <Plus size={16} /> Add another subject
            </button>
          </div>
        )}
      </Card>

      {/* Grade scale reference */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold">Grade scale</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {GRADES.map((g) => (
            <div key={g} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
              <p className={`text-sm font-bold ${gradeColor(g)}`}>{g}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{GRADE_POINTS[g]} pts</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
