import clsx from 'clsx';
import { useMemo } from 'react';

export function Card({ className, children }) {
  return <div className={clsx('glass rounded-3xl p-5 shadow-lg shadow-black/20', className)}>{children}</div>;
}

export function Button({ className, variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-teal text-slate-950 hover:brightness-110 shadow-glow',
    secondary: 'bg-white/5 text-white hover:bg-white/10',
    ghost: 'bg-transparent text-white hover:bg-white/5',
  };

  return <button {...props} className={clsx('rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50', styles[variant], className)} />;
}

export function Input(props) {
  return <input {...props} className={clsx('w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-teal', props.className)} />;
}

export function Select(props) {
  return <select {...props} className={clsx('w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none transition focus:border-teal', props.className)} />;
}

export function Badge({ tone = 'neutral', children }) {
  const styles = {
    neutral: 'bg-white/10 text-white',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
    danger: 'bg-rose-500/15 text-rose-300',
  };

  return <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', styles[tone])}>{children}</span>;
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {eyebrow ? <div className="text-xs uppercase tracking-[0.3em] text-teal/70">{eyebrow}</div> : null}
        <h2 className="mt-1 font-heading text-2xl font-bold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-2xl bg-white/8', className)} />;
}

export function CountUp({ value }) {
  const display = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value), [value]);
  return <span className="font-mono text-3xl font-semibold">{display}</span>;
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-bold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-auto glass p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-bold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}