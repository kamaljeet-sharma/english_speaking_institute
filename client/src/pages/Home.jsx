import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Badge, Button } from '../components/ui';
import { rupees } from '../utils';
import { ReviewsSection } from '../components/Reviews';
import TeachersSection from '../components/Teachers';

function Hero() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Speak English like you mean it.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Small live batches with a real teacher, recorded lessons for revision, and speaking practice from the very first class.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/courses">Browse courses</Button>
            <Button to="/contact" variant="accent">Book a free demo class</Button>
          </div>
        </div>

        {/* A short practice conversation with a teacher correction */}
        <div className="space-y-3 rounded-xl bg-paper p-5" aria-label="Example of a speaking practice with teacher feedback">
          <div className="bubble max-w-[85%] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-sm" style={{ animationDelay: '.2s' }}>
            <p className="text-sm text-ink-soft">Student</p>
            <p>Yesterday I go to the market for buy vegetables.</p>
          </div>
          <div className="bubble ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-teal px-4 py-3 text-white" style={{ animationDelay: '1.1s' }}>
            <p className="text-sm text-white/75">Teacher</p>
            <p>Nice story! Try: “Yesterday I <b>went</b> to the market <b>to buy</b> vegetables.”</p>
          </div>
          <div className="bubble max-w-[85%] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-sm" style={{ animationDelay: '2s' }}>
            <p className="text-sm text-ink-soft">Student</p>
            <p>Yesterday I went to the market to buy vegetables. And I met my old friend there!</p>
          </div>
          <p className="bubble pt-1 text-center text-sm font-semibold text-teal" style={{ animationDelay: '2.8s' }}>
            Corrected in the moment, repeated until it sticks.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/courses').then((r) => setCourses(r.data.slice(0, 3))).catch(() => { }); }, []);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold sm:text-3xl">How you learn here</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {[
            ['Live batches, 15 students or fewer', 'Everyone speaks in every class. Your teacher knows your name and your mistakes.'],
            ['Recorded lessons you can replay', 'Missed a class or want to revise? Watch the lesson again whenever you like.'],
            ['Feedback you can act on', 'Attendance, announcements and progress are all in your student dashboard.'],
          ].map(([t, d]) => (
            <div key={t} className="border-l-4 border-teal pl-4">
              <h3 className="text-lg font-bold">{t}</h3>
              <p className="mt-1 text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {courses.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">Start with a course</h2>
              <Link to="/courses" className="font-semibold text-teal hover:underline">See all courses</Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {courses.map((c) => (
                <Link key={c._id} to={`/courses/${c._id}`} className="block rounded-lg border border-line p-5 hover:border-teal">
                  <Badge>{c.level}</Badge>
                  <h3 className="mt-3 text-xl font-bold">{c.title}</h3>
                  <p className="mt-2 line-clamp-3 text-ink-soft">{c.description}</p>
                  <p className="mt-4 font-display text-lg font-bold">{rupees(c.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <TeachersSection intro="Friendly, experienced teachers who know your name and help you speak with confidence." />

      <ReviewsSection limit={3} hideIfEmpty showAllLink />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-xl bg-teal p-8 text-white sm:p-12">
          <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">Not sure which level is yours?</h2>
          <p className="mt-2 max-w-lg text-white/75">Join a free demo class. We will check your level and suggest the right batch.</p>
          <Button to="/contact" variant="accent" className="mt-5">Book a free demo class</Button>
        </div>
      </section>
    </>
  );
}
