import { useMemo, useState } from 'react';
import { useAdmin } from './AdminApp';
import { byId } from './data';
import { branches, branchById } from '../data/menu';
import { payLabel } from './data';
import { DownloadSimple, Star } from '@phosphor-icons/react';
import { downloadCsv } from './kit';
import { Info, Table, ChartBar } from '@phosphor-icons/react';

const BAR = '#2f8a5f'; // single-series mark colour; validated against the light surface
const DAY = 24 * 60 * 60 * 1000;

export default function Overview() {
  const { t, ar, orders } = useAdmin();
  const now = Date.now();

  const stats = useMemo(() => {
    const recent = orders.filter((o) => now - o.at < DAY);
    const valid = recent.filter((o) => o.status !== 'cancelled');
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const byHour = Array.from({ length: 18 }, (_, i) => ({ h: i + 6, n: 0 }));
    valid.forEach((o) => { const h = new Date(o.at).getHours(); if (h >= 6) byHour[h - 6].n++; });
    const items = {};
    valid.forEach((o) => o.lines.forEach((l) => { items[l.id] = (items[l.id] || 0) + l.qty; }));
    const top = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ id, n }));
    const delivery = valid.filter((o) => o.mode === 'delivery').length;
    return {
      count: valid.length, revenue, avg: valid.length ? revenue / valid.length : 0,
      cancelled: recent.length - valid.length, byHour, top,
      deliveryShare: valid.length ? Math.round((delivery / valid.length) * 100) : 0,
      byBranch: branches.map((b) => ({ id: b.id, n: Math.round(valid.filter((o) => o.branch === b.id).reduce((s, o) => s + o.total, 0)) })).sort((a, b) => b.n - a.n),
      byPay: ['applepay', 'mada', 'cash'].map((id) => ({ id, n: valid.filter((o) => o.pay === id).length })),
      byType: [['pickup', valid.filter((o) => o.mode === 'pickup' && !o.curbside).length], ['curbside', valid.filter((o) => o.curbside).length], ['delivery', delivery]].map(([id, n]) => ({ id, n })),
      rating: (() => { const r = valid.filter((o) => o.rating); return r.length ? (r.reduce((s, o) => s + o.rating, 0) / r.length).toFixed(1) : '—'; })(),
      valid,
      fromApp: recent.filter((o) => o.source === 'app').length,
    };
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  const sar = (v) => t(`\u20C1 ${Math.round(v).toLocaleString('en')}`, `${Math.round(v).toLocaleString('en')} \u20C1`);
  const hourLabel = (h) => {
    const hr = h % 12 || 12;
    return ar ? `${hr}${h < 12 ? 'ص' : 'م'}` : `${hr}${h < 12 ? 'a' : 'p'}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{t('Reports', 'التقارير')}</h1>
          <p className="mt-1 text-sm text-ink/55">{t('Last 24 hours', 'آخر ٢٤ ساعة')}</p>
        </div>
        <button onClick={() => downloadCsv('kav-orders-24h.csv', [
          ['Order', 'Time', 'Branch', 'Type', 'Items', 'Payment', 'Discount', 'Total (SAR)', 'Status', 'Rating'],
          ...stats.valid.map((o) => [o.id, new Date(o.at).toLocaleString('en-GB'), branchById[o.branch]?.en || '', o.mode === 'delivery' ? 'Delivery' : o.curbside ? 'Drive-thru' : 'Pickup', o.lines.map((l) => `${l.qty}x ${byId[l.id]?.en || l.id}`).join('; '), o.pay, o.discount || 0, o.total, o.status, o.rating || '']),
        ])} className="flex h-9 items-center gap-2 rounded-full bg-forest px-4 text-xs font-semibold text-cream"><DownloadSimple size={15} />{t('Export to Excel (CSV)', 'تصدير إكسل (CSV)')}</button>
        <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-ink/60 shadow-sm">
          <Info size={15} /> {t(`Mostly sample data · ${stats.fromApp} real app order(s)`, `بيانات تجريبية غالبًا · ${stats.fromApp} طلب حقيقي من التطبيق`)}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('Orders', 'الطلبات')} value={stats.count.toLocaleString('en')} sub={stats.cancelled ? t(`${stats.cancelled} cancelled`, `${stats.cancelled} ملغي`) : t('none cancelled', 'بدون إلغاء')} />
        <Stat label={t('Revenue', 'الإيرادات')} value={sar(stats.revenue)} sub={t('incl. delivery fees', 'شامل رسوم التوصيل')} />
        <Stat label={t('Average order', 'متوسط الطلب')} value={sar(stats.avg)} sub={t('per order', 'لكل طلب')} />
        <Stat label={t('Customer rating', 'تقييم العملاء')} value={<span className="flex items-center gap-1.5">{stats.rating}<Star size={22} weight="fill" className="text-sand" /></span>} sub={t(`delivery ${stats.deliveryShare}% of orders`, `التوصيل ${stats.deliveryShare}٪ من الطلبات`)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <ChartCard className="xl:col-span-3" title={t('Orders by hour', 'الطلبات حسب الساعة')} subtitle={t('Opening hours, 6 AM – midnight', 'ساعات العمل ٦ص – ١٢م')}
          table={{ head: [t('Hour', 'الساعة'), t('Orders', 'الطلبات')], rows: stats.byHour.map((b) => [hourLabel(b.h), b.n]) }}>
          <Columns data={stats.byHour} label={(b) => hourLabel(b.h)} t={t} />
        </ChartCard>
        <ChartCard className="xl:col-span-2" title={t('Top items', 'الأكثر طلبًا')} subtitle={t('Units sold', 'عدد الوحدات')}
          table={{ head: [t('Item', 'الصنف'), t('Units', 'الوحدات')], rows: stats.top.map((x) => [t(byId[x.id].en, byId[x.id].ar), x.n]) }}>
          <Bars data={stats.top} name={(x) => t(byId[x.id].en, byId[x.id].ar)} t={t} />
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard title={t('Sales by branch', 'المبيعات حسب الفرع')} subtitle={t('SAR, last 24 hours', 'ريال، آخر ٢٤ ساعة')}
          table={{ head: [t('Branch', 'الفرع'), t('SAR', 'ريال')], rows: stats.byBranch.map((x) => [t(branchById[x.id].en, branchById[x.id].ar), x.n]) }}>
          <Bars data={stats.byBranch} name={(x) => t(branchById[x.id].en, branchById[x.id].ar)} t={t} />
        </ChartCard>
        <ChartCard title={t('How customers pick up', 'طريقة الاستلام')} subtitle={t('Orders', 'الطلبات')}
          table={{ head: [t('Type', 'النوع'), t('Orders', 'الطلبات')], rows: stats.byType.map((x) => [x.id, x.n]) }}>
          <Bars data={stats.byType} name={(x) => ({ pickup: t('Counter pickup', 'استلام من الكاونتر'), curbside: t('Drive-thru / car', 'درايف ثرو / سيارة'), delivery: t('Delivery', 'توصيل') }[x.id])} t={t} />
        </ChartCard>
        <ChartCard title={t('Payment methods', 'طرق الدفع')} subtitle={t('Orders', 'الطلبات')}
          table={{ head: [t('Method', 'الطريقة'), t('Orders', 'الطلبات')], rows: stats.byPay.map((x) => [payLabel(x.id, 'pickup', t), x.n]) }}>
          <Bars data={stats.byPay} name={(x) => payLabel(x.id, 'pickup', t)} t={t} />
        </ChartCard>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-ink/50">{sub}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, table, children, className = '' }) {
  const { t } = useAdmin();
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={'rounded-2xl bg-white p-5 shadow-sm ' + className}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-semibold">{title}</h2><p className="text-xs text-ink/50">{subtitle}</p></div>
        <button onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2.5 py-1.5 text-xs text-ink/60 hover:bg-paper">
          {asTable ? <><ChartBar size={14} />{t('Chart', 'رسم')}</> : <><Table size={14} />{t('Table', 'جدول')}</>}
        </button>
      </div>
      <div className="mt-4">
        {asTable ? (
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink/50"><tr>{table.head.map((h, i) => <th key={h} className={'py-1.5 font-medium ' + (i ? 'text-end' : 'text-start')}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-ink/5">{table.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={'py-1.5 tabular-nums ' + (i ? 'text-end' : '')}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : children}
      </div>
    </section>
  );
}

// Column chart: one series, 4px rounded tops, hairline grid, hover tooltip, peak labelled.
function Columns({ data, label, t }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  const top = Math.max(2, Math.ceil(max / 2) * 2);
  const peak = data.reduce((a, b) => (b.n > a.n ? b : a), data[0]);
  const H = 250;
  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <div className="flex gap-2">
        <div className="flex w-6 flex-col justify-between text-end text-[11px] tabular-nums text-ink/40" style={{ height: H }}>
          <span>{top}</span><span>{top / 2}</span><span>0</span>
        </div>
        <div className="relative flex-1" style={{ height: H }}>
          {[0, 0.5, 1].map((f) => <div key={f} className="absolute inset-x-0 h-px bg-ink/[0.07]" style={{ top: `${f * 100}%` }} />)}
          <div className="absolute inset-0 flex items-end gap-[2px]" dir="ltr">
            {data.map((d, i) => (
              <div key={i} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}
                aria-label={`${label(d)}: ${d.n}`}>
                {d === peak && d.n > 0 && <span className="absolute text-[11px] font-semibold tabular-nums text-ink/70" style={{ bottom: `calc(${(d.n / top) * 100}% + 4px)` }}>{d.n}</span>}
                <div className="w-full max-w-6 rounded-t-[4px] transition-opacity" style={{ height: `${(d.n / top) * 100}%`, background: BAR, opacity: hover === null || hover === i ? 1 : 0.45 }} />
              </div>
            ))}
          </div>
          {hover !== null && (
            <div className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-cream shadow-lg" style={{ left: `${((hover + 0.5) / data.length) * 100}%`, bottom: `calc(${(data[hover].n / top) * 100}% + 22px)` }}>
              <span className="font-semibold">{label(data[hover])}</span> · {t(`${data[hover].n} orders`, `${data[hover].n} طلب`)}
            </div>
          )}
        </div>
      </div>
      <div className="ms-8 mt-2 flex text-[11px] text-ink/40" dir="ltr">
        {data.map((d, i) => <span key={i} className="flex-1 text-center">{i % 3 === 0 ? label(d) : ''}</span>)}
      </div>
    </div>
  );
}

// Horizontal bars: value at the tip, names in text ink.
function Bars({ data, name, t }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  if (!data.length) return <p className="py-10 text-center text-sm text-ink/45">{t('No orders yet', 'لا توجد طلبات بعد')}</p>;
  return (
    <ul className="space-y-3" onMouseLeave={() => setHover(null)}>
      {data.map((d, i) => (
        <li key={d.id} onMouseEnter={() => setHover(i)} className="text-sm">
          <div className="mb-1 flex justify-between"><span className="truncate">{name(d)}</span></div>
          <div className="flex items-center gap-2">
            <div className="h-5 rounded-e-[4px] transition-opacity" style={{ width: `${(d.n / max) * 85}%`, background: BAR, opacity: hover === null || hover === i ? 1 : 0.45 }} />
            <span className="text-xs font-semibold tabular-nums text-ink/70">{d.n}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
