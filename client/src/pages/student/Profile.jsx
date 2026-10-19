import { useState } from 'react';
import api, { errorMessage } from '../../api';
import { useAuth } from '../../AuthContext';
import { Alert, Button, Field, inputCls } from '../../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', city: user.city || '', englishLevel: user.englishLevel || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ kind: 'ok', text: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', form);
      setUser(data);
      setMsg({ kind: 'ok', text: 'Profile saved.' });
    } catch (err) { setMsg({ kind: 'error', text: errorMessage(err) }); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setMsg({ kind: 'ok', text: 'Password updated.' });
    } catch (err) { setMsg({ kind: 'error', text: errorMessage(err) }); }
  };

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Alert kind={msg.kind}>{msg.text}</Alert>

      <form onSubmit={saveProfile} className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <Field label="Name"><input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><input className={inputCls} value={user.email} disabled /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="English level">
          <select className={inputCls} value={form.englishLevel} onChange={(e) => setForm({ ...form, englishLevel: e.target.value })}>
            <option value="">Not sure</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </Field>
        <Button type="submit">Save profile</Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">Change password</h2>
        <Field label="Current password"><input className={inputCls} type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password"><input className={inputCls} type="password" minLength={6} required autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <Button type="submit" variant="ghost">Update password</Button>
      </form>
    </div>
  );
}
