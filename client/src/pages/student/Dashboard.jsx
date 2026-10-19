import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { useAuth } from '../../AuthContext';
import { Alert, Badge, Button, Empty, Spinner } from '../../components/ui';
import { fmtDateTime } from '../../utils';

function canJoinNow(c) {
  const start = new Date(c.dateTime).getTime();
  const now = Date.now();
  return now >= start - 15 * 60 * 1000 && now <= start + (c.durationMins + 30) * 60 * 1000;
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [enrollments, setEnrollments] = useState(null);
  const [classes, setClasses] = useState([]);
  const [news, setNews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/enrollments/my'), api.get('/live-classes/my'), api.get('/announcements/my')])
      .then(([e, c, a]) => { setEnrollments(e.data); setClasses(c.data); setNews(a.data); })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const join = async (c) => {
    // Open the tab immediately so popup blockers allow it, then point it at the link
    const tab = window.open('', '_blank');
    try {
      const { data } = await api.post(`/live-classes/${c._id}/join`);
      if (tab) tab.location.href = data.meetingLink; else window.location.href = data.meetingLink;
    } catch (err) {
      tab?.close();
      setError(errorMessage(err));
    }
  };

  if (!enrollments && !error) return <Spinner />;
  const upcoming = classes.filter((c) => new Date(c.dateTime).getTime() + c.durationMins * 60000 > Date.now());

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Hello, {user.name.split(' ')[0]}</h1>
        {location.state?.welcome && (
          <div className="mt-3"><Alert kind="ok">You are enrolled in {location.state.welcome}. Your classes will appear below.</Alert></div>
        )}
      </div>
      <Alert>{error}</Alert>

      <section>
        <h2 className="mb-3 text-xl font-bold">Live classes</h2>
        {upcoming.length === 0 ? (
          <Empty>No live classes scheduled yet. Your teacher will add them here.</Empty>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {upcoming.map((c) => (
              <li key={c._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-ink-soft">{c.batch?.course?.title} · {c.batch?.name} · {fmtDateTime(c.dateTime)}</p>
                </div>
                {canJoinNow(c)
                  ? <Button variant="accent" onClick={() => join(c)}>Join class</Button>
                  : <span className="text-sm text-ink-soft">Join opens 15 minutes before</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">My courses</h2>
        {enrollments?.length === 0 ? (
          <Empty>You have not enrolled in a course yet. <Link to="/courses" className="font-semibold text-teal underline">Browse courses</Link></Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments?.map((e) => (
              <div key={e._id} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex items-center justify-between"><Badge>{e.course.level}</Badge><span className="text-sm text-ink-soft">{e.batch?.name}</span></div>
                <h3 className="mt-2 text-lg font-bold">{e.course.title}</h3>
                {e.batch && <p className="text-sm text-ink-soft">{e.batch.days?.join(', ')} · {e.batch.timing}</p>}
                {e.totalLectures > 0 && (
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded bg-line" role="progressbar" aria-valuenow={e.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Lessons completed">
                      <div className="h-full bg-teal" style={{ width: `${e.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">{e.completedLectures.length} of {e.totalLectures} lessons done</p>
                  </div>
                )}
                <Button to={`/student/learn/${e.course._id}`} variant="ghost" className="mt-4">Open recorded lessons</Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Announcements</h2>
        {news.length === 0 ? <Empty>No announcements right now.</Empty> : (
          <ul className="space-y-3">
            {news.map((n) => (
              <li key={n._id} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-1 text-ink-soft">{n.message}</p>
                <p className="mt-2 text-xs text-ink-soft">{n.batch?.name || 'All students'} · {fmtDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
