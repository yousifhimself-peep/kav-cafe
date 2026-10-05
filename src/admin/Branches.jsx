import { useAdmin } from './AdminApp';
import { branches } from '../data/menu';
import { openStatus, statusText, mapsLink } from '../shared/hours';
import { prepEstimates } from '../shared/storage';
import { Car, MapPin, Clock, Receipt, NavigationArrow, Timer } from '@phosphor-icons/react';
import { PageHead, Switch, Badge, Note, useSar } from './kit';

const DAY = 24 * 60 * 60 * 1000;

export default function Branches() {
  const { t, ar, store, setStore, orders } = useAdmin();
  const sar = useSar();
  const closed = store.closedBranches || {};
  const now = Date.now();
  const setClosed = (id, v) => setStore((s) => ({ ...s, closedBranches: { ...(s.closedBranches || {}), [id]: v || undefined } }));
  const prep = store.prep || 'normal';

  return (
    <div>
      <PageHead title={t('Branches', 'الفروع')}
        sub={t('Close a branch for the day (maintenance, staff shortage) and customers can’t pick it at checkout until you reopen. Hours come from Kav’s “Working hours” highlight.', 'سكّر فرع لليوم (صيانة، نقص موظفين) وما يقدر العميل يختاره لين تفتحه. الأوقات من هايلايت “أوقات العمل”.')} />

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
        <Timer size={20} className="text-forest" />
        <span className="font-medium">{t('Pickup estimate shown to customers:', 'وقت الاستلام المعروض للعملاء:')}</span>
        {['normal', 'busy', 'very-busy'].map((id) => (
          <button key={id} onClick={() => setStore((s) => ({ ...s, prep: id }))} aria-pressed={prep === id}
            className={'rounded-full px-3 py-1.5 text-xs font-semibold ' + (prep === id ? 'bg-forest text-cream' : 'bg-paper text-ink/60')}>{ar ? prepEstimates[id].ar : prepEstimates[id].en}</button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b) => {
          const s = openStatus(b);
          const isClosed = !!closed[b.id];
          const today = orders.filter((o) => o.branch === b.id && now - o.at < DAY && o.status !== 'cancelled');
          const live = orders.filter((o) => o.branch === b.id && ['new', 'preparing', 'ready'].includes(o.status)).length;
          return (
            <article key={b.id} className={'flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-2 ' + (isClosed ? 'ring-wine/40' : 'ring-transparent')}>
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-wine">{b.drive ? <Car size={22} /> : <MapPin size={22} />}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold leading-snug">{t(b.en, b.ar)}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                    <span className={'h-2 w-2 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />
                    {s.isOpen ? t('Open', 'مفتوح') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}
                  </p>
                </div>
                {b.drive && <Badge tone="green">{t('Drive-thru', 'درايف ثرو')}</Badge>}
              </div>

              <dl className="mt-4 space-y-1 text-sm">
                {b.lines.map((l) => (
                  <div key={l[0]} className="flex justify-between gap-3"><dt className="flex items-center gap-1.5 text-ink/55"><Clock size={14} />{t(l[0], l[1])}</dt><dd className="font-medium">{t(l[2], l[3])}</dd></div>
                ))}
              </dl>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-paper p-2"><p className="text-lg font-semibold tabular-nums">{today.length}</p><p className="text-[11px] text-ink/50">{t('orders today', 'طلب اليوم')}</p></div>
                <div className="rounded-xl bg-paper p-2"><p className="text-lg font-semibold tabular-nums">{sar(today.reduce((x, o) => x + o.total, 0))}</p><p className="text-[11px] text-ink/50">{t('sales', 'مبيعات')}</p></div>
                <div className="rounded-xl bg-paper p-2"><p className="text-lg font-semibold tabular-nums">{live}</p><p className="text-[11px] text-ink/50">{t('in progress', 'قيد التنفيذ')}</p></div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/5 pt-4">
                <span className="text-sm">
                  <span className="block font-medium">{isClosed ? t('Closed by staff', 'مغلق من الإدارة') : t('Taking online orders', 'يستقبل طلبات أونلاين')}</span>
                  <span className="text-xs text-ink/50">{isClosed ? t('Customers see “temporarily closed”', 'يظهر للعملاء “مغلق مؤقتًا”') : t('Switch off to close for today', 'أطفئه لإغلاق الفرع اليوم')}</span>
                </span>
                <Switch on={!isClosed} onChange={(v) => setClosed(b.id, !v)} label={t('Branch open', 'الفرع مفتوح')} />
              </div>
              <div className="mt-3 flex gap-2 text-sm">
                <a href={'#/orders'} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-paper py-2 font-medium text-forest"><Receipt size={16} />{t('Orders', 'الطلبات')}</a>
                <a href={mapsLink(b)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-paper py-2 font-medium text-forest"><NavigationArrow size={16} weight="fill" className="rtl:-scale-x-100" />{t('Map', 'الخريطة')}</a>
              </div>
            </article>
          );
        })}
      </div>
      <Note>{t('Two newer branches (King Fahd Specialist Hospital, Al Salam) are added once Kav shares their hours. Editing opening hours comes in the full build.', 'الفرعين الجديدين (مستشفى الملك فهد التخصصي، حي السلام) يُضافون بعد ما يرسل كاف أوقاتهم. تعديل الأوقات ضمن النسخة الكاملة.')}</Note>
    </div>
  );
}
