// Full-screen Kav Cafe website (desktop + phone). Same store, menu and orders as the phone demo, so the
// Admin portal sees these orders too. Bag, checkout, order tracking and order history reuse the app screens.
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useRoute, go } from '../router';
import { cafe, categories, menu, branches } from '../data/menu';
import { Money, ProductArt, Wordmark, asset, catIcon, itemCount, SoldOut, PausedBanner } from '../components/ui';
import {
  ShoppingBag, Globe, MagnifyingGlass, X, Plus, MapPin, Car, Storefront, Moped, CaretDown, ArrowRight, Clock, NavigationArrow,
  InstagramLogo, CheckCircle, Sparkle, List,
} from '../components/icons';
import ProductSheet from '../components/ProductSheet';
import ModeSheet from '../components/ModeSheet';
import { LoyaltyCard, PushNotice, useBanner } from '../components/Extras';
import { openStatus, statusText, mapsLink } from '../shared/hours';
import Bag from '../screens/Bag';
import Checkout from '../screens/Checkout';
import OrderStatus from '../screens/OrderStatus';
import Orders from '../screens/Orders';

const flows = { bag: Bag, checkout: Checkout, order: OrderStatus, orders: Orders };
const categoryPhoto = { coffee: 'menu/_coffee.jpg', drinks: 'menu/_drinks.jpg', croissant: 'menu/_croissant.jpg', food: 'menu/_food.jpg', dessert: 'menu/_dessert.jpg' };

export default function SiteApp() {
  const route = useRoute();
  const Flow = flows[route.name];
  const [modeOpen, setModeOpen] = useState(false);

  // Scroll: flows start at the top; "#/menu?c=…" jumps to that menu section on the home page.
  // Every page starts at the top; "#/menu?c=…" then jumps to that category on the menu page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (route.name === 'menu' && route.params.c) {
      setTimeout(() => {
        const el = document.getElementById('cat-' + route.params.c);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
      }, 150);
    }
    if (route.name === 'menu' && route.params.search) setTimeout(() => document.getElementById('site-search')?.focus(), 300);
  }, [route.name, route.id, route.params.c, route.params.search]);
  const Page = route.name === 'menu' ? MenuPage : route.name === 'branches' ? BranchesPage : null;

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <PushNotice fixed />
      <Announcement />
      <Header page={Flow || Page ? route.name : 'home'} onBranch={() => setModeOpen(true)} />
      {Flow ? (
        <main className="site-flow mx-auto w-full max-w-xl pt-4 sm:pt-8"><Flow route={route} /></main>
      ) : Page ? (
        <Page />
      ) : (
        <Home onBranch={() => setModeOpen(true)} />
      )}
      <Footer />
      <MobileBagBar hidden={!!Flow} />
      <div id="overlay-root" data-site="" className="fixed inset-0 z-50 empty:hidden" />
      <ProductSheet />
      <Toast />
      {modeOpen && <ModeSheet onClose={() => setModeOpen(false)} />}
    </div>
  );
}

// Offer banner from the portal (Offers → Banner), gliding across like Frost's announcement bar.
function Announcement() {
  const { ar } = useStore();
  const text = useBanner();
  if (!text) return null;
  const copies = Math.max(2, Math.ceil(2400 / (text.length * 7 + 56)));
  return (
    <div className="flex h-9 items-center overflow-hidden bg-wine text-[13px] font-medium text-cream" aria-label={text}>
      <div className={'ticker flex w-max hover:[animation-play-state:paused] ' + (ar ? 'ticker-rtl' : '')} style={{ animationDuration: `${copies * 9}s` }} aria-hidden="true">
        {[0, 1].map((half) => Array.from({ length: copies }, (_, k) => (
          <span key={`${half}-${k}`} className="flex shrink-0 items-center gap-8 pe-8">{text}<Sparkle size={12} weight="fill" className="text-sand" /></span>
        )))}
      </div>
    </div>
  );
}

