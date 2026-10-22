import { useEffect, useState } from 'react';
import api from '../api';

function Photo({ teacher }) {
  const [failed, setFailed] = useState(false);
  if (!teacher.avatar || failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-teal font-display text-6xl font-extrabold text-white" aria-hidden="true">
        {teacher.name.trim().charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={teacher.avatar}
      alt={`${teacher.name}${teacher.designation ? ', ' + teacher.designation : ''}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-square w-full object-cover"
    />
  );
}

// Shows the teachers added in Admin > Teachers. Use anywhere: <TeachersSection />
export default function TeachersSection({ title = 'Meet our teachers', intro }) {
  const [teachers, setTeachers] = useState(null);

  useEffect(() => {
    api.get('/teachers/public').then((r) => setTeachers(r.data)).catch(() => setTeachers([]));
  }, []);

  if (!teachers || teachers.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="teachers-heading">
      <h2 id="teachers-heading" className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-ink-soft">{intro}</p>}
      <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        {teachers.map((t) => (
          <li key={t._id} className="overflow-hidden rounded-lg border border-line bg-surface transition hover:border-teal">
            <Photo teacher={t} />
            <div className="border-t-2 border-teal p-4 text-center">
              <h3 className="text-lg font-bold">{t.name}</h3>
              {t.designation && <p className="mt-0.5 text-sm text-ink-soft">{t.designation}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}