import { useMemo } from 'react';
import { useStore, cellLabel } from '../store';
import { branches } from '../data/branches';
import { countKeys } from '../data/items';
import { todayKey, fmtDate, fmtTime } from '../lib/dates';
import { Card, Dot, DemoNote } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { useSummary, Stat } from './shared';
import { WarningCircle, CaretLeft, ShoppingCart } from '@phosphor-icons/react';

export default function Overview() {
  const { t, ar, counts, status, resetDemo } = useStore();
  const summary = useSummary();
  const today = todayKey();
  const rows = branches.map((b) => ({ b, s: summary(today, b.id) }));
  const missing = rows.filter((r) => !r.s);
  const submitted = rows.length - missing.length;
  const totalBad = rows.reduce((n, r) => n + (r.s?.bad || 0), 0);
  const branchesWithBad = rows.filter((r) => r.s?.bad).length;

  // Items short in the most branches today.
  const shortest = useMemo(() => {
    const day = counts[today] || {};
    return countKeys
      .map((cell) => ({ cell, n: Object.values(day).filter((c) => status(cell.item, c.values[cell.key]) === 'bad').length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 8);
  }, [counts, today, status]);

  return (
    <div className="fade-up">
      <PageHeader title={t('Today', 'اليوم')} sub={fmtDate(today, ar, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('Branches counted', 'الفروع اللي جردت')} value={`${submitted}/${branches.length}`} sub={t('today', 'اليوم')} />
        <Stat label={t('Not counted yet', 'لم تجرد بعد')} value={missing.length} tone={missing.length ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'} sub={t('branches', 'فروع')} />
        <Stat label={t('Items at minimum', 'أصناف عند الحد الأدنى')} value={totalBad} tone="bg-bad-soft text-bad" sub={t(`across ${branchesWithBad} branches`, `في ${branchesWithBad} فرع`)} />
        <a href="#/admin/orders" className="rounded-2xl bg-ink p-4 text-paper shadow-sm transition hover:bg-ink-2">
          <p className="text-xs font-medium text-paper/70">{t('Order list', 'قائمة الطلبات')}</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold"><ShoppingCart size={22} weight="fill" />{t('Ready to order', 'جاهزة للطلب')}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-paper/60">{t('Open', 'عرض')}<CaretLeft size={12} className="ltr:rotate-180" /></p>
        </a>
      </div>

      {missing.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-warn-soft p-4 text-warn">
          <WarningCircle size={22} weight="fill" className="shrink-0" />
          <b className="text-sm">{t('Haven’t sent today’s count:', 'ما أرسلت جرد اليوم:')}</b>
          {missing.map(({ b }) => <span key={b.id} className="rounded-full bg-card px-3 py-1 text-sm font-medium text-ink">{t(b.en, b.ar)}</span>)}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card title={t('All branches', 'كل الفروع')}>
          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {rows.map(({ b, s }) => <BranchTile key={b.id} b={b} s={s} date={today} />)}
          </div>
        </Card>

        <Card title={t('Short in most branches', 'الأكثر نقصًا اليوم')}>
          {shortest.length ? (
            <ul className="space-y-3">
              {shortest.map(({ cell, n }) => (
                <li key={cell.key}>
                  <div className="flex items-center justify-between text-sm"><span className="font-medium">{cellLabel(cell, t)}</span><span className="num text-bad">{n} {t('branches', 'فرع')}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-2"><div className="h-full rounded-full bg-bad" style={{ width: `${(n / branches.length) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink/50">{t('Nothing at minimum today.', 'ما فيه أصناف عند الحد الأدنى اليوم.')}</p>}
        </Card>
      </div>

      <DemoNote className="mt-6">
        <span>{t('Demo with sample branches and 14 days of generated counts. ', 'نسخة تجريبية بفروع وبيانات عيّنة لآخر ١٤ يوم. ')}
          <button onClick={resetDemo} className="font-semibold underline underline-offset-2">{t('Reset demo data', 'إعادة البيانات التجريبية')}</button></span>
      </DemoNote>
    </div>
  );
}

export function BranchTile({ b, s, date }) {
  const { t, ar } = useStore();
  return (
    <a href={`#/admin/branch/${b.id}?d=${date}`} className={'group block rounded-xl p-3.5 ring-1 transition hover:shadow-md ' + (s ? 'bg-paper/60 ring-ink/5' : 'bg-warn-soft/60 ring-warn/20')}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-snug">{t(b.en, b.ar)}</p>
        <CaretLeft size={16} className="mt-1 shrink-0 text-ink/30 transition group-hover:text-ink ltr:rotate-180" />
      </div>
      {s ? (
        <>
          <p className="mt-0.5 text-xs text-ink/45">{s.count.by} · {fmtTime(s.count.editedAt || s.count.at, ar)}</p>
          <div className="mt-3 flex gap-3 text-sm">
            <span className="flex items-center gap-1.5"><Dot s="bad" /><b className="num">{s.bad}</b></span>
            <span className="flex items-center gap-1.5"><Dot s="warn" /><b className="num">{s.warn}</b></span>
            <span className="flex items-center gap-1.5"><Dot s="ok" /><b className="num">{s.ok}</b></span>
          </div>
        </>
      ) : <p className="mt-3 text-sm font-medium text-warn">{t('Not counted', 'لم يُجرد')}</p>}
    </a>
  );
}
