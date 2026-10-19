import { useState } from 'react';
import api, { errorMessage } from '../api';
import { Alert, Button, Field, inputCls } from '../components/ui';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', level: '', message: '' });
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/demo', form);
      setDone(data.message);
      setForm({ name: '', phone: '', email: '', level: '', message: '' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">Book a free demo class</h1>
      <p className="mt-2 text-ink-soft">Tell us how to reach you. We will call to arrange a time and check your level.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-line bg-surface p-6">
        <Alert kind="ok">{done}</Alert>
        <Alert>{error}</Alert>
        <Field label="Your name *"><input className={inputCls} required value={form.name} onChange={set('name')} /></Field>
        <Field label="Phone / WhatsApp number *"><input className={inputCls} type="tel" required value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Your English level">
          <select className={inputCls} value={form.level} onChange={set('level')}>
            <option value="">Not sure</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </Field>
        <Field label="What do you want to improve?"><textarea className={inputCls} rows={3} value={form.message} onChange={set('message')} /></Field>
        <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Request free demo'}</Button>
      </form>
    </div>
  );
}
