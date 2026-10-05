import { useState } from 'react';
import { useStore, DEMO } from '../store';
import { items, GROUPS, LEVELS, UNITS } from '../data/items';
import { branches } from '../data/branches';
import { Card, DemoNote, useFormat } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { ArrowCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react';

export default function Settings() {
  const { t, mins, minOf, setMin, resetDemo } = useStore();
  const f = useFormat();
  const [q, setQ] = useState('');
  const list = items.filter((i) => (i.en + ' ' + i.ar).toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="fade-up">
      <PageHeader title={t('Items & settings', 'الأصناف والإعدادات')} sub={t('Adjust minimums without a developer. Changes apply to every branch straight away.', 'عدّل الحد الأدنى بدون مبرمج، والتعديل يطبق على كل الفروع مباشرة.')} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card title={t(`Items (${items.length})`, `الأصناف (${items.length})`)} action={
          <label className="flex h-9 items-center gap-2 rounded-lg bg-paper px-3 ring-1 ring-ink/10">
            <MagnifyingGlass size={15} className="text-coffee" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search', 'بحث')} aria-label={t('Search items', 'ابحث عن صنف')} className="w-32 bg-transparent text-sm outline-none" />
          </label>
        }>
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b border-ink/10 text-xs text-ink/50">
                <th className="px-5 py-2 text-start font-medium">{t('Item', 'الصنف')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('Counted in', 'وحدة الجرد')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('Minimum', 'الحد الأدنى')}</th>
                <th className="px-5 py-2 text-start font-medium">{t('Order qty', 'كمية الطلب')}</th>
              </tr></thead>
              {GROUPS.map((g) => (
                <tbody key={g.id}>
                  <tr><td colSpan={4} className="bg-paper-2/60 px-5 py-1.5 text-xs font-semibold text-ink/60">{t(g.en, g.ar)}</td></tr>
                  {list.filter((i) => i.group === g.id).map((i) => {
                    const changed = i.id in mins;
                    return (
                      <tr key={i.id} className="border-b border-ink/5 last:border-0">
                        <td className="px-5 py-2">
                          <p className="font-medium">{t(i.en, i.ar)}</p>
                        </td>
                        <td className="px-3 py-2 text-ink/60">{t(UNITS[i.unit].en, UNITS[i.unit].ar)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {i.unit === 'level' ? (
                              <select value={minOf(i) ?? ''} onChange={(e) => setMin(i.id, e.target.value || null)} className="h-9 rounded-lg bg-paper px-2 ring-1 ring-ink/15">
                                {LEVELS.map((l) => <option key={l.id} value={l.id}>{t(l.en, l.ar)}</option>)}
                              </select>
                            ) : (
                              <input type="number" min="0" step="any" value={minOf(i) ?? ''} placeholder="—" aria-label={t(`Minimum for ${i.en}`, `الحد الأدنى لـ ${i.ar}`)}
                                onChange={(e) => setMin(i.id, e.target.value === '' ? null : Number(e.target.value))}
                                className={'num h-9 w-24 rounded-lg px-2 text-center ring-1 focus:outline-none focus:ring-2 focus:ring-coffee/50 ' + (changed ? 'bg-warn-soft ring-warn/30' : 'bg-paper ring-ink/15')} />
                            )}
                            {changed && (
                              <button onClick={() => setMin(i.id, undefined)} title={t(`Back to sheet value (${i.minRaw || '—'})`, `رجوع لقيمة الورقة (${i.minRaw || '—'})`)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/50 hover:bg-paper-2">
                                <ArrowCounterClockwise size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="num px-5 py-2 text-ink/70">{f.order(i.order)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title={t('Access', 'الدخول')}>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-ink/50">{t('Staff password (shared)', 'كلمة مرور الموظفين (موحدة)')}</dt><dd className="num mt-0.5 font-semibold" dir="ltr">{DEMO.staffPassword}</dd></div>
              <div><dt className="text-xs text-ink/50">{t('Management logins', 'حسابات الإدارة')}</dt><dd className="mt-0.5">{t('Up to 5 people, each with their own login', 'حتى ٥ أشخاص، لكل واحد دخول خاص')}</dd></div>
              <div><dt className="text-xs text-ink/50">{t('Staff edit window', 'مدة تعديل الموظف')}</dt><dd className="mt-0.5">{t('30 minutes after sending', '٣٠ دقيقة بعد الإرسال')}</dd></div>
            </dl>
          </Card>
          <Card title={t(`Branches (${branches.length})`, `الفروع (${branches.length})`)}>
            <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">{branches.map((b) => <li key={b.id} className="rounded-lg bg-paper px-3 py-1.5">{t(b.en, b.ar)}</li>)}</ul>
            <p className="mt-3 text-xs text-ink/50">{t('Kav’s branches, taken from their Instagram.', 'فروع كاف كما في حسابهم على إنستقرام.')}</p>
          </Card>
          <DemoNote>
            <span>{t('Demo only. ', 'نسخة تجريبية. ')}<button onClick={resetDemo} className="font-semibold underline underline-offset-2">{t('Reset demo data', 'إعادة البيانات التجريبية')}</button></span>
          </DemoNote>
        </div>
      </div>
    </div>
  );
}
