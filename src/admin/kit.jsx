// Small building blocks shared by the portal pages.
import { useEffect, useRef } from 'react';
import { X, Info } from '@phosphor-icons/react';
import { useAdmin } from './AdminApp';

export function PageHead({ title, sub, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-ink/55">{sub}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Card({ title, icon: Icon, action, className = '', children }) {
  return (
    <section className={'rounded-2xl bg-white p-5 shadow-sm ' + className}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">{Icon && <Icon size={20} className="text-forest" />}{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Switch({ on, onChange, label, small = false }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={'relative shrink-0 rounded-full transition ' + (small ? 'h-6 w-10 ' : 'h-7 w-12 ') + (on ? 'bg-forest' : 'bg-ink/20')}>
      <span className={'absolute top-1 rounded-full bg-white shadow transition-all ' + (small ? 'h-4 w-4 ' + (on ? 'start-5' : 'start-1') : 'h-5 w-5 ' + (on ? 'start-6' : 'start-1'))} />
    </button>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={'block ' + className}>
      <span className="mb-1.5 block text-xs font-medium text-ink/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink/45">{hint}</span>}
    </label>
  );
}

export const inputCls = 'h-11 w-full rounded-xl border border-ink/10 bg-paper/60 px-3 text-sm outline-none focus:border-forest focus:bg-white';
export const btnPrimary = 'flex h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-cream hover:bg-forest-2 disabled:opacity-40';
export const btnGhost = 'flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-forest shadow-sm hover:bg-paper-2';

export function Badge({ children, tone = 'ink' }) {
  const tones = {
    ink: 'bg-paper-2 text-ink/60', green: 'bg-forest/10 text-forest', wine: 'bg-wine/10 text-wine', gold: 'bg-sand/25 text-[#7a5a26]',
  };
  return <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ' + tones[tone]}>{children}</span>;
}

export function Note({ children }) {
  return <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink/50"><Info size={15} className="mt-px shrink-0" />{children}</p>;
}

// Side panel (desktop) / full-height sheet (phone) for editing.
export function Panel({ title, onClose, children, footer }) {
  const { t } = useAdmin();
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="backdrop-in absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="fade-up relative flex h-full w-full max-w-lg flex-col bg-paper shadow-2xl outline-none">
        <div className="flex items-center justify-between gap-3 border-b border-ink/5 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label={t('Close', 'إغلاق')} className="grid h-9 w-9 place-items-center rounded-full bg-paper"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex gap-2 border-t border-ink/5 bg-white px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export const useSar = () => {
  const { t } = useAdmin();
  return (v) => t(`⃁ ${Math.round(v).toLocaleString('en')}`, `${Math.round(v).toLocaleString('en')} ⃁`);
};

// Download rows as a CSV file (Excel-friendly, with BOM for Arabic).
export function downloadCsv(name, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
