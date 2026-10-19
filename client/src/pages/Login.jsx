import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import { Alert, Button, Field, inputCls } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/student'), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold">Log in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-line bg-surface p-6">
        <Alert>{error}</Alert>
        <Field label="Email">
          <input className={inputCls} type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-soft">
        New here? <Link to="/register" state={location.state} className="font-semibold text-teal hover:underline">Create a student account</Link>
      </p>
    </div>
  );
}
