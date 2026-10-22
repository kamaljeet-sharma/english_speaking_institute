import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import { Alert, Button, Field, inputCls } from './ui';
import { fmtDate } from '../utils';

export function Stars({ value = 0, size = 'text-lg' }) {
    return (
        <span className={`${size} tracking-wide text-teal`} role="img" aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= Math.round(value) ? '' : 'text-line'}>★</span>
            ))}
        </span>
    );
}

export function ReviewCard({ review }) {
    const initial = (review.name || '?').trim().charAt(0).toUpperCase();
    return (
        <figure className="flex h-full flex-col rounded-lg border border-line bg-surface p-5">
            <Stars value={review.rating} />
            <blockquote className="mt-3 flex-1 text-ink-soft">“{review.comment}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal font-display font-bold text-white" aria-hidden="true">
                    {initial}
                </span>
                <span>
                    <span className="block font-semibold">{review.name}</span>
                    <span className="block text-sm text-ink-soft">{review.title || 'Student'} · {fmtDate(review.createdAt)}</span>
                </span>
            </figcaption>
        </figure>
    );
}

// Use anywhere: <ReviewsSection limit={3} hideIfEmpty showAllLink />
export function ReviewsSection({ limit = 3, title = 'What our students say', hideIfEmpty = false, showAllLink = false }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/reviews/public', { params: { limit } })
            .then((r) => setData(r.data))
            .catch(() => setData({ reviews: [], count: 0, average: 0 }));
    }, [limit]);

    if (data === null) return null;
    if (data.reviews.length === 0 && hideIfEmpty) return null;

    return (
        <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="reviews-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="reviews-heading" className="text-2xl font-bold sm:text-3xl">{title}</h2>
                    {data.count > 0 && (
                        <p className="mt-2 flex items-center gap-2 text-ink-soft">
                            <Stars value={data.average} /> <span><b className="text-ink">{data.average}</b> average from {data.count} review{data.count === 1 ? '' : 's'}</span>
                        </p>
                    )}
                </div>
                {showAllLink && <Link to="/reviews" className="font-semibold text-teal hover:underline">Read all reviews</Link>}
            </div>

            {data.reviews.length === 0 ? (
                <p className="mt-6 rounded-md border border-dashed border-line bg-surface px-4 py-8 text-center text-ink-soft">No reviews yet. Be the first to share your experience!</p>
            ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {data.reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
                </div>
            )}
        </section>
    );
}

// Students write (or edit) their own review. Everyone else is asked to log in.
export function ReviewForm() {
    const { user } = useAuth();
    const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
    const [existing, setExisting] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.role !== 'student') return;
        api.get('/reviews/mine').then((r) => {
            if (r.data) {
                setExisting(true);
                setForm({ rating: r.data.rating, title: r.data.title || '', comment: r.data.comment });
            }
        }).catch(() => { });
    }, [user]);

    if (!user) {
        return (
            <div className="rounded-lg border border-line bg-surface p-6 text-center">
                <p className="text-ink-soft">Studied with us? Log in to share your review.</p>
                <Button to="/login" className="mt-4">Log in to write a review</Button>
            </div>
        );
    }
    if (user.role !== 'student') return null;

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setNotice(''); setSaving(true);
        try {
            const { data } = await api.put('/reviews/mine', form);
            setExisting(true);
            setNotice(data.message);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-surface p-6">
            <h2 className="text-xl font-bold">{existing ? 'Edit your review' : 'Write a review'}</h2>
            <Alert>{error}</Alert>
            <Alert kind="ok">{notice}</Alert>

            <fieldset>
                <legend className="mb-1 block text-sm font-semibold">Your rating *</legend>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                            onClick={() => setForm((p) => ({ ...p, rating: n }))}
                            className={`text-3xl leading-none transition ${n <= form.rating ? 'text-teal' : 'text-line hover:text-teal/60'}`}
                        >★</button>
                    ))}
                </div>
            </fieldset>

            <Field label="Course you took (optional)">
                <input className={inputCls} maxLength={100} placeholder="e.g. Student, Spoken English Foundation" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </Field>

            <Field label="Your review *" hint={`${form.comment.length}/600 characters. Reviews appear after admin approval.`}>
                <textarea className={inputCls} rows={4} required minLength={10} maxLength={600} value={form.comment} onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))} />
            </Field>

            <Button type="submit" disabled={saving || !form.rating}>{saving ? 'Sending…' : existing ? 'Update review' : 'Submit review'}</Button>
        </form>
    );
}