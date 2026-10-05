import { useMemo, useState } from 'react';
import { useStore, cellLabel } from '../store';
import { go } from '../router';
import { branchById } from '../data/branches';
import { countKeys, GROUPS, LEVELS } from '../data/items';
import { todayKey, fmtDate, fmtTime, addDays, dateKey } from '../lib/dates';
import { Card, StatusPill, useFormat } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { DayPicker, ExportButtons, downloadCSV, useSummary } from './shared';
import { ArrowRight, PencilSimple, Trash, Check, X, ArrowUp, ArrowDown } from '@phosphor-icons/react';

export default function BranchDetail({ id, params }) {
  const { t, ar, counts, status, minOf, saveCount, deleteCount, manager, setToast } = useStore();
  const f = useFormat();
  const summary = useSummary();
  const branch = branchById[id];
  const [date, setDateState] = useState(params.d || todayKey());
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null); // draft values while a manager corrects the count
  const [confirmDelete, setConfirmDelete] = useState(false);

  const count = counts[date]?.[id];
  const s = summary(date, id);
  const prev = useMemo(() => {
    for (let i = 1; i <= 14; i++) {
      const c = counts[dateKey(addDays(new Date(date + 'T12:00:00'), -i))]?.[id];
      if (c) return c.values;
    }
    return {};
  }, [counts, date, id]);

  if (!branch) return <p>{t('Branch not found.', 'الفرع غير موجود.')}</p>;

  const setDate = (d) => { setDateState(d); setEditing(null); setConfirmDelete(false); history.replaceState(null, '', `#/admin/branch/${id}?d=${d}`); };
  const values = editing || count?.values || {};
  const rows = countKeys.map((cell) => ({ cell, v: values[cell.key], p: prev[cell.key], st: status(cell.item, values[cell.key]) }))
    .filter((r) => filter === 'all' || r.st === filter);

  const exportExcel = () => downloadCSV(`kav-${id}-${date}.csv`, [
    [t('Branch', 'الفرع'), t(branch.en, branch.ar), t('Date', 'التاريخ'), date, t('Counted by', 'الموظف'), count?.by || ''],
    [],
    [t('Item', 'الصنف'), t('Count', 'الكمية'), t('Previous', 'الجرد السابق'), t('Minimum', 'الحد الأدنى'), t('Status', 'الحالة'), t('Suggested order', 'الطلب المقترح')],
    ...countKeys.map((cell) => {
      const st = status(cell.item, values[cell.key]);
      return [cellLabel(cell, t), f.value(cell.item, values[cell.key]), f.value(cell.item, prev[cell.key]), f.min(cell.item, minOf(cell.item)),
        { ok: t('Good', 'جيد'), warn: t('Getting low', 'قارب'), bad: t('At minimum', 'الحد الأدنى'), none: '', missing: t('Not counted', 'لم يُجرد') }[st],
        st === 'bad' ? f.order(cell.item.order) : ''];
    }),
  ]);

  const saveEdit = () => {
    saveCount(date, id, Object.fromEntries(Object.entries(editing).filter(([, v]) => v !== '' && v != null)), manager, 'manager');
    setEditing(null);
    setToast(t('Count updated — saved in the edit log', 'تم تعديل الجرد — مسجل في سجل التعديلات'));
  };

  return (
    <div className="fade-up">
      <button onClick={() => go('admin/branches')} className="no-print mb-3 flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink"><ArrowRight size={16} className="ltr:rotate-180" />{t('All branches', 'كل الفروع')}</button>
      <PageHeader
        title={t(branch.en, branch.ar)}
        sub={count
          ? t(`${fmtDate(date, false, { weekday: 'long', day: 'numeric', month: 'long' })} · counted by ${count.by} at ${fmtTime(count.at, false)}${count.editedAt ? ` · edited by ${count.editedBy}` : ''}`,
            `${fmtDate(date, true, { weekday: 'long', day: 'numeric', month: 'long' })} · جرده ${count.by} الساعة ${fmtTime(count.at, true)}${count.editedAt ? ` · عدّله ${count.editedBy}` : ''}`)
          : fmtDate(date, ar, { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={count && !editing && <>
          <ExportButtons onExcel={exportExcel} />
          <button onClick={() => setEditing({ ...count.values })} className="flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium shadow-sm ring-1 ring-ink/10 hover:bg-paper-2"><PencilSimple size={18} />{t('Edit', 'تعديل')}</button>
          <button onClick={() => setConfirmDelete(true)} className="flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium text-bad shadow-sm ring-1 ring-bad/20 hover:bg-bad-soft"><Trash size={18} />{t('Delete', 'حذف')}</button>
        </>}
      />
      <DayPicker value={date} onChange={setDate} />

      {confirmDelete && (
        <div role="alertdialog" className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-bad-soft p-4 text-sm text-bad">
          <span className="flex-1">{t('Delete this day’s count for this branch? Use this when staff entered it into the wrong branch. It will be recorded in the edit log.', 'حذف جرد هذا اليوم لهذا الفرع؟ استخدمه إذا الموظف سجّل في فرع غلط. يتسجل الحذف في سجل التعديلات.')}</span>
          <button onClick={() => setConfirmDelete(false)} className="rounded-lg bg-card px-3 py-2 font-medium text-ink">{t('Cancel', 'إلغاء')}</button>
          <button onClick={() => { deleteCount(date, id, manager); setConfirmDelete(false); setToast(t('Count deleted', 'تم حذف الجرد')); }} className="rounded-lg bg-bad px-3 py-2 font-medium text-white">{t('Delete', 'حذف')}</button>
        </div>
      )}

      {!count ? (
        <Card className="mt-4"><p className="py-10 text-center text-ink/50">{t('This branch didn’t send a count on this day.', 'هذا الفرع ما أرسل جرد في هذا اليوم.')}</p></Card>
      ) : (
        <Card className="mt-4"
          title={
            <div className="no-print flex flex-wrap gap-1.5">
              {[['all', t(`All (${countKeys.length})`, `الكل (${countKeys.length})`)], ['bad', t(`At minimum (${s.bad})`, `الحد الأدنى (${s.bad})`)], ['warn', t(`Getting low (${s.warn})`, `قارب (${s.warn})`)], ['ok', t(`Good (${s.ok})`, `جيد (${s.ok})`)]].map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={'rounded-full px-3 py-1.5 text-sm font-medium ' + (filter === k ? 'bg-ink text-paper' : 'bg-paper-2 text-ink/65')}>{label}</button>
              ))}
            </div>
          }
          action={editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 rounded-lg bg-paper-2 px-3 py-2 text-sm font-medium"><X size={16} />{t('Cancel', 'إلغاء')}</button>
              <button onClick={saveEdit} className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper"><Check size={16} />{t('Save changes', 'حفظ التعديل')}</button>
            </div>
          )}>
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-start text-xs text-ink/50">
                  <th className="px-5 py-2 text-start font-medium">{t('Item', 'الصنف')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('Count', 'الكمية')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('Change', 'التغيّر')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('Minimum', 'الحد الأدنى')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('Status', 'الحالة')}</th>
                  <th className="px-5 py-2 text-start font-medium">{t('Suggested order', 'الطلب المقترح')}</th>
                </tr>
              </thead>
              {GROUPS.map((g) => {
                const list = rows.filter((r) => r.cell.item.group === g.id);
                if (!list.length) return null;
                return (
                  <tbody key={g.id}>
                    <tr><td colSpan={6} className="bg-paper-2/60 px-5 py-1.5 text-xs font-semibold text-ink/60">{t(g.en, g.ar)}</td></tr>
                    {list.map(({ cell, v, p, st }) => {
                      const diff = typeof v === 'number' && typeof p === 'number' ? Math.round((v - p) * 100) / 100 : null;
                      return (
                        <tr key={cell.key} className="border-b border-ink/5 last:border-0">
                          <td className="px-5 py-2.5 font-medium">{cellLabel(cell, t)}</td>
                          <td className="px-3 py-2.5">
                            {editing ? <EditCell item={cell.item} value={editing[cell.key]} onChange={(nv) => setEditing((e) => ({ ...e, [cell.key]: nv }))} /> : <span className="num">{f.value(cell.item, v)}</span>}
                          </td>
                          <td className="num px-3 py-2.5">
                            {diff == null || diff === 0 ? <span className="text-ink/30">—</span> : (
                              <span className={'inline-flex items-center gap-0.5 ' + (diff < 0 ? 'text-ink/60' : 'text-ok')}>
                                {diff < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}{f.num(Math.abs(diff))}
                              </span>
                            )}
                          </td>
                          <td className="num px-3 py-2.5 text-ink/55">{f.min(cell.item, minOf(cell.item))}</td>
                          <td className="px-3 py-2.5"><StatusPill s={st} /></td>
                          <td className="px-5 py-2.5 font-medium">{st === 'bad' ? f.order(cell.item.order) : <span className="text-ink/25">—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                );
              })}
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function EditCell({ item, value, onChange }) {
  const { t } = useStore();
  if (item.unit === 'level') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || '')} className="h-9 rounded-lg bg-paper px-2 ring-1 ring-ink/15">
        <option value="">—</option>
        {LEVELS.map((l) => <option key={l.id} value={l.id}>{t(l.en, l.ar)}</option>)}
      </select>
    );
  }
  return (
    <input type="number" inputMode="decimal" min="0" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className="num h-9 w-24 rounded-lg bg-paper px-2 text-center ring-1 ring-ink/15 focus:outline-none focus:ring-2 focus:ring-coffee/50" />
  );
}
