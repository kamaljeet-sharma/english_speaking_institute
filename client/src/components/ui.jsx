import { Link } from 'react-router-dom';

export const inputCls =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-teal';

const variants = {
  primary: 'bg-teal text-white hover:bg-teal-dark',
  accent: 'bg-saffron text-black hover:bg-[#e8e8ea]',
  ghost: 'border border-line bg-surface text-ink hover:border-ink',
  danger: 'bg-[#b3121e] text-white hover:bg-[#8f0e18]',
};

export function Button({ variant = 'primary', className = '', as, to, ...props }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls} {...props} />;
  return <button className={cls} {...props} />;
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const cls = kind === 'error' ? 'bg-coral-tint text-coral border-coral/30' : 'bg-teal-tint text-teal border-teal/30';
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2 text-sm ${cls}`}>
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return <p className="py-10 text-center text-ink-soft">{label}</p>;
}

export function Empty({ children }) {
  return <p className="rounded-md border border-dashed border-line bg-surface px-4 py-8 text-center text-ink-soft">{children}</p>;
}

const badgeTone = {
  Beginner: 'bg-teal-tint text-teal',
  Intermediate: 'bg-saffron-tint text-ink',
  Advanced: 'bg-coral-tint text-coral',
  paid: 'bg-teal-tint text-teal',
  created: 'bg-saffron-tint text-ink',
  failed: 'bg-coral-tint text-coral',
  active: 'bg-teal-tint text-teal',
  inactive: 'bg-coral-tint text-coral',
};
export function Badge({ children, tone }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${badgeTone[tone ?? children] || 'bg-line text-ink-soft'}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
