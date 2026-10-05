import { useState } from 'react';
import { useStore, unitPrice } from '../store';
import { byId, categories, sampleOptions, allergenNames } from '../data/menu';
import Sheet from './Sheet';
import { Money, ProductArt, Stepper, SampleTag } from './ui';
import { Check, Info, Fire, Warning } from './icons';

export default function ProductSheet() {
  const { sheet, setSheet } = useStore();
  if (!sheet || !byId[sheet]) return null;
  // key: fresh option state per product
  return <Detail key={sheet} product={byId[sheet]} onClose={() => setSheet(null)} />;
}

function Detail({ product: p, onClose }) {
  const { t, add, setToast, isAvailable } = useStore();
  const out = !isAvailable(p.id);
  const [choice, setChoice] = useState(() => ({
    ...(p.sizes ? { size: p.sizes[0].id } : {}),
    ...(p.options?.includes('milk') ? { milk: 'regular' } : {}),
    ...(p.options?.includes('ice') ? { ice: 'regular' } : {}),
    ...(p.options?.includes('shot') ? { shot: false } : {}),
    ...(p.options?.includes('addons') ? { addons: [] } : {}),
    ...(p.options?.includes('remove') ? { remove: [] } : {}),
  }));
  const [qty, setQty] = useState(1);
  const unit = unitPrice(p, choice);
  const cat = categories.find((c) => c.id === p.category);
  const set = (k, v) => setChoice((c) => ({ ...c, [k]: v }));
  // Toggle an id in a multi-select group, respecting the group's max. Sorted so identical picks share a bag line.
  const toggle = (k, id, max) => setChoice((c) => {
    const list = c[k] || [];
    if (list.includes(id)) return { ...c, [k]: list.filter((x) => x !== id) };
    if (max && list.length >= max) return c;
    return { ...c, [k]: [...list, id].sort() };
  });

  const submit = () => {
    add(p.id, choice, qty);
    setToast(t(`${qty} × ${p.en} added`, `أضفنا ${qty} × ${p.ar}`));
    onClose();
  };

  return (
    <Sheet
      onClose={onClose}
      label={t(p.en, p.ar)}
      flush
      footer={
        <div className="flex items-center gap-3">
          <Stepper value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} min={1} />
          <button onClick={submit} disabled={out} className="flex h-14 flex-1 items-center justify-between rounded-2xl bg-forest px-5 font-semibold text-cream shadow-lg active:scale-[.98] disabled:bg-ink/30 disabled:shadow-none">
            <span>{out ? t('Sold out today', 'نفد اليوم') : t('Add to bag', 'أضف للسلة')}</span>
            {!out && <Money value={unit * qty} />}
          </button>
        </div>
      }
    >
      <div className="relative">
        <ProductArt product={p} size="lg" className="h-72 w-full" />
      </div>

      <div className="px-5 pb-6 pt-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine">{t(cat.en, cat.ar)}</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold leading-tight">{t(p.en, p.ar)}</h2>
            <p className="mt-0.5 font-ar text-sm text-ink/50">{t(p.ar, p.en)}</p>
          </div>
          <Money value={p.sizes ? p.sizes[0].price : p.price} className="pt-1 text-lg font-semibold text-wine" />
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{t(p.desc.en, p.desc.ar)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-ink/70"><Fire size={13} weight="fill" className="text-wine" />{t(`${p.kcal} kcal`, `${p.kcal} سعرة`)}</span>
          {p.allergens.map((a) => (
            <span key={a} className="rounded-full border border-ink/10 px-2.5 py-1 text-xs text-ink/60">{t(allergenNames[a].en, allergenNames[a].ar)}</span>
          ))}
        </div>
        {p.allergens.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink/45"><Warning size={13} />{t('Contains the allergens above · sample info', 'يحتوي على مسببات الحساسية أعلاه · معلومات تجريبية')}</p>
        )}

        {p.sizes && (
          <OptionGroup title={t('Size', 'الحجم')} required>
            {p.sizes.map((s) => (
              <Choice key={s.id} selected={choice.size === s.id} onSelect={() => set('size', s.id)} name="size" label={t(s.en, s.ar)} extra={<Money value={s.price} />} />
            ))}
          </OptionGroup>
        )}

        {p.options?.includes('milk') && (
          <OptionGroup title={t(sampleOptions.milk.en, sampleOptions.milk.ar)} sample>
            {sampleOptions.milk.choices.map((c) => (
              <Choice key={c.id} selected={choice.milk === c.id} onSelect={() => set('milk', c.id)} name="milk" label={t(c.en, c.ar)} extra={c.price ? <>+ <Money value={c.price} /></> : t('Included', 'مشمول')} />
            ))}
          </OptionGroup>
        )}

        {p.options?.includes('ice') && (
          <OptionGroup title={t(sampleOptions.ice.en, sampleOptions.ice.ar)} sample>
            {sampleOptions.ice.choices.map((c) => (
              <Choice key={c.id} selected={choice.ice === c.id} onSelect={() => set('ice', c.id)} name="ice" label={t(c.en, c.ar)} />
            ))}
          </OptionGroup>
        )}

        {p.options?.includes('shot') && (
          <OptionGroup title={t('Extras', 'إضافات')} sample>
            <Choice multi selected={choice.shot} onSelect={() => set('shot', !choice.shot)} label={t(sampleOptions.shot.en, sampleOptions.shot.ar)} extra={<>+ <Money value={sampleOptions.shot.price} /></>} />
          </OptionGroup>
        )}

        {p.options?.includes('addons') && (
          <OptionGroup title={t(sampleOptions.addons.en, sampleOptions.addons.ar)} sample
            counter={t(`Up to ${sampleOptions.addons.max} · ${choice.addons.length}/${sampleOptions.addons.max}`, `حتى ${sampleOptions.addons.max} · ${choice.addons.length}/${sampleOptions.addons.max}`)}>
            {sampleOptions.addons.choices.map((c) => (
              <Choice key={c.id} multi selected={choice.addons.includes(c.id)} onSelect={() => toggle('addons', c.id, sampleOptions.addons.max)}
                disabled={!choice.addons.includes(c.id) && choice.addons.length >= sampleOptions.addons.max}
                label={t(c.en, c.ar)} extra={<>+ <Money value={c.price} /></>} />
            ))}
          </OptionGroup>
        )}

        {p.options?.includes('remove') && (
          <OptionGroup title={t(sampleOptions.remove.en, sampleOptions.remove.ar)} sample>
            {sampleOptions.remove.choices.map((c) => (
              <Choice key={c.id} multi selected={choice.remove.includes(c.id)} onSelect={() => toggle('remove', c.id)} label={t(c.en, c.ar)} />
            ))}
          </OptionGroup>
        )}

        {p.options && (
          <p className="mt-5 flex gap-2 rounded-2xl bg-paper p-3 text-xs leading-relaxed text-ink/60">
            <Info size={16} className="mt-0.5 shrink-0" />
            {t('Options marked “Sample” aren’t on the published menu — they show how customisation would work. Kav sets the real list and prices.',
              'الخيارات “التجريبية” غير موجودة في المنيو المنشور — تعرض فقط طريقة التخصيص. كاف يحدد الخيارات والأسعار الفعلية.')}
          </p>
        )}
      </div>
    </Sheet>
  );
}

