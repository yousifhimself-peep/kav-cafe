import { useState } from 'react';
import { useAdmin } from './AdminApp';
import { categories, baseMenu } from '../data/menu';
import { menu } from './data';
import { ProductArt } from '../components/ui';
import { MagnifyingGlass, ArrowCounterClockwise, PencilSimple, Plus, UploadSimple, Trash, Eye, EyeSlash, Star } from '@phosphor-icons/react';
import { PageHead, Switch, Field, Panel, Badge, Note, inputCls, btnPrimary, btnGhost } from './kit';

const isBase = (id) => baseMenu.some((p) => p.id === id);

export default function MenuAdmin() {
  const { t, availability, setAvailability, catalog, isAdmin } = useAdmin();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState(null); // product id, or 'new'
  const isOn = (id) => availability[id] !== false;
  const toggle = (id) => setAvailability((a) => {
    const next = { ...a };
    if (next[id] === false) delete next[id]; else next[id] = false;
    return next;
  });
  const soldOut = menu.filter((p) => !isOn(p.id));
  const query = q.trim().toLowerCase();
  const list = menu.filter((p) => (cat === 'all' || p.category === cat) && (p.en + ' ' + p.ar).toLowerCase().includes(query));

  return (
    <div>
      <PageHead
        title={t('Menu & stock', 'المنيو والتوفر')}
        sub={isAdmin
          ? t('Edit prices, names, descriptions and photos, add new items or hide one — the app and website update instantly. Switch an item off when it runs out.', 'عدّل الأسعار والأسماء والأوصاف والصور، أضف أصناف جديدة أو أخفِ صنف — التطبيق والموقع يتحدثون فورًا. وأوقف الصنف لما يخلص.')
          : t('Switch an item off when it runs out — customers see “Sold out” right away.', 'أوقف الصنف لما يخلص — يظهر للعملاء “نفد” مباشرة.')}
        action={<>
          {soldOut.length > 0 && <button onClick={() => setAvailability({})} className={btnGhost}><ArrowCounterClockwise size={17} />{t(`Restock all (${soldOut.length})`, `إرجاع الكل (${soldOut.length})`)}</button>}
          {isAdmin && <button onClick={() => setEditing('new')} className={btnPrimary}><Plus size={17} weight="bold" />{t('Add item', 'إضافة صنف')}</button>}
        </>}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-forest/30">
          <MagnifyingGlass size={18} className="text-forest" />
          <span className="sr-only">{t('Search items', 'ابحث عن صنف')}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search items', 'ابحث عن صنف')} className="min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {[{ id: 'all', en: 'All', ar: 'الكل' }, ...categories].map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}
              className={'h-11 shrink-0 rounded-xl px-4 text-sm font-medium ' + (cat === c.id ? 'bg-forest text-cream' : 'bg-white text-ink/70 shadow-sm')}>{t(c.en, c.ar)}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">{t('Item', 'الصنف')}</th>
              <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">{t('Category', 'القسم')}</th>
              <th className="px-4 py-3 text-end font-semibold">{t('Price', 'السعر')}</th>
              <th className="px-4 py-3 text-end font-semibold">{t('Available', 'متوفر')}</th>
              {isAdmin && <th className="w-12 px-2 py-3"><span className="sr-only">{t('Edit', 'تعديل')}</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {list.map((p) => {
              const on = isOn(p.id);
              const c = categories.find((x) => x.id === p.category);
              const edited = !!catalog.edits?.[p.id];
              return (
                <tr key={p.id} className={on ? '' : 'bg-wine/[0.03]'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductArt product={p} size="sm" className="h-12 w-12 shrink-0 rounded-xl" />
                      <div className="min-w-0">
                        <span className={'block font-medium ' + (on ? '' : 'text-ink/50 line-through decoration-wine/40')}>{t(p.en, p.ar)}</span>
                        <span className="font-ar text-xs text-ink/45">{t(p.ar, p.en)}</span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {!isBase(p.id) && <Badge tone="green">{t('New', 'جديد')}</Badge>}
                          {edited && isBase(p.id) && <Badge tone="gold">{t('Edited', 'معدّل')}</Badge>}
                          {p.hidden && <Badge tone="wine">{t('Hidden', 'مخفي')}</Badge>}
                          {p.featured && <Badge>{t('Featured', 'مميز')}</Badge>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-ink/60 md:table-cell">{c ? t(c.en, c.ar) : '—'}</td>
                  <td className="px-4 py-3 text-end font-medium tabular-nums">{p.sizes ? p.sizes.map((s) => s.price).join(' / ') : p.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {!on && <span className="hidden text-xs font-semibold uppercase tracking-wider text-wine sm:inline">{t('Sold out', 'نفد')}</span>}
                      <Switch on={on} onChange={() => toggle(p.id)} label={t(`${p.en} available`, `${p.ar} متوفر`)} />
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-2 py-3">
                      <button onClick={() => setEditing(p.id)} aria-label={t('Edit ' + p.en, 'تعديل ' + p.ar)} className="grid h-9 w-9 place-items-center rounded-lg text-forest hover:bg-paper"><PencilSimple size={18} /></button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && <p className="p-10 text-center text-sm text-ink/50">{t('No items match your search.', 'لا توجد أصناف مطابقة.')}</p>}
      </div>

      <Note>{t('Prices in Saudi Riyal. Starting point is Kav’s published Instagram menu; edits are kept in this browser for the demo (a real build saves them to the server for every device).', 'الأسعار بالريال السعودي. البداية من منيو كاف المنشور في إنستقرام؛ التعديلات محفوظة في هذا المتصفح للتجربة (النسخة الفعلية تحفظها على السيرفر لكل الأجهزة).')}</Note>

      {editing && <ItemEditor id={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

// Downscale an uploaded photo so it fits comfortably in localStorage.
const readPhoto = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, 640 / Math.max(img.width, img.height));
    const c = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * s), height: Math.round(img.height * s) });
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    resolve(c.toDataURL('image/jpeg', 0.82));
  };
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
});

function ItemEditor({ id, onClose }) {
  const { t, catalog, setCatalog } = useAdmin();
  const isNew = id === 'new';
  const current = isNew
    ? { id: 'item-' + Date.now().toString(36), category: categories[0].id, en: '', ar: '', price: 15, kcal: 0, photo: null, desc: { en: '', ar: '' }, allergens: [], options: [] }
    : menu.find((p) => p.id === id);
  const [f, setF] = useState(() => ({ ...current, desc: { ...current.desc }, sizes: current.sizes?.map((s) => ({ ...s })) }));
  const [error, setError] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const base = baseMenu.find((p) => p.id === id);

  const save = () => {
    if (!f.en.trim() || !f.ar.trim()) { setError(t('Add the name in English and Arabic.', 'أضف الاسم بالإنجليزي والعربي.')); return; }
    const price = f.sizes ? f.sizes[0].price : Number(f.price);
    const fields = { en: f.en.trim(), ar: f.ar.trim(), desc: { en: f.desc.en.trim(), ar: f.desc.ar.trim() }, price, kcal: Number(f.kcal) || 0, category: f.category, photo: f.photo, featured: !!f.featured, hidden: !!f.hidden, ...(f.sizes ? { sizes: f.sizes.map((s) => ({ ...s, price: Number(s.price) })) } : {}) };
    setCatalog((c) => (isNew
      ? { ...c, added: [...(c.added || []), { ...f, ...fields }] }
      : base
        ? { ...c, edits: { ...(c.edits || {}), [id]: fields } }
        : { ...c, added: (c.added || []).map((p) => (p.id === id ? { ...p, ...fields } : p)) }));
    onClose();
  };
  const resetToOriginal = () => {
    setCatalog((c) => { const edits = { ...(c.edits || {}) }; delete edits[id]; return { ...c, edits }; });
    onClose();
  };
  const remove = () => {
    setCatalog((c) => (base ? { ...c, removed: [...(c.removed || []), id] } : { ...c, added: (c.added || []).filter((p) => p.id !== id) }));
    onClose();
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (file) set('photo', await readPhoto(file));
  };

  return (
    <Panel title={isNew ? t('New menu item', 'صنف جديد') : t('Edit item', 'تعديل الصنف')} onClose={onClose}
      footer={<>
        {!isNew && <button onClick={remove} className="flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-wine hover:bg-wine/5"><Trash size={17} />{t('Remove', 'حذف')}</button>}
        <span className="flex-1" />
        <button onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-medium text-ink/60 hover:bg-paper">{t('Cancel', 'إلغاء')}</button>
        <button onClick={save} className={btnPrimary + ' !h-11 px-6'}>{t('Save — goes live', 'حفظ — ينشر مباشرة')}</button>
      </>}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-paper-2">
            {f.photo ? <ProductArt product={{ ...f, photo: f.photo }} size="sm" className="h-full w-full" /> : <div className="grid h-full place-items-center text-xs text-ink/40">{t('No photo', 'بدون صورة')}</div>}
          </div>
          <div className="space-y-2">
            <label className={btnGhost + ' cursor-pointer'}><UploadSimple size={17} />{t('Upload photo', 'رفع صورة')}<input type="file" accept="image/*" onChange={upload} className="sr-only" /></label>
            {base && f.photo !== base.photo && <button onClick={() => set('photo', base.photo)} className="block text-xs font-medium text-ink/50 underline">{t('Use the original photo', 'استخدم الصورة الأصلية')}</button>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Name (English)', 'الاسم (إنجليزي)')}><input value={f.en} onChange={(e) => set('en', e.target.value)} className={inputCls} dir="ltr" /></Field>
          <Field label={t('Name (Arabic)', 'الاسم (عربي)')}><input value={f.ar} onChange={(e) => set('ar', e.target.value)} className={inputCls} dir="rtl" /></Field>
        </div>
        <Field label={t('Description (English)', 'الوصف (إنجليزي)')}><textarea rows={2} value={f.desc.en} onChange={(e) => set('desc', { ...f.desc, en: e.target.value })} className={inputCls + ' h-auto py-2'} dir="ltr" /></Field>
        <Field label={t('Description (Arabic)', 'الوصف (عربي)')}><textarea rows={2} value={f.desc.ar} onChange={(e) => set('desc', { ...f.desc, ar: e.target.value })} className={inputCls + ' h-auto py-2'} dir="rtl" /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Category', 'القسم')}>
            <select value={f.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              {categories.map((c) => <option key={c.id} value={c.id}>{t(c.en, c.ar)}</option>)}
            </select>
          </Field>
          <Field label={t('Calories (kcal)', 'السعرات')}><input type="number" min="0" value={f.kcal} onChange={(e) => set('kcal', e.target.value)} className={inputCls} /></Field>
        </div>

        {f.sizes ? (
          <div className="grid grid-cols-2 gap-3">
            {f.sizes.map((s, i) => (
              <Field key={s.id} label={t(`Price · ${s.en} (SAR)`, `السعر · ${s.ar} (ريال)`)}>
                <input type="number" min="0" step="0.5" value={s.price} onChange={(e) => set('sizes', f.sizes.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} className={inputCls} />
              </Field>
            ))}
          </div>
        ) : (
          <Field label={t('Price (SAR)', 'السعر (ريال)')} hint={base && Number(f.price) !== base.price ? t(`Menu price: ${base.price}`, `سعر المنيو: ${base.price}`) : null}>
            <input type="number" min="0" step="0.5" value={f.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
          </Field>
        )}

        <div className="divide-y divide-ink/5 rounded-2xl bg-white px-4">
          <label className="flex items-center justify-between gap-3 py-3 text-sm"><span className="flex items-center gap-2"><Star size={18} className="text-sand" />{t('Featured on the home page', 'يظهر في المميز بالرئيسية')}</span><Switch small on={!!f.featured} onChange={(v) => set('featured', v)} label={t('Featured', 'مميز')} /></label>
          <label className="flex items-center justify-between gap-3 py-3 text-sm"><span className="flex items-center gap-2">{f.hidden ? <EyeSlash size={18} className="text-wine" /> : <Eye size={18} className="text-forest" />}{t('Hidden from customers', 'مخفي عن العملاء')}</span><Switch small on={!!f.hidden} onChange={(v) => set('hidden', v)} label={t('Hidden', 'مخفي')} /></label>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-wine">{error}</p>}
        {base && catalog.edits?.[id] && (
          <button onClick={resetToOriginal} className="flex items-center gap-1.5 text-sm font-medium text-forest"><ArrowCounterClockwise size={16} />{t('Reset to Kav’s published menu', 'إرجاع لمنيو كاف الأصلي')}</button>
        )}
      </div>
    </Panel>
  );
}
