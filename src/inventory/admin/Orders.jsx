import { useMemo, useState } from 'react';
import { useStore, cellLabel } from '../store';
import { branches } from '../data/branches';
import { countKeys } from '../data/items';
import { todayKey, fmtDate } from '../lib/dates';
import { Card, useFormat, DemoNote } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { DayPicker, ExportButtons, downloadCSV } from './shared';

// Everything at or below its minimum, with the reorder quantity from the paper sheet's "Order" column.
export default function Orders() {
  const { t, counts, status } = useStore();
  const f = useFormat();
  const [date, setDate] = useState(todayKey());
  const [view, setView] = useState('item');

  const lines = useMemo(() => {
    const day = counts[date] || {};
    const out = [];
    for (const cell of countKeys) {
      for (const b of branches) {
        const c = day[b.id];
        if (c && status(cell.item, c.values[cell.key]) === 'bad') out.push({ cell, branch: b, value: c.values[cell.key] });
      }
    }
    return out;
  }, [counts, date, status]);

  const byItem = useMemo(() => {
    const m = new Map();
    for (const l of lines) {
      if (!m.has(l.cell.key)) m.set(l.cell.key, { cell: l.cell, list: [] });
      m.get(l.cell.key).list.push(l);
    }
    return [...m.values()].sort((a, b) => b.list.length - a.list.length);
  }, [lines]);

  const byBranch = useMemo(() => branches.map((b) => ({ b, list: lines.filter((l) => l.branch.id === b.id) })).filter((x) => x.list.length), [lines]);

  const exportExcel = () => downloadCSV(`kav-orders-${date}.csv`, view === 'item'
    ? [[t('Item', 'الصنف'), t('Branches', 'عدد الفروع'), t('Order per branch', 'الطلب لكل فرع'), t('Total to order', 'إجمالي الطلب'), t('Branch list', 'الفروع')],
      ...byItem.map(({ cell, list }) => [cellLabel(cell, t), list.length, f.order(cell.item.order), f.order(cell.item.order, list.length), list.map((l) => t(l.branch.en, l.branch.ar)).join(' / ')])]
    : [[t('Branch', 'الفرع'), t('Item', 'الصنف'), t('Count', 'الكمية'), t('Order', 'الطلب')],
      ...byBranch.flatMap(({ b, list }) => list.map((l) => [t(b.en, b.ar), cellLabel(l.cell, t), f.value(l.cell.item, l.value), f.order(l.cell.item.order)]))]);

  return (
    <div className="fade-up">
      <PageHeader title={t('Order list', 'قائمة الطلبات')}
        sub={t(`Items at or below minimum on ${fmtDate(date, false)} · ${lines.length} lines`, `الأصناف عند الحد الأدنى أو أقل · ${fmtDate(date, true)} · ${lines.length} سطر`)}
        actions={<ExportButtons onExcel={exportExcel} />} />
      <DayPicker value={date} onChange={setDate} />

      <div className="no-print mt-4 inline-flex rounded-xl bg-paper-2 p-1">
        {[['item', t('Combined by item', 'مجمّع حسب الصنف')], ['branch', t('By branch', 'حسب الفرع')]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} aria-pressed={view === k} className={'rounded-lg px-4 py-2 text-sm font-medium ' + (view === k ? 'bg-card shadow-sm' : 'text-ink/55')}>{label}</button>
        ))}
      </div>

      {!lines.length ? (
        <Card className="mt-4"><p className="py-10 text-center text-ink/50">{t('Nothing needs ordering for this day.', 'ما فيه أصناف تحتاج طلب في هذا اليوم.')}</p></Card>
      ) : view === 'item' ? (
        <Card className="mt-4">
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-ink/10 text-xs text-ink/50">
                <th className="px-5 py-2 text-start font-medium">{t('Item', 'الصنف')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('Order per branch', 'الطلب لكل فرع')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('Total to order', 'إجمالي الطلب')}</th>
                <th className="px-5 py-2 text-start font-medium">{t('Branches', 'الفروع')}</th>
              </tr></thead>
              <tbody>
                {byItem.map(({ cell, list }) => (
                  <tr key={cell.key} className="border-b border-ink/5 align-top last:border-0">
                    <td className="px-5 py-3 font-semibold">{cellLabel(cell, t)}</td>
                    <td className="num px-3 py-3 text-ink/60">{f.order(cell.item.order)}</td>
                    <td className="px-3 py-3"><span className="num rounded-lg bg-ink px-2.5 py-1 font-semibold text-paper">{f.order(cell.item.order, list.length)}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {list.map((l) => <a key={l.branch.id} href={`#/admin/branch/${l.branch.id}?d=${date}`} className="rounded-full bg-bad-soft px-2 py-0.5 text-xs text-bad hover:underline">{t(l.branch.en, l.branch.ar)}</a>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {byBranch.map(({ b, list }) => (
            <Card key={b.id} title={<a href={`#/admin/branch/${b.id}?d=${date}`} className="hover:underline">{t(b.en, b.ar)}</a>} action={<span className="num rounded-full bg-bad-soft px-2.5 py-0.5 text-xs font-semibold text-bad">{list.length}</span>}>
              <ul className="divide-y divide-ink/5 text-sm">
                {list.map((l) => (
                  <li key={l.cell.key} className="flex items-center justify-between gap-3 py-2">
                    <span className="font-medium">{cellLabel(l.cell, t)} <span className="num text-xs font-normal text-ink/45">({f.value(l.cell.item, l.value)})</span></span>
                    <span className="num shrink-0 font-semibold">{f.order(l.cell.item.order)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <DemoNote className="mt-6">{t('Order quantities come from the “Order” column on the paper sheet. Branches that didn’t count that day aren’t included.', 'كميات الطلب مأخوذة من عمود «الطلب» في ورقة الجرد. الفروع اللي ما جردت في هذا اليوم غير مشمولة.')}</DemoNote>
    </div>
  );
}
