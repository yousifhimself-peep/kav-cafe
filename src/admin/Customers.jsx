import { useMemo, useState } from 'react';
import { useAdmin } from './AdminApp';
import { branchById } from '../data/menu';
import { byId, sampleCustomers, sampleReviews, ago } from './data';
import { MagnifyingGlass, Star, DownloadSimple, ChatCircleText } from '@phosphor-icons/react';
import { PageHead, Card, Badge, Note, btnGhost, useSar, downloadCsv } from './kit';

export default function Customers() {
  const { t, orders } = useAdmin();
  const sar = useSar();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('customers');
  const people = useMemo(sampleCustomers, []);
  const now = Date.now();

  const reviews = useMemo(() => [
    ...orders.filter((o) => o.source === 'app' && o.rating).map((o) => ({ id: o.id, rating: o.rating, comment: { en: o.comment, ar: o.comment }, who: { en: t('App customer', 'عميل التطبيق'), ar: 'عميل التطبيق' }, at: o.ratedAt || o.at, branch: o.branch, app: true })),
    ...sampleReviews(now),
  ], [orders]); // eslint-disable-line react-hooks/exhaustive-deps
  const ratings = [...orders.filter((o) => o.rating).map((o) => o.rating), ...reviews.filter((r) => !r.app).map((r) => r.rating)];
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => [n, ratings.filter((r) => r === n).length]);

  const query = q.trim().toLowerCase();
  const list = people.filter((p) => (p.en + ' ' + p.ar + ' ' + p.phone).toLowerCase().includes(query));
  const exportCsv = () => downloadCsv('kav-customers.csv', [
    ['Name', 'Phone', 'Orders', 'Spent (SAR)', 'Stamps', 'Favourite', 'Usual branch', 'Last order (days ago)'],
    ...people.map((p) => [p.en, p.phone, p.orders, p.spent, p.stamps, byId[p.fav]?.en, branchById[p.branch]?.en, p.lastDays]),
  ]);

  return (
    <div>
      <PageHead title={t('Customers & reviews', 'العملاء والتقييمات')}
        sub={t('Who orders, how often, what they love — and what they say after each order.', 'مين يطلب، كم مرة، وش يحب — ووش يقول بعد كل طلب.')}
        action={<button onClick={exportCsv} className={btnGhost}><DownloadSimple size={17} />{t('Export CSV', 'تصدير CSV')}</button>} />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat v="1,338" l={t('app customers', 'عميل بالتطبيق')} />
        <Stat v="218" l={t('active this week', 'نشط هذا الأسبوع')} />
        <Stat v={sar(34.6)} l={t('average order', 'متوسط الطلب')} />
        <Stat v={<span className="flex items-center gap-1.5">{avg.toFixed(1)}<Star size={20} weight="fill" className="text-sand" /></span>} l={t(`${ratings.length} ratings`, `${ratings.length} تقييم`)} />
      </div>

      <div className="mt-5 inline-flex rounded-xl bg-white p-1 shadow-sm">
        {[['customers', t('Customers', 'العملاء')], ['reviews', t('Reviews', 'التقييمات')]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={'rounded-lg px-4 py-2 text-sm font-medium ' + (tab === id ? 'bg-forest text-cream' : 'text-ink/60')}>{l}</button>
        ))}
      </div>

      {tab === 'customers' ? (
        <Card className="mt-4">
          <label className="flex h-11 items-center gap-2 rounded-xl bg-paper px-4">
            <MagnifyingGlass size={18} className="text-forest" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search name or phone', 'ابحث بالاسم أو الجوال')} aria-label={t('Search customers', 'ابحث عن عميل')} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <div className="-mx-5 mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink/50">
                <tr className="border-b border-ink/5">
                  <th className="px-5 py-2 text-start font-semibold">{t('Customer', 'العميل')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('Orders', 'الطلبات')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('Spent', 'الإنفاق')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Loyalty', 'الولاء')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Favourite', 'المفضل')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('Usual branch', 'الفرع المعتاد')}</th>
                  <th className="px-5 py-2 text-end font-semibold">{t('Last order', 'آخر طلب')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {list.map((p, i) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest/10 text-sm font-semibold text-forest">{t(p.en, p.ar).slice(0, 1)}</span>
                        <span><span className="block font-medium">{t(p.en, p.ar)} {i < 3 && !query && <Badge tone="gold">VIP</Badge>}</span><span className="text-xs text-ink/45" dir="ltr">{p.phone}</span></span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-end tabular-nums">{p.orders}</td>
                    <td className="px-3 py-3 text-end tabular-nums">{sar(p.spent)}</td>
                    <td className="px-3 py-3 text-ink/60">{t(`${p.stamps}/8 stamps`, `${p.stamps}/٨ أختام`)}{p.rewards > 0 && <span className="block text-xs text-ink/40">{t(`${p.rewards} rewards used`, `${p.rewards} مكافأة`)}</span>}</td>
                    <td className="px-3 py-3">{byId[p.fav] ? t(byId[p.fav].en, byId[p.fav].ar) : '—'}</td>
                    <td className="px-3 py-3 text-ink/60">{branchById[p.branch] ? t(branchById[p.branch].en, branchById[p.branch].ar).split(' · ')[0] : '—'}</td>
                    <td className="px-5 py-3 text-end text-ink/60">{p.lastDays === 0 ? t('today', 'اليوم') : t(`${p.lastDays} d ago`, `قبل ${p.lastDays} يوم`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[280px_1fr]">
          <Card title={t('Rating', 'التقييم')}>
            <p className="flex items-center gap-2 text-4xl font-semibold">{avg.toFixed(1)}<Star size={30} weight="fill" className="text-sand" /></p>
            <p className="text-xs text-ink/50">{t(`from ${ratings.length} ratings`, `من ${ratings.length} تقييم`)}</p>
            <ul className="mt-4 space-y-1.5">
              {dist.map(([n, c]) => (
                <li key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-3 tabular-nums">{n}</span><Star size={12} weight="fill" className="text-sand" />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2"><span className="block h-full rounded-full bg-sand" style={{ width: `${ratings.length ? (c / ratings.length) * 100 : 0}%` }} /></span>
                  <span className="w-6 text-end tabular-nums text-ink/50">{c}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={t('Latest reviews', 'آخر التقييمات')} icon={ChatCircleText}>
            <ul className="divide-y divide-ink/5">
              {reviews.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">{t(r.who.en, r.who.ar)}{r.app && <Badge tone="green">{t('From app', 'من التطبيق')}</Badge>}</span>
                    <span className="flex gap-0.5 text-sand" dir="ltr" aria-label={`${r.rating}/5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} weight={n <= r.rating ? 'fill' : 'regular'} />)}</span>
                  </div>
                  {t(r.comment.en, r.comment.ar) && <p className="mt-1 text-sm text-ink/75">“{t(r.comment.en, r.comment.ar)}”</p>}
                  <p className="mt-1 text-xs text-ink/45">{ago(r.at, now, t)}{branchById[r.branch] && <> · {t(branchById[r.branch].en, branchById[r.branch].ar)}</>}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Note>{t('Customer names and figures are sample data for the demo. Ratings you leave in the app after an order appear here live.', 'أسماء العملاء والأرقام تجريبية. التقييمات اللي ترسلها من التطبيق بعد الطلب تظهر هنا مباشرة.')}</Note>
    </div>
  );
}

function Stat({ v, l }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-2xl font-semibold tabular-nums">{v}</p>
      <p className="text-xs text-ink/55">{l}</p>
    </div>
  );
}
