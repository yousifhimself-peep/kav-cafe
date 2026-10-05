import { useEffect, useRef } from 'react';
import { useStore } from './store';
import { useRoute, go } from './router';
import { Money, Wordmark } from './components/ui';
import { MapPin, House, ForkKnife, Receipt, ShoppingBag, CheckCircle, ArrowRight, Globe, ArrowCounterClockwise } from './components/icons';
import ProductSheet from './components/ProductSheet';
import { PushNotice } from './components/Extras';
import Home from './screens/Home';
import Menu from './screens/Menu';
import Bag from './screens/Bag';
import Checkout from './screens/Checkout';
import OrderStatus from './screens/OrderStatus';
import Orders from './screens/Orders';
import Branches from './screens/Branches';

const screens = { home: Home, menu: Menu, branches: Branches, bag: Bag, checkout: Checkout, order: OrderStatus, orders: Orders };
const withNav = ['home', 'menu', 'branches', 'orders', 'bag'];

export default function App() {
  const { t } = useStore();
  const route = useRoute();
  let name = screens[route.name] ? route.name : 'home';
  const Screen = screens[name];
  const scroller = useRef(null);

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [name, route.id]);

  return (
    <div className="min-h-full lg:flex lg:items-center lg:justify-center lg:gap-16 lg:p-8 staff-lines">
      <PresenterPanel />
      {/* The "phone": full-screen on mobile, a device frame on large screens. */}
      <div className="relative mx-auto h-[100dvh] lg:mx-0 w-full max-w-[480px] overflow-hidden bg-paper lg:h-[min(844px,calc(100dvh-40px))] lg:w-[390px] lg:shrink-0 lg:rounded-[52px] lg:border-[10px] lg:border-ink lg:shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)]">
        <div ref={scroller} className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain" id="scroller">
          <Screen route={route} scroller={scroller} />
        </div>
        {withNav.includes(name) && <><BagBar name={name} /><BottomNav name={name} /></>}
        <div id="overlay-root" />
        <ProductSheet />
        <Toast />
        <PushNotice />
      </div>
      <span className="sr-only" aria-live="polite">{t('Kav Cafe ordering demo', 'تجربة تطبيق كاف كافيه')}</span>
    </div>
  );
}

function BottomNav({ name }) {
  const { t, count } = useStore();
  const items = [
    ['home', House, t('Home', 'الرئيسية')],
    ['menu', ForkKnife, t('Menu', 'المنيو')],
    ['branches', MapPin, t('Branches', 'الفروع')],
    ['orders', Receipt, t('Orders', 'طلباتي')],
    ['bag', ShoppingBag, t('Bag', 'السلة')],
  ];
  return (
    <nav aria-label={t('Main', 'التنقل')} className="absolute inset-x-0 bottom-0 z-30 border-t border-ink/5 bg-cream/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-md">
      <ul className="grid grid-cols-5">
        {items.map(([id, Icon, label]) => {
          const active = name === id;
          return (
            <li key={id}>
              <button onClick={() => go(id)} aria-current={active ? 'page' : undefined} className={'relative mx-auto flex w-full flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition ' + (active ? 'text-forest' : 'text-ink/45')}>
                <span className={'grid h-8 w-12 place-items-center rounded-full transition ' + (active ? 'bg-forest/10' : '')}>
                  <Icon size={22} weight={active ? 'fill' : 'regular'} />
                </span>
                {label}
                {id === 'bag' && count > 0 && (
                  <span key={count} className="pop absolute top-0 start-[calc(50%+6px)] grid h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[10px] font-bold text-cream">{count}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// HungerStation-style sticky "view bag" bar.
function BagBar({ name }) {
  const { t, count, subtotal } = useStore();
  if (!count || !['home', 'menu'].includes(name)) return null;
  return (
    <button onClick={() => go('bag')} className="fade-up absolute inset-x-3 bottom-[78px] z-30 flex h-14 items-center gap-3 rounded-2xl bg-wine px-4 text-cream shadow-[0_14px_30px_-12px_rgba(107,43,22,.85)] active:scale-[.98]">
      <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-cream/15 px-1.5 text-sm font-bold">{count}</span>
      <span className="flex-1 text-start text-[15px] font-semibold">{t('View your bag', 'عرض السلة')}</span>
      <Money value={subtotal} className="font-semibold" />
      <ArrowRight size={18} className="rtl:-scale-x-100" />
    </button>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" className="fade-up pointer-events-none absolute inset-x-0 top-[max(env(safe-area-inset-top),14px)] z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream shadow-xl">
        <CheckCircle size={18} weight="fill" className="text-sand" />
        {toast}
      </div>
    </div>
  );
}

// Only visible on large screens, beside the phone frame — handy while presenting.
function PresenterPanel() {
  const { t, ar, setLang, resetDemo } = useStore();
  return (
    <aside className="hidden max-w-sm text-cream lg:block">
      <Wordmark light className="h-20 w-auto" />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-sand">{t('Kav Cafe app · design preview', 'تطبيق كاف كافيه · معاينة التصميم')}</p>
      <h1 className="mt-3 text-4xl font-light leading-tight">
        {t(<>Order ahead,<br /><span className="font-semibold">skip the line.</span></>, <>في حلك وترحالك..<br /><span className="font-semibold">اطلب قبل توصل.</span></>)}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-cream/70">
        {t('A clickable prototype of Kav’s own ordering app — your menu, prices and branches, with pickup at the counter or the drive-thru. Orders and payments are simulated — nothing is sent.',
          'نموذج تفاعلي لتطبيق كاف الخاص — منيوكم وأسعاركم وفروعكم، مع الاستلام من الكاونتر أو الدرايف ثرو. الطلبات والدفع محاكاة فقط — لا يُرسل أي شيء.')}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setLang(ar ? 'en' : 'ar')} className="flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-sm hover:bg-cream/10">
          <Globe size={18} /> {ar ? 'English' : 'العربية'}
        </button>
        <button onClick={resetDemo} className="flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2.5 text-sm hover:bg-cream/10">
          <ArrowCounterClockwise size={18} /> {t('Restart demo', 'إعادة التجربة')}
        </button>
      </div>
    </aside>
  );
}
