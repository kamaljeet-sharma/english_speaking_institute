import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import { enrollAndPay } from '../payment';
import { Alert, Badge, Button, Spinner } from '../components/ui';
import { fmtDate, rupees } from '../utils';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [batchId, setBatchId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then((r) => setCourse(r.data)).catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error && !course) return <div className="mx-auto max-w-3xl px-4 py-10"><Alert>{error}</Alert></div>;
  if (!course) return <Spinner />;

  const needsBatch = course.mode !== 'recorded';

  const enroll = async () => {
    setError('');
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });
    if (user.role !== 'student') return setError('Please use a student account to enroll.');
    if (needsBatch && !batchId) return setError('Choose a batch before paying.');
    setBusy(true);
    try {
      await enrollAndPay({ courseId: course._id, batchId: needsBatch ? batchId : undefined });
      navigate('/student', { state: { welcome: course.title } });
    } catch (e) {
      setError(e.response ? errorMessage(e) : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <Badge>{course.level}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-ink-soft">{course.description}</p>

        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <div><dt className="text-sm text-ink-soft">Duration</dt><dd className="font-semibold">{course.durationWeeks} weeks</dd></div>
          <div><dt className="text-sm text-ink-soft">Format</dt><dd className="font-semibold">{{ live: 'Live classes', recorded: 'Recorded lessons', both: 'Live classes + recordings' }[course.mode]}</dd></div>
          {course.lectureCount > 0 && <div><dt className="text-sm text-ink-soft">Recorded lessons</dt><dd className="font-semibold">{course.lectureCount}</dd></div>}
        </dl>

        {course.syllabus?.length > 0 && (
          <>
            <h2 className="mt-10 text-2xl font-bold">What you will cover</h2>
            <ol className="mt-4 space-y-2">
              {course.syllabus.map((s, i) => (
                <li key={i} className="flex gap-3 border-b border-line pb-2"><span className="font-display font-bold text-teal">{i + 1}.</span>{s}</li>
              ))}
            </ol>
          </>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-20">
        <p className="font-display text-3xl font-extrabold">{course.price === 0 ? 'Free' : rupees(course.price)}</p>

        {needsBatch && (
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Choose your batch</legend>
            {course.batches.length === 0 && <p className="text-sm text-ink-soft">No batches are open right now. Book a free demo and we will tell you when the next one starts.</p>}
            <div className="space-y-2">
              {course.batches.map((b) => (
                <label key={b._id} className={`block rounded-md border p-3 ${b.seatsLeft === 0 ? 'opacity-50' : 'cursor-pointer'} ${batchId === b._id ? 'border-teal bg-teal-tint' : 'border-line'}`}>
                  <input type="radio" name="batch" className="mr-2 accent-teal" disabled={b.seatsLeft === 0} checked={batchId === b._id} onChange={() => setBatchId(b._id)} />
                  <span className="font-semibold">{b.name}</span>
                  <span className="mt-1 block pl-6 text-sm text-ink-soft">
                    {b.days?.join(', ')} · {b.timing}<br />
                    Starts {fmtDate(b.startDate)} · {b.seatsLeft === 0 ? 'Full' : `${b.seatsLeft} seats left`}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-4"><Alert>{error}</Alert></div>
        <Button className="mt-4 w-full" onClick={enroll} disabled={busy || (needsBatch && course.batches.length === 0)}>
          {busy ? 'Please wait…' : course.price === 0 ? 'Enroll for free' : `Pay ${rupees(course.price)} and enroll`}
        </Button>
        <p className="mt-3 text-xs text-ink-soft">Secure payment by UPI, card or net banking.</p>
      </aside>
    </div>
  );
}