function Header({ page, onBranch }) {
  const { t, ar, setLang, count, mode, branch } = useStore();
  const [open, setOpen] = useState(false);
  const links = [
    ['menu', t('Menu', 'المنيو')],
    ['branches', t('Branches', 'الفروع')],
    ['orders', t('My orders', 'طلباتي')],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white md:hidden" aria-expanded={open} aria-label={t('Menu', 'القائمة')}>
            {open ? <X size={18} /> : <List size={18} />}
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([id, label]) => (
              <a key={id} href={'#/' + id} aria-current={page === id ? 'page' : undefined}
                className={'rounded-full px-4 py-2 text-sm font-medium transition ' + (page === id ? 'bg-white shadow-sm' : 'text-ink/70 hover:bg-white/70')}>{label}</a>
            ))}
          </nav>
        </div>
        <a href="#/" aria-label={t('Kav Cafe — home', 'كاف كافيه — الرئيسية')}><Wordmark className="h-14 w-auto" /></a>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onBranch} className="hidden max-w-56 items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-sm lg:flex">
            {mode === 'pickup' ? (branch.drive ? <Car size={16} className="shrink-0 text-forest" /> : <Storefront size={16} className="shrink-0 text-forest" />) : <Moped size={16} className="shrink-0 text-forest" />}
            <span className="truncate">{mode === 'pickup' ? t(branch.en, branch.ar) : t('Delivery', 'توصيل')}</span>
            <CaretDown size={14} className="shrink-0 text-ink/50" />
          </button>
          <button onClick={() => setLang(ar ? 'en' : 'ar')} className="h-10 rounded-full border border-ink/10 bg-white px-3 text-sm font-medium">{ar ? 'EN' : 'عربي'}</button>
          <button onClick={() => go('bag')} aria-label={t('Your bag', 'السلة')} className="relative flex h-10 items-center gap-2 rounded-full bg-forest px-3 text-sm font-semibold text-cream sm:px-4">
            <ShoppingBag size={18} weight="fill" /><span className="hidden sm:inline">{t('Bag', 'السلة')}</span>
            {count > 0 && <span key={count} className="pop grid h-5 min-w-5 place-items-center rounded-full bg-sand px-1 text-[11px] font-bold text-ink">{count}</span>}
          </button>
        </div>
      </div>
      {open && (
        <div className="fade-up border-t border-ink/5 bg-cream px-4 pb-4 pt-2 md:hidden" onClick={() => setOpen(false)}>
          {links.map(([id, label]) => <a key={id} href={'#/' + id} className="block rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-paper-2">{label}</a>)}
          <button onClick={onBranch} className="mt-2 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-3 text-start text-sm">
            <MapPin size={18} className="text-wine" /><span className="flex-1 truncate">{mode === 'pickup' ? t(branch.en, branch.ar) : t('Delivery', 'توصيل')}</span><CaretDown size={14} />
          </button>
        </div>
      )}
    </header>
  );
}

