import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import { Alert, Button, Field, inputCls } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', englishLevel: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate(location.state?.from || '/student', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold">Create your student account</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-line bg-surface p-6">
        <Alert>{error}</Alert>
        <Field label="Full name"><input className={inputCls} required autoComplete="name" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email"><input className={inputCls} type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Phone / WhatsApp number"><input className={inputCls} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Your English level" hint="A guess is fine. We will confirm in your demo class.">
          <select className={inputCls} value={form.englishLevel} onChange={set('englishLevel')}>
            <option value="">Not sure</option>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </Field>
        <Field label="Password" hint="At least 6 characters.">
          <input className={inputCls} type="password" minLength={6} required autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-soft">
        Already registered? <Link to="/login" state={location.state} className="font-semibold text-teal hover:underline">Log in</Link>
      </p>
    </div>
  );
}