function OptionGroup({ title, required, sample, counter, children }) {
  const { t } = useStore();
  return (
    <fieldset className="mt-6">
      <legend className="mb-2 flex w-full items-center gap-2">
        <span className="text-[15px] font-semibold">{title}</span>
        {required && <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold text-forest">{t('Required', 'مطلوب')}</span>}
        {sample && <SampleTag />}
        {counter && <span className="ms-auto text-xs tabular-nums text-ink/45">{counter}</span>}
      </legend>
      <div className="divide-y divide-ink/5 overflow-hidden rounded-2xl bg-white">{children}</div>
    </fieldset>
  );
}

function Choice({ selected, onSelect, label, extra, name, multi, disabled }) {
  return (
    <label className={'relative flex min-h-13 items-center gap-3 px-4 py-3 ' + (disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}>
      <input type={multi ? 'checkbox' : 'radio'} name={name} checked={!!selected} onChange={onSelect} disabled={disabled} className="peer sr-only" />
      <span className={'grid h-5 w-5 shrink-0 place-items-center border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-wine ' + (multi ? 'rounded-md ' : 'rounded-full ') + (selected ? 'border-forest bg-forest text-cream' : 'border-ink/25')}>
        {selected && <Check size={12} weight="bold" />}
      </span>
      <span className="flex-1 text-[15px]">{label}</span>
      {extra && <span className="text-sm text-ink/55">{extra}</span>}
    </label>
  );
}
