import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { categories, menu } from '../data/menu';
import { Money, ProductArt, Skeleton, Empty, PausedBanner, SoldOut, asset } from '../components/ui';
import { MagnifyingGlass, X, Plus, ArrowLeft } from '../components/icons';
import { go } from '../router';

let visited = false; // show the loading skeleton on the first visit only

export default function Menu({ route, scroller }) {
  const { t, setSheet, cart } = useStore();
  const [loading, setLoading] = useState(!visited);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(route.params.c || categories[0].id);
  const header = useRef(null);
  const input = useRef(null);
  const sections = useRef({});
  const lock = useRef(false);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => { visited = true; setLoading(false); }, 900);
    return () => clearTimeout(id);
  }, [loading]);

  const q = query.trim().toLowerCase();
  const results = (q ? menu.filter((p) => !p.hidden && (p.en + ' ' + p.ar + ' ' + p.desc.en + ' ' + p.desc.ar).toLowerCase().includes(q)) : null); // not memoised: the menu is live-edited from the portal

  // Position of an element inside the scrolling phone screen (independent of wrappers/transforms).
  const topIn = (el) => el.getBoundingClientRect().top - scroller.current.getBoundingClientRect().top + scroller.current.scrollTop;

  const jump = (id, smooth = true) => {
    const el = sections.current[id];
    if (!el || !scroller.current) return;
    lock.current = true;
    setActive(id);
    const s = scroller.current;
    const target = Math.min(topIn(el) - header.current.offsetHeight - 8, s.scrollHeight - s.clientHeight);
    s.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
    setTimeout(() => {
      if (Math.abs(s.scrollTop - target) > 4) s.scrollTo({ top: target }); // smooth scroll got interrupted
      lock.current = false;
    }, 700);
  };

  // Deep links from Home: #/menu?c=cold and #/menu?search=1
  useEffect(() => {
    if (loading) return;
    if (route.params.c) requestAnimationFrame(() => jump(route.params.c, false));
    if (route.params.search) input.current?.focus();
  }, [loading, route.params.c, route.params.search]);

  // Scroll-spy for the category tabs.
  useEffect(() => {
    const el = scroller.current;
    if (!el || loading || results) return;
    const onScroll = () => {
      if (lock.current) return;
      const y = el.scrollTop + header.current.offsetHeight + 24;
      let current = categories[0].id;
      for (const c of categories) if (sections.current[c.id] && topIn(sections.current[c.id]) <= y) current = c.id;
      setActive(current);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [loading, results, scroller]);

  // Keep the active tab visible in the horizontal tab strip.
  useEffect(() => {
    // Scroll only the tab strip (scrollIntoView would also move — and interrupt — the page scroll).
    const tab = document.getElementById('tab-' + active);
    const strip = tab?.parentElement;
    if (!strip) return;
    const a = tab.getBoundingClientRect(), b = strip.getBoundingClientRect(); // works in LTR and RTL
    strip.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: 'smooth' });
  }, [active]);

  const inBag = (id) => cart.filter((l) => l.id === id).reduce((s, l) => s + l.qty, 0);

  return (
    <div className="min-h-full pb-44">
      <div ref={header} className="sticky top-0 z-20 bg-paper/95 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-md">
        <div className="flex items-center gap-2 px-4">
          <button onClick={() => go('home')} aria-label={t('Back', 'رجوع')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm active:scale-95">
            <ArrowLeft size={20} className="rtl:-scale-x-100" />
          </button>
          <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-forest/30">
            <MagnifyingGlass size={18} className="shrink-0 text-forest" />
            <span className="sr-only">{t('Search the menu', 'ابحث في المنيو')}</span>
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Search the menu', 'ابحث في المنيو')}
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink/40"
              type="search"
              enterKeyHint="search"
            />
            {query && (
              <button onClick={() => { setQuery(''); input.current?.focus(); }} aria-label={t('Clear search', 'مسح البحث')} className="grid h-6 w-6 place-items-center rounded-full bg-ink/10">
                <X size={12} weight="bold" />
              </button>
            )}
          </label>
        </div>
        {!results && (
          <div className="no-scrollbar relative mt-3 flex gap-4 overflow-x-auto px-4 pb-3" role="tablist" aria-label={t('Categories', 'الأقسام')}>
            {categories.map((c) => {
              const on = active === c.id;
              return (
                <button id={'tab-' + c.id} key={c.id} role="tab" aria-selected={on} onClick={() => jump(c.id)} disabled={loading}
                  className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 active:scale-95">
                  <span className={'block h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-paper transition ' + (on ? 'ring-forest' : 'ring-transparent')}>
                    <img src={asset('assets/menu/thumbs/_' + c.id + '.jpg')} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className={'text-center text-xs leading-tight transition ' + (on ? 'font-semibold text-forest' : 'text-ink/60')}>{t(c.en, c.ar)}</span>
                </button>
              );
            })}
          </div>
        )}
        {results && <p className="px-5 pb-3 pt-3 text-sm text-ink/55">{t(`${results.length} results for “${query.trim()}”`, `${results.length} نتيجة لـ “${query.trim()}”`)}</p>}
      </div>

      <PausedBanner className="mx-4 mb-2" />
      {loading ? (
        <div className="space-y-6 px-4 pt-3" role="status" aria-label={t('Loading menu', 'جاري تحميل المنيو')}>
          <Skeleton className="h-6 w-40" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-1 space-y-2 pt-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="mt-4 h-4 w-16" /></div>
              <Skeleton className="h-24 w-24 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : results ? (
        results.length ? (
          <ul className="px-4 pt-1">{results.map((p) => <Row key={p.id} p={p} n={inBag(p.id)} open={() => setSheet(p.id)} />)}</ul>
        ) : (
          <Empty icon={MagnifyingGlass} title={t('Nothing matches that', 'ما لقينا شيء')} body={t('Try “caramel”, “matcha” or “cheesecake” — or search in Arabic.', 'جرّب “كراميل” أو “ماتشا” أو “تشيز كيك” — أو ابحث بالإنجليزي.')}
            action={<button onClick={() => setQuery('')} className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream">{t('Show full menu', 'عرض المنيو كامل')}</button>} />
        )
      ) : (
        <div className="fade-up">
          {categories.map((c) => (
            <section key={c.id} ref={(el) => (sections.current[c.id] = el)} aria-labelledby={'h-' + c.id} className="px-4 pt-4">
              <div className="flex items-baseline justify-between">
                <h2 id={'h-' + c.id} className="text-xl font-semibold text-wine">{t(c.en, c.ar)}</h2>
                <span className="font-ar text-sm text-ink/40">{t(c.ar, c.en)}</span>
              </div>
              <ul className="mt-1">{menu.filter((p) => !p.hidden && p.category === c.id).map((p) => <Row key={p.id} p={p} n={inBag(p.id)} open={() => setSheet(p.id)} />)}</ul>
            </section>
          ))}
          <p className="px-6 pt-6 text-center text-[11px] leading-relaxed text-ink/40">
            {t('Menu, prices and photos from Kav’s Instagram menu. Descriptions are for the demo.', 'المنيو والأسعار والصور من منيو كاف في إنستقرام. الأوصاف للتجربة.')}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ p, n, open }) {
  const { t, isAvailable } = useStore();
  const out = !isAvailable(p.id);
  return (
    <li className={'border-b border-ink/5 last:border-0 ' + (out ? 'opacity-55' : '')}>
      <div className="flex items-center gap-4 py-4">
        <button onClick={open} className="min-w-0 flex-1 text-start">
          <h3 className="text-[16px] font-medium leading-snug">{t(p.en, p.ar)}</h3>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink/50">{t(p.desc.en, p.desc.ar)}</p>
          <p className="mt-2 flex items-center gap-2">
            <Money value={p.sizes ? p.sizes[0].price : p.price} className="text-[15px] font-semibold text-ink" />
            <span className="text-xs text-ink/40">{t(`${p.kcal} kcal`, `${p.kcal} سعرة`)}</span>
            {p.sizes && <span className="text-xs text-ink/45">{t('· 2 sizes', '· حجمين')}</span>}
            {out && <SoldOut />}
          </p>
        </button>
        <div className="relative shrink-0">
          <button onClick={open} aria-hidden="true" tabIndex={-1} className="block">
            <ProductArt product={p} size="sm" className="h-24 w-24 rounded-2xl" />
          </button>
          <button onClick={open} disabled={out} aria-label={t('Add ' + p.en, 'أضف ' + p.ar)}
            className="disabled:hidden absolute -bottom-2 end-[-6px] flex h-9 min-w-9 items-center justify-center gap-1 rounded-full bg-cream px-2 text-forest shadow-md ring-1 ring-ink/5 active:scale-90">
            {n > 0 ? <span className="px-1 text-sm font-bold">{n}</span> : <Plus size={18} weight="bold" />}
          </button>
        </div>
      </div>
    </li>
  );
}
