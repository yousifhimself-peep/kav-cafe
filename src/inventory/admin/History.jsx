import { useState } from 'react';
import { useStore, cellLabel } from '../store';
import { branches } from '../data/branches';
import { countKeys, GROUPS } from '../data/items';
import { lastDays, fmtDate } from '../lib/dates';
import { Card, Dot, useFormat } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { ExportButtons, downloadCSV } from './shared';

const TONE = { ok: 'bg-ok-soft text-ok', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad', none: 'bg-paper-2/70 text-ink/70', missing: 'text-ink/25' };

// One item across every branch for the last 14 days — a quick way to spot who runs out often.
export default function History() {
  const { t, ar, counts, status, minOf } = useStore();
  const f = useFormat();
  const [key, setKey] = useState('coffee-bean');
  const cell = countKeys.find((c) => c.key === key) || countKeys[0];
  const days = lastDays(14);
  const val = (d, b) => counts[d]?.[b]?.values[cell.key];

  const exportExcel = () => downloadCSV(`kav-history-${cell.key}.csv`, [
    [t('Branch', 'الفرع'), ...days],
    ...branches.map((b) => [t(b.en, b.ar), ...days.map((d) => f.value(cell.item, val(d, b.id)))]),
  ]);

  return (
    <div className="fade-up">
      <PageHeader title={t('History', 'السجل التاريخي')} sub={t('One item, every branch, last 14 days. Tap a cell to open that day’s count.', 'صنف واحد لكل الفروع خلال آخر ١٤ يوم. اضغط أي خانة لفتح جرد ذاك اليوم.')}
        actions={<ExportButtons onExcel={exportExcel} />} />

      <label className="no-print flex max-w-md flex-col gap-1.5">
        <span className="text-sm font-medium">{t('Item', 'الصنف')}</span>
        <select value={cell.key} onChange={(e) => setKey(e.target.value)} className="h-11 rounded-xl bg-card px-3 shadow-sm ring-1 ring-ink/10">
          {GROUPS.map((g) => (
            <optgroup key={g.id} label={t(g.en, g.ar)}>
              {countKeys.filter((c) => c.item.group === g.id).map((c) => <option key={c.key} value={c.key}>{cellLabel(c, t)}</option>)}
            </optgroup>
          ))}
        </select>
      </label>

      <Card className="mt-4" title={cellLabel(cell, t)} action={<span className="text-xs text-ink/50">{t('Minimum', 'الحد الأدنى')}: <b className="num">{f.min(cell.item, minOf(cell.item))}</b></span>}>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky start-0 bg-card px-2 text-start font-medium text-ink/50">{t('Branch', 'الفرع')}</th>
                {days.map((d) => <th key={d} className="px-1 text-center font-medium text-ink/50">{fmtDate(d, ar, { day: 'numeric', month: 'numeric' })}</th>)}
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id}>
                  <th className="sticky start-0 whitespace-nowrap bg-card px-2 text-start text-[13px] font-medium">{t(b.en, b.ar)}</th>
                  {days.map((d) => {
                    const v = val(d, b.id);
                    const s = counts[d]?.[b.id] ? status(cell.item, v) : 'missing';
                    return (
                      <td key={d} className="p-0">
                        <a href={`#/admin/branch/${b.id}?d=${d}`} title={f.value(cell.item, v)}
                          className={'num flex h-9 min-w-12 items-center justify-center rounded-md px-1 font-semibold transition hover:ring-2 hover:ring-ink/20 ' + TONE[s]}>
                          {s === 'missing' ? '·' : cell.item.unit === 'level' ? f.value(cell.item, v) : f.num(v)}
                        </a>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/60">
          {[['ok', t('Good', 'جيد')], ['warn', t('Getting low', 'قارب')], ['bad', t('At minimum', 'الحد الأدنى')], ['missing', t('· no count that day', '· لا يوجد جرد')]].map(([s, l]) => (
            <span key={s} className="flex items-center gap-1.5">{s !== 'missing' && <Dot s={s} />}{l}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
