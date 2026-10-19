import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { Alert, Button, Empty, Spinner } from '../../components/ui';
import { isEmbeddable, toEmbedUrl } from '../../utils';

export default function Learn() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/lectures/course/${courseId}`)
      .then((r) => {
        setData(r.data);
        setCurrent(r.data.lectures.find((l) => !l.locked && !l.completed) || r.data.lectures.find((l) => !l.locked) || null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [courseId]);

  const markDone = async () => {
    try {
      await api.post(`/lectures/${current._id}/complete`);
      setData((d) => ({ ...d, lectures: d.lectures.map((l) => (l._id === current._id ? { ...l, completed: true } : l)) }));
      setCurrent((c) => ({ ...c, completed: true }));
    } catch (e) { setError(errorMessage(e)); }
  };

  if (error && !data) return <Alert>{error}</Alert>;
  if (!data) return <Spinner />;
  if (data.lectures.length === 0) return <Empty>Recorded lessons for this course have not been added yet.</Empty>;

  return (
    <div>
      <Link to="/student" className="text-sm font-semibold text-teal hover:underline">Back to dashboard</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Alert>{error}</Alert>
          {current ? (
            <>
              <div className="aspect-video overflow-hidden rounded-lg bg-black">
                {isEmbeddable(current.videoUrl) ? (
                  <iframe key={current._id} className="h-full w-full" src={toEmbedUrl(current.videoUrl)} title={current.title} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                ) : (
                  <video key={current._id} className="h-full w-full" src={current.videoUrl} controls controlsList="nodownload" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">{current.title}</h1>
                <Button variant={current.completed ? 'ghost' : 'primary'} onClick={markDone} disabled={current.completed}>
                  {current.completed ? 'Completed' : 'Mark as completed'}
                </Button>
              </div>
              {current.notes && <p className="mt-3 whitespace-pre-line text-ink-soft">{current.notes}</p>}
            </>
          ) : (
            <Empty>Enroll in this course to watch the lessons.</Empty>
          )}
        </div>

        <aside>
          <h2 className="mb-2 text-lg font-bold">Lessons</h2>
          <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
            {data.lectures.map((l) => (
              <li key={l._id}>
                <button
                  disabled={l.locked}
                  onClick={() => setCurrent(l)}
                  aria-current={current?._id === l._id}
                  className={`flex w-full items-start justify-between gap-2 px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${current?._id === l._id ? 'bg-teal-tint' : 'hover:bg-paper'}`}
                >
                  <span>
                    <span className="block text-[15px] font-semibold">{l.title}</span>
                    <span className="text-xs text-ink-soft">{l.durationMins ? `${l.durationMins} min` : ''}{l.isFree && !data.hasAccess ? ' · Free preview' : ''}{l.locked ? ' · Locked' : ''}</span>
                  </span>
                  {l.completed && <span className="text-sm font-bold text-teal" aria-label="Completed">Done</span>}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