function Home({ onBranch }) {
  const { t, ar, mode, branch } = useStore();
  const status = openStatus(branch);
  const featured = menu.filter((p) => !p.hidden && p.featured);
  return (
    <>
      {/* Hero */}
      <section className="staff-lines relative overflow-hidden bg-forest text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_1fr] md:py-20">
          <div className="fade-up">
            <p className="font-ar text-lg text-sand">{cafe.tagline.ar}..</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              {t(<>Your coffee,<br />ready when you arrive.</>, <>قهوتك جاهزة<br />قبل توصل.</>)}
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-cream/75">
              {t('Order ahead from any Kav branch and pick it up at the counter or the drive-thru window — no waiting in line.', 'اطلب مسبقًا من أي فرع لكاف واستلم طلبك من الكاونتر أو شباك الدرايف ثرو — بدون انتظار.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#/menu" className="flex h-13 items-center gap-2 rounded-2xl bg-cream px-6 py-3.5 font-semibold text-forest shadow-lg hover:bg-white">{t('Order now', 'اطلب الآن')}<ArrowRight size={18} className="rtl:-scale-x-100" /></a>
              <a href="#/branches" className="flex items-center gap-2 rounded-2xl border border-cream/25 px-6 py-3.5 font-semibold hover:bg-cream/10"><MapPin size={18} />{t('Find a branch', 'الفروع')}</a>
            </div>
            <button onClick={onBranch} className="mt-8 flex w-full max-w-md items-center gap-3 rounded-2xl bg-cream/10 p-3 text-start hover:bg-cream/15">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream text-forest">{mode === 'pickup' ? (branch.drive ? <Car size={20} weight="fill" /> : <Storefront size={20} weight="fill" />) : <Moped size={20} weight="fill" />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-wider text-cream/60">{mode === 'pickup' ? t('Pickup from', 'الاستلام من') : t('Deliver to', 'التوصيل إلى')}</span>
                <span className="block truncate font-medium">{mode === 'pickup' ? t(branch.en, branch.ar) : t('Home · sample address', 'المنزل · عنوان تجريبي')}</span>
                {mode === 'pickup' && <span className="mt-0.5 flex items-center gap-1.5 text-xs text-cream/70"><span className={'h-1.5 w-1.5 rounded-full ' + (status.isOpen ? 'bg-leaf' : 'bg-wine-2')} />{status.isOpen ? t('Open now', 'مفتوح الآن') : t('Closed', 'مغلق')} · {statusText(status, t, ar)}</span>}
              </span>
              <CaretDown size={18} className="shrink-0 text-cream/70" />
            </button>
          </div>
          <div className="relative">
            <img src={asset('assets/menu/_hero.jpg')} alt={t('Iced coffee in a green Kav cup', 'قهوة باردة في كوب كاف الأخضر')} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl" />
            <img src={asset('assets/menu/_drinks.jpg')} alt="" className="absolute -bottom-6 start-[-1rem] hidden aspect-square w-40 rounded-3xl border-4 border-forest object-cover shadow-xl sm:block lg:w-48" />
            <div className="absolute -top-4 end-4 rounded-2xl bg-cream px-4 py-3 text-ink shadow-xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-wine">{t('Drive-thru', 'درايف ثرو')}</p>
              <p className="text-sm font-medium">{t('Ready at the window', 'جاهز عند الشباك')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <PausedBanner className="mt-6" />

        {/* Categories */}
        <section className="mt-12">
          <SectionTitle title={t('Browse the menu', 'تصفح المنيو')} sub={t('Coffee, drinks, fresh croissants, sandwiches and desserts', 'قهوة، مشروبات، كرواسون طازج، ساندويتشات وحلويات')} />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c, i) => {
              const Icon = catIcon[c.id];
              const n = menu.filter((p) => !p.hidden && p.category === c.id).length;
              return (
                <a key={c.id} href={'#/menu?c=' + c.id} className={'group relative h-36 overflow-hidden rounded-3xl sm:h-44 ' + (i === categories.length - 1 ? 'col-span-2 sm:col-span-1' : '')}>
                  <img src={asset('assets/' + categoryPhoto[c.id])} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/5" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-cream">
                    <span><span className="block text-lg font-semibold leading-tight">{t(c.en, c.ar)}</span><span className="text-xs text-cream/70">{itemCount(n, ar)}</span></span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/20 backdrop-blur"><Icon size={18} /></span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Picks */}
        <section className="mt-14">
          <SectionTitle title={t('Kav favourites', 'مفضلات كاف')} sub={t('A few highlights from the menu', 'مختارات من المنيو')} />
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <a href="#/menu" className="flex items-center gap-2 rounded-2xl bg-forest px-7 py-3.5 font-semibold text-cream shadow-lg hover:bg-forest-2">{t('See the full menu', 'شوف المنيو كامل')}<ArrowRight size={18} className="rtl:-scale-x-100" /></a>
        </div>

        {/* Loyalty + drive-thru */}
        <section className="mt-16 grid gap-4 lg:grid-cols-2">
          <LoyaltyCard className="!p-7 sm:!p-8" />
          <div className="relative min-h-64 overflow-hidden rounded-3xl bg-forest-deep text-cream">
            <img src={asset('assets/menu/_green.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/50 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-7 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.25em] text-sand">{t('Kav Drive Thru', 'كاف درايف ثرو')}</p>
              <h2 className="mt-1 text-2xl font-semibold">{t('Order on the way. Grab it at the window.', 'اطلب وأنت بالطريق. واستلم من الشباك.')}</h2>
              <p className="mt-2 max-w-md text-sm text-cream/75">{t('Add your car details at checkout and the team brings your order out the moment you pull up.', 'أضف وصف سيارتك عند الطلب ويطلع لك الفريق طلبك أول ما توصل.')}</p>
            </div>
          </div>
        </section>

        <BranchesTeaser />

        {/* Instagram */}
        <section className="mt-16">
          <SectionTitle title="@kav.cafe" sub={t('Follow us on Instagram', 'تابعونا على إنستقرام')} action={<a href={cafe.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-wine"><InstagramLogo size={18} />{t('Follow', 'متابعة')}</a>} />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {['_brand', '_coffee', '_hero', '_dessert'].map((n) => (
              <a key={n} href={cafe.instagram} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-3xl">
                <img src={asset('assets/menu/' + n + '.jpg')} alt="" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SectionTitle({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink/55">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function ProductCard({ p }) {
  const { t, setSheet, isAvailable, cart } = useStore();
  const out = !isAvailable(p.id);
  const n = cart.filter((l) => l.id === p.id).reduce((s, l) => s + l.qty, 0);
  return (
    <article className={'group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg ' + (out ? 'opacity-60' : '')}>
      <button onClick={() => setSheet(p.id)} className="relative block text-start" aria-label={t(p.en, p.ar)}>
        <ProductArt product={p} className="aspect-square w-full transition duration-500 group-hover:scale-[1.03]" />
        {out && <span className="absolute start-3 top-3"><SoldOut /></span>}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button onClick={() => setSheet(p.id)} className="text-start">
          <h3 className="font-semibold leading-snug">{t(p.en, p.ar)}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink/50">{t(p.desc.en, p.desc.ar)}</p>
        </button>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span>
            <Money value={p.sizes ? p.sizes[0].price : p.price} className="font-semibold text-wine" />
            <span className="ms-2 text-xs text-ink/40">{t(`${p.kcal} kcal`, `${p.kcal} سعرة`)}</span>
          </span>
          <button onClick={() => setSheet(p.id)} disabled={out} aria-label={t('Add ' + p.en, 'أضف ' + p.ar)}
            className="flex h-9 min-w-9 items-center justify-center rounded-full bg-forest px-2 text-cream transition active:scale-90 disabled:invisible">
            {n > 0 ? <span className="px-1 text-sm font-bold">{n}</span> : <Plus size={16} weight="bold" />}
          </button>
        </div>
      </div>
    </article>
  );
}

// Separate pages (#/menu, #/branches): a brand band on top, then the content.
function PageBanner({ title, sub, photo }) {
  const { t } = useStore();
  return (
    <section className="staff-lines relative overflow-hidden bg-forest text-cream">
      <img src={asset('assets/menu/' + photo + '.jpg')} alt="" className="absolute inset-y-0 end-0 hidden h-full w-2/5 object-cover opacity-40 md:block [mask-image:linear-gradient(to_left,black,transparent)] rtl:[mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <a href="#/" className="text-sm text-cream/60 hover:text-cream">{t('Home', 'الرئيسية')}</a>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-xl text-cream/75">{sub}</p>
      </div>
    </section>
  );
}

function MenuPage() {
  const { t } = useStore();
  return (
    <>
      <PageBanner photo="_coffee" title={t('Menu', 'المنيو')} sub={t('Coffee, drinks, fresh croissants, sandwiches and desserts — prices in Saudi Riyal, from Kav’s menu.', 'قهوة، مشروبات، كرواسون طازج، ساندويتشات وحلويات — الأسعار بالريال السعودي حسب منيو كاف.')} />
      <div className="mx-auto max-w-6xl px-4">
        <PausedBanner className="mt-6" />
        <MenuSection />
      </div>
    </>
  );
}

function BranchesPage() {
  const { t } = useStore();
  return (
    <>
      <PageBanner photo="_green" title={t('Branches', 'الفروع')} sub={t('Dammam · Qatif · Drive Thru — pick a branch, see today’s hours and get directions.', 'الدمام · القطيف · درايف ثرو — اختر الفرع، شوف أوقات اليوم والاتجاهات.')} />
      <div className="mx-auto max-w-6xl px-4">
        <BranchesSection />
      </div>
    </>
  );
}

// Home: a short list that leads to the Branches page.
function BranchesTeaser() {
  const { t, ar } = useStore();
  return (
    <section className="mt-16">
      <SectionTitle title={t('Our branches', 'فروعنا')} sub={t(cafe.city.en, cafe.city.ar)}
        action={<a href="#/branches" className="flex items-center gap-1 text-sm font-medium text-wine">{t('All branches & hours', 'كل الفروع والأوقات')}<ArrowRight size={14} className="rtl:-scale-x-100" /></a>} />
      <div className="no-scrollbar -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2">
        {branches.map((b) => {
          const s = openStatus(b);
          return (
            <a key={b.id} href="#/branches" className="flex w-64 shrink-0 items-start gap-3 rounded-3xl bg-white p-4 shadow-sm hover:shadow-md">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-wine">{b.drive ? <Car size={20} /> : <MapPin size={20} />}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug">{t(b.en, b.ar)}</span>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-ink/60"><span className={'h-1.5 w-1.5 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />{s.isOpen ? t('Open', 'مفتوح') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function MenuSection() {
  const { t } = useStore();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(categories[0].id);
  const q = query.trim().toLowerCase();
  const results = q ? menu.filter((p) => !p.hidden && (p.en + ' ' + p.ar + ' ' + p.desc.en + ' ' + p.desc.ar).toLowerCase().includes(q)) : null;
  const strip = useRef(null);

  // Scroll-spy: highlight the category whose section is under the sticky bar.
  useEffect(() => {
    const onScroll = () => {
      let current = categories[0].id;
      for (const c of categories) {
        const el = document.getElementById('cat-' + c.id);
        if (el && el.getBoundingClientRect().top < 200) current = c.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="menu">
      <div className="sticky top-20 z-30 -mx-4 mt-2 border-b border-ink/5 bg-paper/95 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-forest/30 md:w-72">
            <MagnifyingGlass size={18} className="shrink-0 text-forest" />
            <span className="sr-only">{t('Search the menu', 'ابحث في المنيو')}</span>
            <input id="site-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Search the menu', 'ابحث في المنيو')} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink/40" />
            {query && <button onClick={() => setQuery('')} aria-label={t('Clear search', 'مسح البحث')} className="grid h-6 w-6 place-items-center rounded-full bg-ink/10"><X size={12} weight="bold" /></button>}
          </label>
          {!results && (
            <nav ref={strip} className="no-scrollbar flex gap-2 overflow-x-auto" aria-label={t('Categories', 'الأقسام')}>
              {categories.map((c) => (
                <a key={c.id} href={'#/menu?c=' + c.id} className={'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ' + (active === c.id ? 'bg-forest text-cream' : 'bg-white text-ink/70 shadow-sm hover:bg-paper-2')}>{t(c.en, c.ar)}</a>
              ))}
            </nav>
          )}
        </div>
      </div>

      {results ? (
        <div className="mt-6">
          <p className="text-sm text-ink/55">{t(`${results.length} results for “${query.trim()}”`, `${results.length} نتيجة لـ “${query.trim()}”`)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </div>
      ) : categories.map((c) => {
        const items = menu.filter((p) => !p.hidden && p.category === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} id={'cat-' + c.id} className="scroll-mt-40 pt-8">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-wine">{t(c.en, c.ar)}</h3>
              <span className="font-ar text-sm text-ink/40">{t(c.ar, c.en)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </div>
        );
      })}
    </section>
  );
}

function BranchesSection() {
  const { t, ar, branch, mode, setBranch, setMode, setToast } = useStore();
  const choose = (b) => {
    setBranch(b.id); setMode('pickup');
    setToast(t('Ordering from ' + b.en, 'الطلب من ' + b.ar));
    go('menu');
  };
  return (
    <section id="branches">
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((b) => {
          const s = openStatus(b);
          const on = mode === 'pickup' && branch.id === b.id;
          return (
            <article key={b.id} className={'flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-2 ' + (on ? 'ring-forest' : 'ring-transparent')}>
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-wine">{b.drive ? <Car size={22} /> : <MapPin size={22} />}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug">{t(b.en, b.ar)}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60"><span className={'h-1.5 w-1.5 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />{s.isOpen ? t('Open now', 'مفتوح الآن') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-1 text-sm">
                {b.lines.map((l) => (
                  <div key={l[0]} className="flex justify-between gap-3"><dt className="flex items-center gap-1.5 text-ink/55"><Clock size={14} />{t(l[0], l[1])}</dt><dd className="font-medium">{t(l[2], l[3])}</dd></div>
                ))}
              </dl>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                <button onClick={() => choose(b)} className={'h-11 rounded-xl text-sm font-semibold ' + (on ? 'bg-forest/10 text-forest' : 'bg-forest text-cream')}>{on ? t('Ordering from here ✓', 'تطلب من هنا ✓') : t('Order from here', 'اطلب من هنا')}</button>
                <a href={mapsLink(b)} target="_blank" rel="noreferrer" aria-label={t('Directions', 'الاتجاهات')} className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-forest"><NavigationArrow size={18} weight="fill" className="rtl:-scale-x-100" /></a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useStore();
  return (
    <footer className="staff-lines mt-20 bg-forest-deep text-cream">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-28 pt-14 text-center md:pb-10">
        <Wordmark light className="h-20 w-auto" />
        <p className="mt-4 font-ar text-lg text-sand">{cafe.tagline.ar}..</p>
        <p className="mt-2 text-sm text-cream/60">{t('Dammam · Qatif · Drive Thru', 'الدمام · القطيف · درايف ثرو')}</p>
        <nav className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-cream/80">
          <a href="#/menu" className="hover:text-cream">{t('Menu', 'المنيو')}</a>
          <a href="#/branches" className="hover:text-cream">{t('Branches', 'الفروع')}</a>
          <a href="#/orders" className="hover:text-cream">{t('My orders', 'طلباتي')}</a>
          <a href={cafe.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cream"><InstagramLogo size={16} />Instagram</a>
        </nav>
        <p className="mt-8 text-[11px] leading-relaxed text-cream/40">
          {t('Design preview · menu & prices from @kav.cafe · orders and payments are simulated', 'معاينة تصميم · المنيو والأسعار من حساب @kav.cafe · الطلبات والدفع محاكاة')}<br />© {new Date().getFullYear()} Kav Cafe
        </p>
      </div>
    </footer>
  );
}

// Phones: sticky "view bag" bar while browsing.
function MobileBagBar({ hidden }) {
  const { t, count, subtotal } = useStore();
  if (hidden || !count) return null;
  return (
    <button onClick={() => go('bag')} className="fade-up fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),12px)] z-30 flex h-14 items-center gap-3 rounded-2xl bg-wine px-4 text-cream shadow-[0_14px_30px_-12px_rgba(107,43,22,.85)] md:hidden">
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
    <div role="status" className="fade-up pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream shadow-xl">
        <CheckCircle size={18} weight="fill" className="text-sand" />{toast}
      </div>
    </div>
  );
}

