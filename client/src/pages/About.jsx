import { Button } from '../components/ui';
import { ReviewsSection } from '../components/Reviews';
import TeachersSection from '../components/Teachers';

const values = [
    ['Speak from day one', 'Every class is built around speaking. You talk, we listen, and your teacher corrects you in the moment.'],
    ['Small live batches', 'Batches of 15 students or fewer, so everyone gets time to speak and your teacher knows your name and your mistakes.'],
    ['Learn at your own pace', 'Missed a class or want to revise? Recorded lessons are always there to replay whenever you like.'],
    ['Clear progress', 'Attendance, announcements and course progress are all in your student dashboard.'],
];

const steps = [
    ['Book a free demo', 'Join a demo class so we can check your level and answer your questions.'],
    ['Join the right batch', 'We suggest a course and batch timing that fits your level and your routine.'],
    ['Practise and improve', 'Attend live classes, revise with recorded lessons and track your progress.'],
];

export default function About() {
    return (
        <>
            <section className="border-b border-line bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
                    <p className="font-semibold text-teal">About us</p>
                    <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-5xl">
                        We help you speak English with confidence.
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-ink-soft">
                        WellTalk Institute of English Language is built on one simple idea: you learn to speak by speaking.
                        Our classes are small, friendly and focused on real conversation, so you can use English at work,
                        in interviews and in everyday life.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Button to="/courses">Browse courses</Button>
                        <Button to="/contact" variant="accent">Book a free demo class</Button>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
                <div>
                    <h2 className="text-2xl font-bold sm:text-3xl">Our mission</h2>
                    <p className="mt-3 text-ink-soft">
                        Many people understand English but freeze when it is time to speak. We want to remove that fear.
                        With patient teachers, regular speaking practice and honest feedback, we help every student move
                        from hesitation to fluency.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold sm:text-3xl">Who we teach</h2>
                    <p className="mt-3 text-ink-soft">
                        School and college students, job seekers and working professionals, from complete beginners to
                        advanced learners preparing for interviews, meetings and presentations.
                    </p>
                </div>
            </section>

            <section className="border-y border-line bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-14">
                    <h2 className="text-2xl font-bold sm:text-3xl">Why students choose us</h2>
                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                        {values.map(([t, d]) => (
                            <div key={t} className="border-l-4 border-teal pl-4">
                                <h3 className="text-lg font-bold">{t}</h3>
                                <p className="mt-1 text-ink-soft">{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-14">
                <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
                <ol className="mt-6 grid gap-5 md:grid-cols-3">
                    {steps.map(([t, d], i) => (
                        <li key={t} className="rounded-lg border border-line bg-surface p-5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-display font-bold text-white">{i + 1}</span>
                            <h3 className="mt-3 text-lg font-bold">{t}</h3>
                            <p className="mt-1 text-ink-soft">{d}</p>
                        </li>
                    ))}
                </ol>
            </section>
            
            <TeachersSection />

            <ReviewsSection limit={3} title="What our students say" hideIfEmpty showAllLink />

            <section className="mx-auto max-w-6xl px-4 pb-14">
                <div className="rounded-xl bg-teal p-8 text-white sm:p-12">
                    <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">Ready to start speaking?</h2>
                    <p className="mt-2 max-w-lg text-white/75">Join a free demo class. We will check your level and suggest the right batch.</p>
                    <Button to="/contact" variant="accent" className="mt-5">Book a free demo class</Button>
                </div>
            </section>
        </>
    );
}       