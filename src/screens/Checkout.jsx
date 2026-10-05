import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { go } from '../router';
import { Money, TopBar, SampleTag, PrimaryButton, Empty, PausedBanner } from '../components/ui';
import { prepEstimates, promoDiscount } from '../shared/storage';
import { Storefront, Moped, MapPin, Car, Timer, AppleLogo, CreditCard, Cash, Info, ShoppingBag, ArrowRight, Coffee } from '../components/icons';
import { describeChoice } from './Bag';
import { openStatus, statusText, pickupSlots } from '../shared/hours';

const DELIVERY_FEE = 8; // sample fee — to be confirmed with Kav

export default function Checkout() {
  const { t, ar, lines, subtotal, mode, setMode, placeOrder, count, paused, prep, branch, promos } = useStore();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [codeError, setCodeError] = useState('');
  const [when, setWhen] = useState('asap');
  const [handoff, setHandoff] = useState(branch.drive ? 'car' : 'counter'); // pickup: 'counter' | 'car' (drive-thru / curbside)
  const [car, setCar] = useState('');
  const [address, setAddress] = useState('');
  const [pay, setPay] = useState('applepay');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const submission = useRef(false);
  const pendingOrder = useRef(null);
  useEffect(() => () => clearTimeout(pendingOrder.current), []);
  const slots = useMemo(() => pickupSlots(branch), [branch]);
  const status = openStatus(branch);
  const fee = mode === 'delivery' ? DELIVERY_FEE : 0;
  const { promo, discount } = promoDiscount(promos, applied, subtotal);
  const total = Math.max(0, subtotal - discount) + fee;
  const applyCode = () => {
    if (promoDiscount(promos, code, subtotal).promo) { setApplied(code.trim().toUpperCase()); setCodeError(''); }
    else setCodeError(t('That code isn’t valid right now.', 'الكود غير صالح حاليًا.'));
  };
  const time = (d) => d.toLocaleTimeString(ar ? 'ar-SA-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' });

  if (!count && !sending) {
    return (
      <div className="min-h-full">
        <TopBar title={t('Checkout', 'إتمام الطلب')} onBack={() => go('bag')} />
        <Empty icon={ShoppingBag} title={t('Nothing to check out yet', 'ما فيه شيء للطلب')} body={t('Add something from the menu first.', 'أضف أصناف من المنيو أولًا.')}
          action={<button onClick={() => go('menu')} className="rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream">{t('Browse the menu', 'تصفح المنيو')}</button>} />
      </div>
    );
  }

  const submit = () => {
    if (submission.current || paused || !count) return;
    const e = {};
    if (mode === 'delivery' && address.trim().length < 4) e.address = t('Add a delivery address (any sample text works).', 'أضف عنوان التوصيل (أي نص تجريبي يكفي).');
    if (mode === 'pickup' && handoff === 'car' && car.trim().length < 2) e.car = t('Tell the barista which car to look for.', 'اكتب وصف السيارة للباريستا.');
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return;
    }
    submission.current = true;
    setSending(true);
    pendingOrder.current = setTimeout(() => {
      const order = placeOrder({
        mode, fee, total, pay, note: note.trim(), discount, promo: promo?.code || null,
        when: when === 'asap' ? 'asap' : when,
        curbside: mode === 'pickup' && handoff === 'car' ? car.trim() : null,
        address: mode === 'delivery' ? address.trim() : null,
      });
      go('order/' + order.id);
    }, 1700);
  };

  return (
    <div className="min-h-full pb-10">
      <TopBar title={t('Checkout', 'إتمام الطلب')} onBack={() => go('bag')} />

      <div className="space-y-4 px-4">
        <PausedBanner />
        {/* Mode */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-paper-2 p-1" role="radiogroup" aria-label={t('Order type', 'نوع الطلب')}>
          {[['pickup', Storefront, t('Pickup', 'استلام')], ['delivery', Moped, t('Delivery', 'توصيل')]].map(([id, Icon, label]) => (
            <button key={id} role="radio" aria-checked={mode === id} onClick={() => setMode(id)}
              className={'flex h-12 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition ' + (mode === id ? 'bg-white text-forest shadow-sm' : 'text-ink/50')}>
              <Icon size={19} weight={mode === id ? 'fill' : 'regular'} />{label}
            </button>
          ))}
        </div>

        {mode === 'pickup' ? (
          <>
            <Card title={t('Pickup location', 'موقع الاستلام')}>
              <div className="flex gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-cream"><MapPin size={20} weight="fill" /></span>
                <div>
                  <p className="font-medium">{t('Kav Cafe', 'كاف كافيه')}</p>
                  <p className="text-sm text-ink/55">{t(branch.en, branch.ar)}</p>
                </div>
              </div>
              <p className="mb-2 mt-4 text-xs font-medium text-ink/50">{t('Where should we hand it to you?', 'وين نسلمك الطلب؟')}</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('Hand-off', 'طريقة الاستلام')}>
                {[['counter', Storefront, t('Counter', 'من الكاونتر')], ['car', Car, branch.drive ? t('Drive-thru', 'درايف ثرو') : t('To my car', 'لسيارتي')]].map(([id, Icon, label]) => (
                  <button key={id} role="radio" aria-checked={handoff === id} onClick={() => setHandoff(id)}
                    className={'flex h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 text-[13px] font-medium transition ' + (handoff === id ? 'border-forest bg-forest/5 text-forest' : 'border-transparent bg-paper text-ink/60')}>
                    <Icon size={22} weight={handoff === id ? 'fill' : 'regular'} />{label}
                  </button>
                ))}
              </div>
              {handoff === 'car' && (
                <Field id="car" label={t('Car details', 'وصف السيارة')} error={errors.car}>
                  <input id="car" value={car} onChange={(e) => setCar(e.target.value)} placeholder={t('e.g. White Camry · 1234', 'مثال: كامري أبيض · ١٢٣٤')} className="input" aria-invalid={!!errors.car} aria-describedby={errors.car ? 'car-error' : undefined} />
                </Field>
              )}
            </Card>

            <Card title={t('Pickup time', 'وقت الاستلام')}>
              <button onClick={() => setWhen('asap')} aria-pressed={when === 'asap'} className={'flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-start ' + (when === 'asap' ? 'border-forest bg-forest/5' : 'border-ink/10')}>
                <Timer size={22} className="text-forest" />
                <span className="flex-1">
                  <span className="block font-medium">{status.isOpen ? t('As soon as possible', 'بأسرع وقت') : t('As soon as we open', 'أول ما نفتح')}</span>
                  <span className="text-xs text-ink/50">{status.isOpen ? t(prepEstimates[prep].en + ' (set by the branch)', prepEstimates[prep].ar + ' (حسب الفرع)') : t(`This branch ${statusText(status, t, ar)}`, `الفرع ${statusText(status, t, ar)}`)}</span>
                </span>
              </button>
              <p className="mb-2 mt-4 text-xs font-medium text-ink/50">{t('Or schedule for later', 'أو حدد وقت لاحق')}</p>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                {slots.map((s) => {
                  const k = s.toISOString();
                  return (
                    <button key={k} onClick={() => setWhen(k)} aria-pressed={when === k}
                      className={'h-10 shrink-0 rounded-full px-4 text-sm font-medium tabular-nums ' + (when === k ? 'bg-forest text-cream' : 'bg-paper text-ink/70')}>
                      {time(s)}
                    </button>
                  );
                })}
              </div>
            </Card>
          </>
        ) : (
          <Card title={<span className="flex items-center gap-2">{t('Delivery address', 'عنوان التوصيل')}<SampleTag /></span>}>
            <Field id="address" label={t('Address', 'العنوان')} error={errors.address}>
              <textarea id="address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('District, street, building (sample)', 'الحي، الشارع، المبنى (تجريبي)')} className="input resize-none py-3" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'address-error' : undefined} />
            </Field>
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-ink/50"><Info size={15} className="mt-0.5 shrink-0" />{t('Delivery zones, fee and timing are placeholders until Kav confirms how it wants to deliver.', 'مناطق التوصيل والرسوم والوقت أمثلة لحين تأكيد كاف.')}</p>
          </Card>
        )}

        <Card title={<span className="flex items-center gap-2">{t('Payment', 'الدفع')}<SampleTag>{t('Simulated', 'محاكاة')}</SampleTag></span>}>
          <div className="space-y-2" role="radiogroup" aria-label={t('Payment method', 'طريقة الدفع')}>
            {[
              ['applepay', AppleLogo, 'Apple Pay', 'Apple Pay'],
              ['mada', CreditCard, 'mada / card', 'مدى / بطاقة'],
              ['cash', Cash, mode === 'pickup' ? 'Pay at pickup' : 'Cash on delivery', mode === 'pickup' ? 'الدفع عند الاستلام' : 'الدفع عند التوصيل'],
            ].map(([id, Icon, en, arLabel]) => (
              <button key={id} role="radio" aria-checked={pay === id} onClick={() => setPay(id)}
                className={'flex h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 text-start ' + (pay === id ? 'border-forest bg-forest/5' : 'border-ink/10')}>
                <Icon size={22} weight={id === 'applepay' ? 'fill' : 'regular'} />
                <span className="flex-1 font-medium">{t(en, arLabel)}</span>
                <span className={'h-5 w-5 rounded-full border-2 ' + (pay === id ? 'border-[6px] border-forest' : 'border-ink/25')} />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/50">{t('No card details are collected and no money moves in this demo.', 'لا يتم جمع بيانات بطاقات ولا يتم أي دفع في هذه التجربة.')}</p>
        </Card>

        <Card title={t('Note for the barista', 'ملاحظة للباريستا')}>
          <textarea aria-label={t('Note for the barista', 'ملاحظة للباريستا')} rows={2} value={note} maxLength={140} onChange={(e) => setNote(e.target.value)} placeholder={t('Optional', 'اختياري')} className="input resize-none py-3" />
        </Card>

        <Card title={t('Promo code', 'كود الخصم')}>
          {promo ? (
            <div className="flex items-center justify-between rounded-2xl bg-leaf/10 px-4 py-3 text-sm">
              <span><strong className="text-leaf">{promo.code}</strong> · {t(promo.en, promo.ar)}</span>
              <button onClick={() => { setApplied(''); setCode(''); }} className="text-xs font-medium text-ink/50 underline">{t('Remove', 'إزالة')}</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyCode()} placeholder={t('e.g. KAV10', 'مثال: KAV10')} aria-label={t('Promo code', 'كود الخصم')} className="input uppercase" aria-invalid={!!codeError} />
              <button onClick={applyCode} disabled={!code.trim()} className="h-12 shrink-0 rounded-2xl bg-forest px-5 text-sm font-semibold text-cream disabled:opacity-40">{t('Apply', 'تطبيق')}</button>
            </div>
          )}
          {codeError && <p role="alert" className="mt-1.5 text-xs font-medium text-wine">{codeError}</p>}
        </Card>

        <Card title={t('Order summary', 'ملخص الطلب')}>
          <ul className="space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="min-w-0"><span className="font-medium">{l.qty}×</span> {t(l.product.en, l.product.ar)}
                  {describeChoice(l.product, l.choice, t) && <span className="block text-xs text-ink/45">{describeChoice(l.product, l.choice, t)}</span>}</span>
                <Money value={l.total} />
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-ink/5 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">{t('Subtotal', 'المجموع')}</span><Money value={subtotal} /></div>
            {discount > 0 && <div className="flex justify-between text-leaf"><span>{t('Discount', 'الخصم')} · {promo.code}</span><span>− <Money value={discount} /></span></div>}
            <div className="flex justify-between"><span className="flex items-center gap-2 text-ink/60">{mode === 'delivery' ? <>{t('Delivery fee', 'رسوم التوصيل')}<SampleTag /></> : t('Pickup', 'الاستلام')}</span>{fee ? <Money value={fee} /> : <span className="text-leaf">{t('Free', 'مجاني')}</span>}</div>
            <div className="flex justify-between pt-2 text-base font-semibold"><span>{t('Total', 'الإجمالي')}</span><Money value={total} className="text-wine" /></div>
          </div>
        </Card>

        <PrimaryButton onClick={submit} disabled={sending || paused}>
          <span className="flex-1 text-start">{t('Place demo order', 'تأكيد الطلب التجريبي')}</span>
          <Money value={total} />
          <ArrowRight size={18} className="rtl:-scale-x-100" />
        </PrimaryButton>
        <p className="text-center text-[11px] text-ink/40">{t('Demo only — this order will not be sent to Kav.', 'تجربة فقط — لن يُرسل هذا الطلب لكاف.')}</p>
      </div>

      {sending && createPortal(
        <div className="backdrop-in absolute inset-0 z-40 flex flex-col items-center justify-center bg-forest/95 text-cream" role="status">
          <Coffee size={160} weight="thin" className="draw-in" aria-hidden="true" />
          <div className="mt-8 h-8 w-8 rounded-full border-2 border-cream/25 border-t-cream spin" />
          <p className="mt-4 text-lg font-medium">{t('Creating your demo order…', 'نجهّز طلبك التجريبي…')}</p>
          <p className="mt-1 text-sm text-cream/60">{t('Simulated — nothing is actually sent', 'محاكاة — لا يُرسل شيء فعليًا')}</p>
        </div>,
        document.getElementById('overlay-root'),
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      {children}
      {error && <p id={id + '-error'} role="alert" className="mt-1.5 text-xs font-medium text-wine">{error}</p>}
    </div>
  );
}
