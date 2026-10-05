import { useEffect, useRef, useState } from 'react';
import { useAdmin } from './AdminApp';
import { byId, describe, payLabel, ago } from './data';
import { itemCount } from '../components/ui';
import { branchById, branches } from '../data/menu';
import { Storefront, Moped, Car, Chair, Clock, NotePencil, MapPin, Check, X, ArrowRight, Bell, CookingPot, BellRinging, CheckCircle, Tray } from '@phosphor-icons/react';

const COLUMNS = [
  { id: 'new', en: 'New', ar: 'جديدة', icon: Bell, tone: 'bg-wine text-cream' },
  { id: 'preparing', en: 'Preparing', ar: 'قيد التحضير', icon: CookingPot, tone: 'bg-[#b7791f] text-cream' },
  { id: 'ready', en: 'Ready', ar: 'جاهزة', icon: BellRinging, tone: 'bg-forest text-cream' },
  { id: 'completed', en: 'Completed', ar: 'مكتملة', icon: CheckCircle, tone: 'bg-ink/70 text-cream' },
];

const DONE_WINDOW = 3 * 60 * 60 * 1000; // completed/cancelled orders stay visible for 3 hours

export default function Orders() {
  const { t, orders } = useAdmin();
  const [filter, setFilter] = useState('all');
  const [branchF, setBranchF] = useState('all');
  const [tab, setTab] = useState('new');
  const [now, setNow] = useState(Date.now());
  const [flash, setFlash] = useState(null);
  const seen = useRef(null);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(id); }, []);

  // Announce orders that arrive from the customer app while the board is open.
  useEffect(() => {
    const ids = new Set(orders.filter((o) => o.source === 'app').map((o) => o.id));
    if (seen.current) {
      const fresh = [...ids].filter((id) => !seen.current.has(id));
      if (fresh.length) { setFlash(fresh[0]); setTab('new'); setTimeout(() => setFlash(null), 6000); }
    }
    seen.current = ids;
  }, [orders]);

  const typeOf = (o) => (o.mode === 'delivery' ? 'delivery' : o.curbside ? 'curbside' : o.table ? 'dinein' : 'pickup');
  const visible = orders.filter((o) => (filter === 'all' || typeOf(o) === filter) && (branchF === 'all' || o.branch === branchF) && (!['completed', 'cancelled'].includes(o.status) || now - (o.updatedAt || o.at) < DONE_WINDOW));
  const byCol = (id) => visible.filter((o) => (id === 'completed' ? ['completed', 'cancelled'].includes(o.status) : o.status === id));

  const filters = [['all', t('All', 'الكل')], ['pickup', t('Pickup', 'استلام')], ['curbside', t('Drive-thru / car', 'درايف ثرو / سيارة')], ['delivery', t('Delivery', 'توصيل')]];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{t('Live orders', 'الطلبات المباشرة')}</h1>
          <p className="mt-1 text-sm text-ink/55">{t('Orders placed in the customer app appear here instantly. Sample orders are marked.', 'الطلبات من تطبيق العملاء تظهر هنا مباشرة. الطلبات التجريبية معلّمة.')}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('Filter by type', 'تصفية حسب النوع')}>
          <select value={branchF} onChange={(e) => setBranchF(e.target.value)} aria-label={t('Branch', 'الفرع')} className="h-9 max-w-56 rounded-full border-0 bg-white px-3 text-sm text-ink/70 shadow-sm">
            <option value="all">{t('All branches', 'كل الفروع')}</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{t(b.en, b.ar)}</option>)}
          </select>
          {filters.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
              className={'h-9 rounded-full px-4 text-sm font-medium transition ' + (filter === id ? 'bg-forest text-cream' : 'bg-white text-ink/70 shadow-sm hover:bg-paper-2')}>{label}</button>
          ))}
        </div>
      </div>

      {flash && (
        <div role="alert" className="fade-up mt-4 flex items-center gap-3 rounded-2xl bg-wine px-4 py-3 text-cream shadow-lg">
          <BellRinging size={22} weight="fill" className="animate-bounce" />
          <span className="font-semibold">{t(`New order ${flash} from the app`, `طلب جديد ${flash} من التطبيق`)}</span>
        </div>
      )}

      {/* Phone / tablet: one column at a time */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto xl:hidden" role="tablist">
        {COLUMNS.map((c) => (
          <button key={c.id} role="tab" aria-selected={tab === c.id} onClick={() => setTab(c.id)}
            className={'flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold ' + (tab === c.id ? 'bg-ink text-cream' : 'bg-white text-ink/70 shadow-sm')}>
            {t(c.en, c.ar)} <span className={'grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ' + (tab === c.id ? 'bg-cream/20' : 'bg-paper-2')}>{byCol(c.id).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-4">
        {COLUMNS.map((c) => {
          const list = byCol(c.id);
          return (
            <section key={c.id} className={(tab === c.id ? '' : 'hidden ') + 'xl:block'} aria-labelledby={'col-' + c.id}>
              <header className="mb-3 hidden items-center gap-2 xl:flex">
                <span className={'grid h-7 w-7 place-items-center rounded-lg ' + c.tone}><c.icon size={16} weight="fill" /></span>
                <h2 id={'col-' + c.id} className="font-semibold">{t(c.en, c.ar)}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink/60 shadow-sm">{list.length}</span>
              </header>
              <div className="space-y-3">
                {list.length ? list.map((o) => <OrderCard key={o.source + o.id + o.at} o={o} now={now} highlight={flash === o.id} />) : (
                  <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-ink/10 px-4 py-10 text-center text-sm text-ink/45">
                    <Tray size={30} weight="thin" className="mb-2" />
                    {c.id === 'new' ? t('No new orders — you’re all caught up', 'ما فيه طلبات جديدة') : t('Nothing here', 'لا يوجد شيء')}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ o, now, highlight }) {
  const { t, ar, setStatus } = useAdmin();
  const [confirmReject, setConfirmReject] = useState(false);
  const TypeIcon = o.mode === 'delivery' ? Moped : o.curbside ? Car : o.table ? Chair : Storefront;
  const type = o.mode === 'delivery' ? t('Delivery', 'توصيل') : o.curbside ? t('Drive-thru / car', 'درايف ثرو / سيارة') : o.table ? t(`Table ${o.table}`, `طاولة ${o.table}`) : t('Pickup', 'استلام');
  const items = o.lines.reduce((s, l) => s + l.qty, 0);
  const cancelled = o.status === 'cancelled';
  const urgent = o.status === 'new' && now - o.at > 5 * 60000;

  const next = {
    new: [t('Accept & start', 'قبول وبدء التحضير'), 'preparing'],
    preparing: [t('Mark ready', 'تحديد كجاهز'), 'ready'],
    ready: [o.mode === 'delivery' ? t('Out for delivery → done', 'خرج للتوصيل ← تم') : t('Handed over', 'تم التسليم'), 'completed'],
  }[o.status];

  return (
    <article className={'rounded-2xl bg-white p-4 shadow-sm transition ' + (highlight ? 'ring-4 ring-wine/60 ' : '') + (cancelled ? 'opacity-60' : '')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold tabular-nums"><span className="whitespace-nowrap">{o.id}</span>
            {o.source === 'sample'
              ? <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/50">{t('Sample', 'تجريبي')}</span>
              : <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest">{t('From app', 'من التطبيق')}</span>}
          </p>
          <p className={'mt-0.5 flex items-center gap-1 text-xs ' + (urgent ? 'font-semibold text-wine' : 'text-ink/50')}>
            <Clock size={13} /> {ago(o.at, now, t)}{o.when && o.when !== 'asap' && <> · {t('for', 'موعد')} {new Date(o.when).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</>}
          </p>
          {o.mode === 'pickup' && branchById[o.branch] && <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50"><MapPin size={13} />{t(branchById[o.branch].en, branchById[o.branch].ar)}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-medium"><TypeIcon size={15} />{type}</span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-ink/5 pt-3 text-sm">
        {o.lines.map((l) => {
          const p = byId[l.id];
          if (!p) return null;
          const d = describe(l, t);
          return (
            <li key={l.key} className="flex gap-2">
              <span className="grid h-6 min-w-6 place-items-center rounded-md bg-forest/10 text-xs font-bold text-forest">{l.qty}</span>
              <span className="min-w-0"><span className="font-medium">{t(p.en, p.ar)}</span>{d && <span className="block text-xs text-ink/50">{d}</span>}</span>
            </li>
          );
        })}
      </ul>

      {(o.note || o.curbside || o.address) && (
        <div className="mt-3 space-y-1 rounded-xl bg-paper p-2.5 text-xs text-ink/70">
          {o.note && <p className="flex gap-1.5"><NotePencil size={14} className="mt-px shrink-0" />{o.note}</p>}
          {o.curbside && <p className="flex gap-1.5"><Car size={14} className="mt-px shrink-0" />{o.curbside}</p>}
          {o.address && <p className="flex gap-1.5"><MapPin size={14} className="mt-px shrink-0" />{o.address}</p>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink/55">{itemCount(items, ar)} · {payLabel(o.pay, o.mode, t)}</span>
        <span className="font-semibold tabular-nums">{t(`\u20C1 ${o.total}`, `${o.total} \u20C1`)}</span>
      </div>

      {cancelled && <p className="mt-3 text-sm font-medium text-wine">{t('Rejected / cancelled', 'مرفوض / ملغي')}</p>}

      {next && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setStatus(o, next[1])} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-forest text-sm font-semibold text-cream active:scale-[.98]">
            {o.status === 'ready' ? <Check size={17} weight="bold" /> : null}{next[0]}{o.status !== 'ready' && <ArrowRight size={16} className="rtl:-scale-x-100" />}
          </button>
          {o.status === 'new' && (
            <button onClick={() => (confirmReject ? setStatus(o, 'cancelled') : setConfirmReject(true))} onBlur={() => setConfirmReject(false)}
              aria-label={t('Reject order', 'رفض الطلب')}
              className={'flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition ' + (confirmReject ? 'bg-wine text-cream' : 'bg-paper text-wine')}>
              <X size={16} weight="bold" />{confirmReject && t('Confirm', 'تأكيد')}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
