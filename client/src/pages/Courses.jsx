import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { Alert, Badge, Empty, Spinner } from '../components/ui';
import { rupees } from '../utils';

const modeLabel = { live: 'Live classes', recorded: 'Recorded lessons', both: 'Live + recorded' };

export default function Courses() {
  const [courses, setCourses] = useState(null);
  const [level, setLevel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCourses(null);
    api.get('/courses', { params: level ? { level } : {} })
      .then((r) => setCourses(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, [level]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Courses</h1>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by level">
        {['', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            aria-pressed={level === l}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${level === l ? 'border-teal bg-teal text-white' : 'border-line bg-surface hover:border-ink'}`}
          >
            {l || 'All levels'}
          </button>
        ))}
      </div>

      <div className="mt-6"><Alert>{error}</Alert></div>
      {courses === null && !error && <Spinner />}
      {courses?.length === 0 && <Empty>No courses found for this level yet.</Empty>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((c) => (
          <Link key={c._id} to={`/courses/${c._id}`} className="flex flex-col rounded-lg border border-line bg-surface p-5 hover:border-teal">
            <div className="flex items-center justify-between">
              <Badge>{c.level}</Badge>
              <span className="text-sm text-ink-soft">{modeLabel[c.mode]}</span>
            </div>
            <h2 className="mt-3 text-xl font-bold">{c.title}</h2>
            <p className="mt-2 line-clamp-3 flex-1 text-ink-soft">{c.description}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-display text-xl font-bold">{rupees(c.price)}</span>
              <span className="text-sm text-ink-soft">{c.durationWeeks} weeks</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
