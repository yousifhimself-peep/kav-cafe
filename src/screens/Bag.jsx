import { useStore } from '../store';
import { go } from '../router';
import { byId, sampleOptions } from '../data/menu';
import { Money, ProductArt, Stepper, TopBar, Empty, PrimaryButton, itemCount, PausedBanner, SoldOut } from '../components/ui';
import { ShoppingBag, ArrowRight, Plus, Storefront, Moped } from '../components/icons';

export function describeChoice(product, choice, t) {
  const parts = [];
  const size = product.sizes?.find((s) => s.id === choice.size);
  if (size) parts.push(t(size.en, size.ar));
  const milk = sampleOptions.milk.choices.find((c) => c.id === choice.milk);
  if (milk && milk.id !== 'regular') parts.push(t(milk.en + ' milk', 'حليب ' + milk.ar));
  if (choice.ice === 'light') parts.push(t('Light ice', 'ثلج خفيف'));
  if (choice.shot) parts.push(t('Extra shot', 'شوت إضافي'));
  for (const g of ['addons', 'remove']) {
    for (const id of choice[g] || []) {
      const c = sampleOptions[g].choices.find((x) => x.id === id);
      if (c) parts.push(g === 'addons' ? t('+ ' + c.en, '+ ' + c.ar) : t(c.en, c.ar));
    }
  }
  return parts.join(' · ');
}

export default function Bag() {
  const { t, ar, lines, count, subtotal, setQty, setSheet, cart, mode, branch, isAvailable, paused } = useStore();
  const upsell = ['cookies', 'zaatar-croissant', 'lotus-cheesecake', 'mojito', 'madeleine'].filter((id) => byId[id] && !byId[id].hidden && isAvailable(id) && !cart.some((l) => l.id === id)).slice(0, 3);
  const soldOut = lines.filter((l) => !isAvailable(l.id));

  if (!count) {
    return (
      <div className="min-h-full pb-32">
        <TopBar title={t('Your bag', 'سلتك')} />
        <Empty icon={ShoppingBag} title={t('Your bag is empty', 'سلتك فاضية')}
          body={t('A good day starts with a good cup. Find yours on the menu.', 'اليوم الحلو يبدأ بكوب حلو. اختار كوبك من المنيو.')}
          action={<button onClick={() => go('menu')} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream shadow-lg">{t('Browse the menu', 'تصفح المنيو')}<ArrowRight size={16} className="rtl:-scale-x-100" /></button>} />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-32">
      <TopBar title={t('Your bag', 'سلتك')} right={<span className="text-sm text-ink/50">{itemCount(count, ar)}</span>} />

      <div className="px-4">
        <PausedBanner className="mb-3" />
        <div className="flex items-center gap-2 rounded-2xl bg-forest/5 px-4 py-3 text-sm text-forest">
          {mode === 'pickup' ? <Storefront size={18} /> : <Moped size={18} />}
          {mode === 'pickup' ? t('Pickup · ' + branch.en, 'استلام · ' + branch.ar) : t('Delivery (sample)', 'توصيل (تجريبي)')}
        </div>

        <ul className="mt-3 divide-y divide-ink/5 rounded-3xl bg-white px-4 shadow-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 py-4">
              <button onClick={() => setSheet(l.id)} aria-label={t(l.product.en, l.product.ar)}>
                <ProductArt product={l.product} size="sm" className="h-16 w-16 rounded-xl" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug">{t(l.product.en, l.product.ar)}</h3>
                  <Money value={l.total} className="text-sm font-semibold" />
                </div>
                <p className="mt-0.5 text-xs text-ink/50">{describeChoice(l.product, l.choice, t) || t('Original', 'الأصلي')}</p>
                {!isAvailable(l.id) && <p className="mt-1 flex items-center gap-2 text-xs font-medium text-wine"><SoldOut />{t('Just sold out — please remove it', 'نفد للتو — احذفه من السلة')}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-ink/40"><Money value={l.unit} /> {t('each', 'للحبة')}</span>
                  <Stepper small value={l.qty} onChange={(v) => setQty(l.key, Math.min(20, v))} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button onClick={() => go('menu')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 py-3 text-sm font-medium text-forest">
          <Plus size={16} /> {t('Add more items', 'أضف أصناف أخرى')}
        </button>

        {upsell.length > 0 && (
          <section className="mt-7">
            <h2 className="font-semibold">{t('Goes well with', 'يمشي معه')}</h2>
            <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4">
              {upsell.map((id) => {
                const p = byId[id];
                return (
                  <button key={id} onClick={() => setSheet(id)} className="flex w-56 shrink-0 items-center gap-3 rounded-2xl bg-white p-2 text-start shadow-sm">
                    <ProductArt product={p} size="sm" className="h-14 w-14 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{t(p.en, p.ar)}</span>
                      <Money value={p.price} className="text-xs text-wine" />
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-cream"><Plus size={14} weight="bold" /></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-7 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex justify-between text-sm"><span className="text-ink/60">{t('Subtotal', 'المجموع')}</span><Money value={subtotal} /></div>
          <p className="mt-2 text-xs text-ink/40">{t('Prices as listed on Kav’s menu. Delivery fee, if any, is shown at checkout.', 'الأسعار حسب منيو كاف. رسوم التوصيل (إن وجدت) تظهر عند الدفع.')}</p>
        </section>

        <PrimaryButton className="mt-5" disabled={paused || soldOut.length > 0} onClick={() => go('checkout')}>
          <span className="flex-1 text-start">{t('Go to checkout', 'إتمام الطلب')}</span>
          <Money value={subtotal} />
          <ArrowRight size={18} className="rtl:-scale-x-100" />
        </PrimaryButton>
      </div>
    </div>
  );
}
