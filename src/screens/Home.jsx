import { useStore } from '../store';
import { go } from '../router';
import { cafe, categories, menu, branches } from '../data/menu';
import { Money, ProductArt, Wordmark, asset, catIcon, itemCount, PausedBanner, SoldOut } from '../components/ui';
import { MagnifyingGlass, MapPin, Clock, Car, Storefront, Moped, CaretDown, Plus, ArrowRight, Globe, InstagramLogo, NavigationArrow } from '../components/icons';
import { useState } from 'react';
import ModeSheet from '../components/ModeSheet';
import { LoyaltyCard, PromoStrip } from '../components/Extras';
import { openStatus, statusText, mapsLink } from '../shared/hours';

// Category tiles: photos from Kav's Instagram posts and menu. Categories without one get a brand-colour tile.
const categoryPhoto = { coffee: 'menu/_coffee.jpg', drinks: 'menu/_drinks.jpg', croissant: 'menu/_croissant.jpg', food: 'menu/_food.jpg', dessert: 'menu/_dessert.jpg' };

export default function Home() {
  const { t, ar, setLang, mode, setSheet, isAvailable, branch } = useStore();
  const [modeOpen, setModeOpen] = useState(false);
  const status = openStatus(branch);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('Good morning', 'صباح الخير') : hour < 18 ? t('Good afternoon', 'مساء الخير') : t('Good evening', 'مساء الخير');
  const featured = menu.filter((p) => !p.hidden && p.featured).sort((a, b) => !!b.photo - !!a.photo);

  return (
    <div className="pb-40">
      {/* Header */}
      <header className="staff-lines relative overflow-hidden rounded-b-[32px] bg-forest px-5 pb-6 pt-[max(env(safe-area-inset-top),16px)] text-cream">
        <div className="flex items-center justify-between">
          <Wordmark light className="h-11 w-auto" />
          <button onClick={() => setLang(ar ? 'en' : 'ar')} className="flex h-9 items-center gap-1.5 rounded-full bg-cream/10 px-3 text-sm font-medium active:scale-95" aria-label={t('Switch to Arabic', 'Switch to English')}>
            <Globe size={16} /> {ar ? 'EN' : 'عربي'}
          </button>
        </div>

        <button onClick={() => setModeOpen(true)} className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-cream/10 p-3 text-start active:scale-[.99]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-forest">
            {mode === 'pickup' ? (branch.drive ? <Car size={20} weight="fill" /> : <Storefront size={20} weight="fill" />) : <Moped size={20} weight="fill" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-wider text-cream/60">{mode === 'pickup' ? t('Pickup from', 'الاستلام من') : t('Deliver to', 'التوصيل إلى')}</span>
            <span className="block truncate text-[15px] font-medium">
              {mode === 'pickup' ? t(branch.en, branch.ar) : t('Home · sample address', 'المنزل · عنوان تجريبي')}
            </span>
          </span>
          <CaretDown size={18} className="shrink-0 text-cream/70" />
        </button>

        <p className="mt-6 text-sm text-cream/70">{greeting} 🤎</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight">{t('What are you craving today?', 'وش مزاجك اليوم؟')}</h1>
        <p className="mt-1 font-ar text-sm text-sand">{cafe.tagline.ar}..</p>

        <button onClick={() => go('menu?search=1')} className="mt-5 flex h-12 w-full items-center gap-3 rounded-2xl bg-cream px-4 text-start text-[15px] text-ink/45 shadow-lg">
          <MagnifyingGlass size={20} className="text-forest" />
          {t('Search caramel, matcha, croissant…', 'ابحث: كراميل، ماتشا، كرواسون…')}
        </button>
      </header>

      {/* Open status */}
      <div className="mx-5 -mt-0 mt-4 flex items-center gap-2 text-sm">
        <span className={'h-2 w-2 rounded-full ' + (status.isOpen ? 'bg-leaf' : 'bg-wine')} />
        <span className="font-medium">{status.isOpen ? t('Open now', 'مفتوح الآن') : t('Closed now', 'مغلق الآن')}</span>
        <span className="truncate text-ink/50">· {statusText(status, t, ar)}</span>
      </div>

      <PausedBanner className="mx-5 mt-3" />
      <PromoStrip className="mx-5 mt-3" />

      {/* Hero */}
      <section className="mx-5 mt-4">
        <button onClick={() => go('menu')} className="relative block h-56 w-full overflow-hidden rounded-[28px] text-start">
          <img src={asset('assets/menu/_hero.jpg')} alt={t('Iced coffee in a green Kav cup', 'قهوة باردة في كوب كاف الأخضر')} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
            <p className="text-2xl font-semibold">{t('Ready when you arrive 🤎', 'جاهزة وقت ما توصل 🤎')}</p>
            <p className="mt-1 text-sm text-cream/80">{t('Order ahead — pick it up at the counter or the drive-thru.', 'اطلب مسبقًا واستلم من الكاونتر أو الدرايف ثرو.')}</p>
          </div>
        </button>
      </section>

      {/* Categories */}
      <section className="mt-8">
        <div className="flex items-end justify-between px-5">
          <h2 className="text-lg font-semibold">{t('Browse the menu', 'تصفح المنيو')}</h2>
          <button onClick={() => go('menu')} className="flex items-center gap-1 text-sm font-medium text-wine">
            {t('See all', 'عرض الكل')} <ArrowRight size={14} className="rtl:-scale-x-100" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {categories.map((c, i) => {
            const Icon = catIcon[c.id];
            const n = menu.filter((p) => !p.hidden && p.category === c.id).length;
            const wide = categories.length % 2 === 1 && i === categories.length - 1; // odd count: last tile spans the row
            return (
              <button key={c.id} onClick={() => go('menu?c=' + c.id)} className={'group relative h-28 overflow-hidden rounded-3xl text-start active:scale-[.98] ' + (wide ? 'col-span-2' : '')}>
                {categoryPhoto[c.id] ? (
                  <img src={asset('assets/' + categoryPhoto[c.id])} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="staff-lines absolute inset-0 bg-wine"><Icon size={96} weight="thin" className="absolute -end-3 -top-3 text-cream/25 transition duration-500 group-hover:scale-105" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/5" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 text-cream">
                  <span>
                    <span className="block text-[15px] font-semibold leading-tight">{t(c.en, c.ar)}</span>
                    <span className="text-[11px] text-cream/70">{itemCount(n, ar)}</span>
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/20 backdrop-blur"><Icon size={16} /></span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-8">
        <div className="px-5">
          <h2 className="text-lg font-semibold">{t('Our picks', 'اختياراتنا')}</h2>
          <p className="text-xs text-ink/50">{t('A few highlights from the menu', 'مختارات من المنيو')}</p>
        </div>
        <div className="no-scrollbar mt-3 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
          {featured.map((p) => (
            <article key={p.id} className="w-40 shrink-0 snap-start">
              <button onClick={() => setSheet(p.id)} className="block w-full text-start">
                <ProductArt product={p} className="h-44 w-40 rounded-3xl" />
                <h3 className="mt-2 flex items-center gap-1.5 text-[15px] font-medium"><span className="truncate">{t(p.en, p.ar)}</span>{!isAvailable(p.id) && <SoldOut />}</h3>
              </button>
              <div className="mt-0.5 flex items-center justify-between">
                <Money value={p.price} className="text-sm font-semibold text-wine" />
                <button onClick={() => setSheet(p.id)} disabled={!isAvailable(p.id)} aria-label={t('Add ' + p.en, 'أضف ' + p.ar)} className="disabled:invisible grid h-8 w-8 place-items-center rounded-full bg-forest text-cream active:scale-90">
                  <Plus size={16} weight="bold" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Loyalty — rules set in the portal (Loyalty page) */}
      <LoyaltyCard className="mx-5 mt-8" />

      {/* Branches */}
      <section className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">{t('Our branches', 'فروعنا')}</h2>
          <span className="text-xs text-ink/45">{t(cafe.city.en, cafe.city.ar)}</span>
        </div>
        <ul className="mt-2 divide-y divide-ink/5">
          {branches.map((b) => {
            const s = openStatus(b);
            return (
              <li key={b.id} className="flex items-start gap-3 py-3">
                {b.drive ? <Car size={20} className="mt-0.5 shrink-0 text-wine" /> : <MapPin size={20} className="mt-0.5 shrink-0 text-wine" />}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium leading-snug">{t(b.en, b.ar)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                    <span className={'h-1.5 w-1.5 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />
                    <span className="text-ink/60">{s.isOpen ? t('Open', 'مفتوح') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}</span>
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-ink/45"><Clock size={13} className="mt-px shrink-0" />{b.lines.map((l) => t(`${l[0]} ${l[2]}`, `${l[1]} ${l[3]}`)).join(' · ')}</p>
                </div>
                <a href={mapsLink(b)} target="_blank" rel="noreferrer" aria-label={t('Directions to ' + b.en, 'الاتجاهات إلى ' + b.ar)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-forest">
                  <NavigationArrow size={16} weight="fill" className="rtl:-scale-x-100" />
                </a>
              </li>
            );
          })}
        </ul>
        <a href={cafe.instagram} target="_blank" rel="noreferrer" className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-paper text-sm font-medium text-forest"><InstagramLogo size={18} />@kav.cafe</a>
      </section>

      <p className="mx-5 mt-6 text-center text-[11px] leading-relaxed text-ink/40">
        {t('Design preview · menu & prices from @kav.cafe · orders are simulated', 'معاينة تصميم · المنيو والأسعار من حساب @kav.cafe · الطلبات محاكاة')}
      </p>

      {modeOpen && <ModeSheet onClose={() => setModeOpen(false)} />}
    </div>
  );
}
