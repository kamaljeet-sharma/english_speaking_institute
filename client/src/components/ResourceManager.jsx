import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { Alert, Button, Empty, Field, PageHeader, Spinner, inputCls } from './ui';

/*
 * Generic admin screen: table + add/edit form + delete for one API resource.
 *
 * fields:  { name, label, type, required, options, ref: { endpoint, label }, hint }
 *   types: text | number | textarea | lines | list | date | datetime | select | ref | checkbox | url
 * columns: { label, render(item) }
 */

const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (d, withTime) => {
  if (!d) return '';
  const x = new Date(d);
  const date = `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  return withTime ? `${date}T${pad(x.getHours())}:${pad(x.getMinutes())}` : date;
};

function toForm(item, fields, defaults) {
  const form = { ...defaults };
  for (const f of fields) {
    const v = item?.[f.name];
    if (!item) { form[f.name] = form[f.name] ?? (f.type === 'checkbox' ? false : ''); continue; }
    if (f.type === 'ref') form[f.name] = v?._id ?? v ?? '';
    else if (f.type === 'list') form[f.name] = (v || []).join(', ');
    else if (f.type === 'lines') form[f.name] = (v || []).join('\n');
    else if (f.type === 'datetime') form[f.name] = toLocalInput(v, true);
    else if (f.type === 'date') form[f.name] = toLocalInput(v, false);
    else form[f.name] = v ?? (f.type === 'checkbox' ? false : '');
  }
  return form;
}

function toPayload(form, fields) {
  const out = {};
  for (const f of fields) {
    const v = form[f.name];
    if (f.type === 'number') { if (v !== '') out[f.name] = Number(v); }
    else if (f.type === 'list') out[f.name] = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'lines') out[f.name] = v.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'datetime' || f.type === 'date') { if (v) out[f.name] = new Date(v).toISOString(); }
    else if (f.type === 'ref') out[f.name] = v || null;
    else out[f.name] = v;
  }
  return out;
}

export default function ResourceManager({
  title, singular, endpoint, listEndpoint, fields, columns, defaults = {}, rowActions, canCreate = true, canEdit = true, canDelete = true, headerExtra,
}) {
  const [items, setItems] = useState(null);
  const [refs, setRefs] = useState({});
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get(listEndpoint || endpoint).then((r) => setItems(r.data)).catch((e) => setError(errorMessage(e)));

  useEffect(() => {
    load();
    fields.filter((f) => f.type === 'ref').forEach((f) =>
      api.get(f.ref.endpoint).then((r) => setRefs((p) => ({ ...p, [f.name]: r.data })))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const open = (item) => {
    setError('');
    setEditing(item || 'new');
    setForm(toForm(item, fields, defaults));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form, fields);
      if (editing === 'new') await api.post(endpoint, payload);
      else await api.put(`${endpoint}/${editing._id}`, payload);
      setNotice(editing === 'new' ? `${singular} added.` : `${singular} saved.`);
      setEditing(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api.delete(`${endpoint}/${item._id}`);
      setNotice(`${singular} deleted.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const renderInput = (f) => {
    const common = { id: f.name, required: f.required, className: inputCls, value: form[f.name] ?? '', onChange: (e) => set(f.name, e.target.value) };
    switch (f.type) {
      case 'textarea':
      case 'lines':
        return <textarea {...common} rows={f.type === 'lines' ? 5 : 3} />;
      case 'select':
        return (
          <select {...common}>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'ref':
        return (
          <select {...common}>
            <option value="">{f.required ? 'Select…' : 'None'}</option>
            {(refs[f.name] || []).map((o) => (
              <option key={o._id} value={o._id}>{f.ref.label ? f.ref.label(o) : o.name || o.title}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input type="checkbox" className="h-5 w-5 accent-teal" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
        );
      case 'number': return <input {...common} type="number" min="0" />;
      case 'date': return <input {...common} type="date" />;
      case 'datetime': return <input {...common} type="datetime-local" />;
      case 'url': return <input {...common} type="url" placeholder="https://" />;
      default: return <input {...common} type="text" />;
    }
  };

  return (
    <div>
      <PageHeader title={title}>
        {headerExtra}
        {canCreate && <Button onClick={() => open(null)}>Add {singular.toLowerCase()}</Button>}
      </PageHeader>

      <div className="mb-4 space-y-2">
        {!editing && <Alert>{error}</Alert>}
        <Alert kind="ok">{notice}</Alert>
      </div>

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty>No {title.toLowerCase()} yet. Use “Add {singular.toLowerCase()}” to create the first one.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line bg-surface">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft">
              <tr>
                {columns.map((c) => <th key={c.label} className="px-3 py-2 font-semibold">{c.label}</th>)}
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-line last:border-0">
                  {columns.map((c) => <td key={c.label} className="px-3 py-2 align-top">{c.render(item)}</td>)}
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    {rowActions?.(item, load, setNotice, setError)}
                    {canEdit && <button className="ml-3 font-semibold text-teal hover:underline" onClick={() => open(item)}>Edit</button>}
                    {canDelete && <button className="ml-3 font-semibold text-coral hover:underline" onClick={() => remove(item)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`${editing === 'new' ? 'Add' : 'Edit'} ${singular}`}>
          <form onSubmit={save} className="my-8 w-full max-w-xl space-y-4 rounded-lg bg-surface p-6">
            <h2 className="text-xl font-bold">{editing === 'new' ? `Add ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}</h2>
            <Alert>{error}</Alert>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className={['textarea', 'lines', 'url'].includes(f.type) || f.wide ? 'sm:col-span-2' : ''}>
                  <Field label={f.label + (f.required ? ' *' : '')} hint={f.hint}>{renderInput(f)}</Field>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : `Save ${singular.toLowerCase()}`}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
