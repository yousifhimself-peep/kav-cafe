// Customer-side pieces driven from the Admin portal: loyalty card, offer banner, push notifications, order rating.
// Shared by the phone demo (src/App.jsx) and the full-screen site (src/site/).
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Coffee, Star, Sparkle, X } from './icons';
import { Wordmark } from './ui';

// Stamps: 3 sample stamps + one per order placed in this demo.
export function useStamps() {
  const { loyalty, orders } = useStore();
  const total = 3 + orders.length;
  const need = Math.max(2, Number(loyalty.stamps) || 8);
  return { need, have: total % need, rewards: Math.floor(total / need) };
}

export function LoyaltyCard({ className = '' }) {
  const { t, loyalty } = useStore();
  const { need, have, rewards } = useStamps();
  if (!loyalty.on) return null;
  const left = need - have;
  return (
    <section className={'staff-lines overflow-hidden rounded-3xl bg-wine p-5 text-cream ' + className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-cream/60">{t('Kav loyalty', 'برنامج ولاء كاف')}</p>
          <h2 className="mt-1 text-lg font-semibold">{t(`${left} more ${left === 1 ? 'cup' : 'cups'} to your reward`, `باقي ${left} ${left <= 10 && left > 2 ? 'أكواب' : 'كوب'} على مكافأتك`)}</h2>
          <p className="text-sm text-cream/75">{t(loyalty.reward.en, loyalty.reward.ar)}</p>
        </div>
        {rewards > 0 && <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-wine">{t(`${rewards} reward ready`, `${rewards} مكافأة جاهزة`)}</span>}
      </div>
      <div className="mt-4 flex gap-1.5" aria-label={t(`${have} of ${need} stamps`, `${have} من ${need} أختام`)} dir="ltr">
        {Array.from({ length: need }).map((_, i) => (
          <span key={i} className={'grid aspect-square max-w-12 flex-1 place-items-center rounded-full border ' + (i < have ? 'border-cream bg-cream text-wine' : 'border-cream/30 text-cream/30')}>
            <Coffee size={14} weight={i < have ? 'fill' : 'regular'} />
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-cream/70">{t('Stamps collect automatically with every order — no card, no QR code.', 'الأختام تنحسب تلقائيًا مع كل طلب — بدون بطاقة أو باركود.')}</p>
    </section>
  );
}

// Offer banner text set in the portal (Offers → Banner).
export function useBanner() {
  const { t, promos } = useStore();
  const b = promos?.banner;
  return b?.on ? t(b.en, b.ar) : '';
}

export function PromoStrip({ className = '' }) {
  const text = useBanner();
  if (!text) return null;
  return (
    <div className={'flex items-center gap-2.5 rounded-2xl bg-sand/25 px-4 py-3 text-sm text-ink ' + className}>
      <Sparkle size={18} weight="fill" className="shrink-0 text-wine" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

// Shows the newest notification sent from the portal (once per notification), like a phone push banner.
export function PushNotice({ fixed = false }) {
  const { t, push } = useStore();
  const latest = push?.[0];
  const [shown, setShown] = useState(null);
  useEffect(() => {
    if (!latest) return;
    let seen = null;
    try { seen = localStorage.getItem('kav-push-seen'); } catch { /* ignore */ }
    if (seen === latest.id || Date.now() - latest.at > 10 * 60 * 1000) return;
    try { localStorage.setItem('kav-push-seen', latest.id); } catch { /* ignore */ }
    setShown(latest);
    const id = setTimeout(() => setShown(null), 7000);
    return () => clearTimeout(id);
  }, [latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!shown) return null;
  return (
    <div role="status" className={(fixed ? 'fixed top-3 ' : 'absolute top-[max(env(safe-area-inset-top),10px)] ') + 'fade-up inset-x-0 z-[60] flex justify-center px-3'}>
      <div className="flex w-full max-w-sm items-start gap-3 rounded-2xl bg-cream/95 p-3 text-ink shadow-2xl ring-1 ring-ink/5 backdrop-blur">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest p-1.5"><Wordmark light className="h-full w-auto" /></span>
        <span className="min-w-0 flex-1 text-sm">
          <span className="flex items-center justify-between text-[11px] text-ink/50"><span className="font-semibold uppercase tracking-wider">Kav Cafe</span>{t('now', 'الآن')}</span>
          <span className="mt-0.5 block font-medium leading-snug">{t(shown.en, shown.ar)}</span>
        </span>
        <button onClick={() => setShown(null)} aria-label={t('Dismiss', 'إغلاق')} className="text-ink/40"><X size={16} /></button>
      </div>
    </div>
  );
}

// Star rating once an order is done; saved on the order and shown in the portal (Customers → Reviews).
export function RateOrder({ order }) {
  const { t, rateOrder } = useStore();
  const [stars, setStars] = useState(order.rating || 0);
  const [comment, setComment] = useState(order.comment || '');
  if (order.rating) {
    return (
      <section className="rounded-3xl bg-white p-5 text-center shadow-sm">
        <div className="flex justify-center gap-1 text-sand" dir="ltr">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={22} weight={n <= order.rating ? 'fill' : 'regular'} />)}</div>
        <p className="mt-2 text-sm font-medium">{t('Thanks for rating your order!', 'شكرًا على تقييمك!')}</p>
        <p className="text-xs text-ink/50">{t('Kav’s team sees it in their portal.', 'فريق كاف يشوف تقييمك في البوابة.')}</p>
      </section>
    );
  }
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">{t('How was your order?', 'كيف كان طلبك؟')}</h2>
      <div className="mt-3 flex gap-1.5" dir="ltr" role="radiogroup" aria-label={t('Rating', 'التقييم')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n}`} onClick={() => setStars(n)} className="text-sand active:scale-90">
            <Star size={32} weight={n <= stars ? 'fill' : 'regular'} />
          </button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <textarea rows={2} value={comment} maxLength={200} onChange={(e) => setComment(e.target.value)} placeholder={t('Anything to tell the team? (optional)', 'تبي تقول شيء للفريق؟ (اختياري)')} className="input mt-3 resize-none py-3" />
          <button onClick={() => rateOrder(order.id, stars, comment.trim())} className="mt-3 h-11 w-full rounded-xl bg-forest text-sm font-semibold text-cream">{t('Send rating', 'إرسال التقييم')}</button>
        </>
      )}
    </section>
  );
}
