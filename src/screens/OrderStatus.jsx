import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { go } from '../router';
import { byId, branchById, branches } from '../data/menu';
import { mapsLink } from '../shared/hours';
import { Money, Empty, SampleTag } from '../components/ui';
import { Check, X, Receipt, Storefront, Moped, Car, Chair, NavigationArrow, ArrowRight, Info } from '../components/icons';
import { describeChoice } from './Bag';
import { RateOrder } from '../components/Extras';

// Status comes from the Admin / Staff Portal once staff act on the order.
// Until then the demo auto-advances every few seconds so it still plays on its own.
const STEP_MS = 5000;
const STAFF_STEP = { new: 0, preparing: 1, ready: 2, completed: 99 };

export default function OrderStatus({ route }) {
  const { t, ar, orders } = useStore();
  const order = orders.find((o) => o.id === route.id);
  const branch = branchById[order?.branch] || branches[0];
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  if (!order) {
    return <Empty icon={Receipt} title={t('Order not found', 'الطلب غير موجود')} body={t('It may have been cleared when the demo was reset.', 'ربما تم مسحه عند إعادة التجربة.')}
      action={<button onClick={() => go('home')} className="rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream">{t('Back home', 'الرئيسية')}</button>} />;
  }

  const steps = order.mode === 'pickup'
    ? [t('Order received', 'استلمنا طلبك'), t('Preparing your order', 'نجهز طلبك'), order.curbside ? (branch.drive ? t('Ready — at the drive-thru window', 'جاهز — عند شباك الدرايف ثرو') : t('Ready — bringing it to your car', 'جاهز — نوصله لسيارتك')) : order.table ? t(`Ready — bringing it to table ${order.table}`, `جاهز — نوصله لطاولة ${order.table}`) : t('Ready for pickup', 'جاهز للاستلام')]
    : [t('Order received', 'استلمنا طلبك'), t('Preparing your order', 'نجهز طلبك'), t('On the way', 'في الطريق'), t('Delivered', 'تم التوصيل')];
  const cancelled = order.status === 'cancelled';
  const raw = order.status && order.status in STAFF_STEP ? STAFF_STEP[order.status] : Math.floor((now - order.at) / STEP_MS);
  const step = Math.min(steps.length - 1, raw);
  const done = step === steps.length - 1;
  const whenLabel = order.when === 'asap'
    ? t('As soon as possible', 'بأسرع وقت')
    : new Date(order.when).toLocaleTimeString(ar ? 'ar-SA-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="min-h-full bg-paper pb-12">
      <div className="staff-lines relative overflow-hidden rounded-b-[36px] bg-forest px-6 pb-10 pt-[max(env(safe-area-inset-top),28px)] text-center text-cream">
        <div className={'pop mx-auto grid h-20 w-20 place-items-center rounded-full shadow-xl ' + (cancelled ? 'bg-wine text-cream' : 'bg-cream text-forest')}>
          {cancelled ? <X size={38} weight="bold" /> : <Check size={38} weight="bold" />}
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.3em] text-sand">{t('Demo order', 'طلب تجريبي')} · {order.id}</p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight">{cancelled ? t('Kav couldn’t take this order', 'ما قدر كاف يستقبل الطلب') : done ? steps[step] : t('Thank you! Your order is in.', 'شكرًا لك! وصل طلبك.')}</h1>
        <p className="mt-2 text-sm text-cream/75">{t('Sit back and relax 🤎', 'خذها على راحتك 🤎')}</p>
      </div>

      <div className="-mt-6 space-y-4 px-4">
        <div className="flex items-start gap-3 rounded-2xl border border-wine/20 bg-cream p-4 text-sm text-wine shadow-sm">
          <Info size={20} className="mt-0.5 shrink-0" />
          <p><strong>{t('Simulated confirmation.', 'تأكيد محاكاة.')}</strong> {t('No payment was taken. Status updates come from the Admin / Staff Portal, or play automatically if no one is using it.', 'لم يتم أي دفع. تحديثات الحالة تأتي من بوابة الموظفين، أو تعمل تلقائيًا إذا ما أحد يستخدمها.')}</p>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t('Order status', 'حالة الطلب')}</h2>
            <SampleTag>{order.status ? t('From staff portal', 'من بوابة الموظفين') : t('Live preview', 'معاينة حية')}</SampleTag>
          </div>
          {cancelled && <p className="mt-3 rounded-xl bg-wine/5 p-3 text-sm text-wine">{t('Cancelled by the branch. In the real app you’d be refunded automatically.', 'ألغاه الفرع. في التطبيق الفعلي يُسترجع المبلغ تلقائيًا.')}</p>}
          <ol className={'mt-4 ' + (cancelled ? 'hidden' : '')}>
            {steps.map((s, i) => (
              <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
                {i < steps.length - 1 && <span className={'absolute start-[13px] top-7 h-[calc(100%-20px)] w-0.5 ' + (i < step ? 'bg-forest' : 'bg-ink/10')} />}
                <span className={'relative grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-500 ' + (i < step || done ? 'bg-forest text-cream' : i === step ? 'bg-wine text-cream' : 'bg-paper-2 text-ink/30')}>
                  {i < step || done ? <Check size={14} weight="bold" /> : <span className={'h-2 w-2 rounded-full bg-current ' + (i === step ? 'animate-pulse' : '')} />}
                </span>
                <span className={'pt-0.5 text-[15px] ' + (i <= step ? 'font-medium text-ink' : 'text-ink/40')}>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-forest">
              {order.mode === 'pickup' ? (order.curbside ? <Car size={22} /> : order.table ? <Chair size={22} /> : <Storefront size={22} />) : <Moped size={22} />}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold">{order.mode === 'pickup' ? (order.curbside ? (branch.drive ? t('Drive-thru pickup', 'استلام درايف ثرو') : t('Pickup at your car', 'استلام من السيارة')) : order.table ? t(`Dine-in · table ${order.table}`, `محلي · طاولة ${order.table}`) : t('Pickup', 'استلام')) : t('Delivery', 'توصيل')}</p>
              <p className="text-ink/55">{order.mode === 'pickup' ? t(branch.en, branch.ar) : order.address}</p>
              {order.curbside && <p className="text-ink/55">{order.curbside}</p>}
              {order.mode === 'pickup' && <p className="mt-1 text-ink/55">{t('Time', 'الوقت')}: {whenLabel}</p>}
            </div>
          </div>
          {order.mode === 'pickup' && <a href={mapsLink(branch)} target="_blank" rel="noreferrer" className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-paper text-sm font-medium text-forest"><NavigationArrow size={18} weight="fill" className="rtl:-scale-x-100" />{t('Directions to the branch', 'الاتجاهات للفرع')}</a>}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('Receipt', 'الفاتورة')}</h2>
          <ul className="space-y-2 text-sm">
            {order.lines.map((l) => {
              const p = byId[l.id];
              if (!p) return null;
              const opts = describeChoice(p, l.choice, t);
              return (
                <li key={l.key} className="flex justify-between gap-3">
                  <span><span className="font-medium">{l.qty}×</span> {t(p.en, p.ar)}{opts && <span className="block text-xs text-ink/45">{opts}</span>}</span>
                  <Money value={l.unit * l.qty} />
                </li>
              );
            })}
          </ul>
          <div className="mt-3 space-y-1 border-t border-ink/5 pt-3 text-sm">
            {order.discount > 0 && <div className="flex justify-between text-leaf"><span>{t('Discount', 'الخصم')} · {order.promo}</span><span>− <Money value={order.discount} /></span></div>}
            {order.fee > 0 && <div className="flex justify-between text-ink/60"><span>{t('Delivery (sample)', 'التوصيل (تجريبي)')}</span><Money value={order.fee} /></div>}
            <div className="flex justify-between text-base font-semibold"><span>{t('Total', 'الإجمالي')}</span><Money value={order.total} className="text-wine" /></div>
          </div>
        </section>

        {done && !cancelled && <RateOrder order={order} />}

        <button onClick={() => go('home')} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-forest font-semibold text-cream shadow-lg active:scale-[.98]">
          {t('Back to home', 'العودة للرئيسية')} <ArrowRight size={18} className="rtl:-scale-x-100" />
        </button>
        <button onClick={() => go('orders')} className="h-12 w-full text-sm font-medium text-forest">{t('View all orders', 'عرض كل الطلبات')}</button>
      </div>
    </div>
  );
}
