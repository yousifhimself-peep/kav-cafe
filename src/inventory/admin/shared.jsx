import { useStore } from '../store';
import { countKeys } from '../data/items';
import { lastDays, fmtDate } from '../lib/dates';
import { FileXls, Printer } from '@phosphor-icons/react';

// Red / orange / green counts for one branch on one day.
export function useSummary() {
  const { counts, status } = useStore();
  return (date, branch) => {
    const c = counts[date]?.[branch];
    if (!c) return null;
    const s = { bad: 0, warn: 0, ok: 0, filled: 0, count: c };
    for (const { key, item } of countKeys) {
      const st = status(item, c.values[key]);
      if (st in s) s[st]++;
      if (st !== 'missing') s.filled++;
    }
    return s;
  };
}

// Excel opens UTF-8 CSV with a BOM correctly, Arabic included.
export function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function ExportButtons({ onExcel }) {
  const { t } = useStore();
  return (
    <>
      <button onClick={onExcel} className="flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium shadow-sm ring-1 ring-ink/10 hover:bg-paper-2"><FileXls size={18} className="text-ok" />Excel</button>
      <button onClick={() => window.print()} className="flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium shadow-sm ring-1 ring-ink/10 hover:bg-paper-2"><Printer size={18} />{t('Print / PDF', 'طباعة / PDF')}</button>
    </>
  );
}

export function DayPicker({ value, onChange, days = 14 }) {
  const { ar } = useStore();
  const list = lastDays(days).reverse();
  return (
    <div className="no-print no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {list.map((d, i) => (
        <button key={d} onClick={() => onChange(d)} aria-pressed={value === d}
          className={'shrink-0 rounded-xl px-3 py-2 text-sm transition ' + (value === d ? 'bg-ink font-semibold text-paper' : 'bg-card text-ink/65 ring-1 ring-ink/5 hover:bg-paper-2')}>
          {i === 0 ? (ar ? 'اليوم' : 'Today') : fmtDate(d, ar)}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, tone = '' }) {
  return (
    <div className={'rounded-2xl p-4 shadow-sm ring-1 ring-ink/5 ' + (tone || 'bg-card')}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="num mt-1 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}
