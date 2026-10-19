import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import { Alert, PageHeader, Spinner } from '../../components/ui';
import { fmtDateTime, rupees } from '../../utils';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

export default function Overview() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!s) return <Spinner />;
  const max = Math.max(...s.monthly.map((m) => m.total), 1);

  return (
    <div>
      <PageHeader title="Overview" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Students" value={s.students} />
        <Stat label="Active enrollments" value={s.activeEnrollments} />
        <Stat label="New enrollments (30 days)" value={s.newEnrollments} />
        <Stat label="Running or upcoming batches" value={s.runningBatches} />
        <Stat label="Revenue this month" value={rupees(s.monthRevenue)} />
        <Stat label="Total revenue" value={rupees(s.totalRevenue)} />
        <Stat label="Courses" value={s.courses} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Revenue, last 6 months</h2>
          {s.monthly.length === 0 ? <p className="mt-3 text-ink-soft">No paid enrollments yet.</p> : (
            <div className="mt-4 flex h-44 items-end gap-3" role="img" aria-label="Monthly revenue bar chart">
              {s.monthly.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs text-ink-soft">{rupees(m.total)}</span>
                  <div className="w-full rounded-t bg-teal" style={{ height: `${(m.total / max) * 100}%`, minHeight: 4 }} />
                  <span className="text-xs">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Next live classes</h2>
          {s.upcomingClasses.length === 0 ? <p className="mt-3 text-ink-soft">Nothing scheduled. Add one under Live classes.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {s.upcomingClasses.map((c) => (
                <li key={c._id} className="py-2"><p className="font-semibold">{c.title}</p><p className="text-sm text-ink-soft">{c.batch?.name} · {fmtDateTime(c.dateTime)}</p></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
