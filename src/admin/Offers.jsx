import { useState } from 'react';
import { useAdmin } from './AdminApp';
import { useShared, CONTENT, defaultPromos } from '../shared/storage';
import { Megaphone, Ticket, Plus, Trash, Sparkle } from '@phosphor-icons/react';
import { PageHead, Card, Switch, Field, Note, Badge, inputCls, btnPrimary } from './kit';

export default function Offers() {
  const { t } = useAdmin();
  const [promos, setPromos] = useShared(CONTENT.promos, defaultPromos);
  const [banner, setBanner] = useState(promos.banner);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ code: '', type: 'percent', value: 10, en: '', ar: '' });
  const [err, setErr] = useState('');

  const saveBanner = () => { setPromos((p) => ({ ...p, banner })); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const setCodes = (fn) => setPromos((p) => ({ ...p, codes: fn(p.codes) }));
  const addCode = () => {
    const code = draft.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9]{3,16}$/.test(code)) { setErr(t('Use 3–16 letters or numbers.', 'استخدم ٣–١٦ حرف أو رقم.')); return; }
    if (promos.codes.some((c) => c.code === code)) { setErr(t('That code already exists.', 'الكود موجود.')); return; }
    const v = Number(draft.value);
    const label = draft.type === 'percent' ? [`${v}% off`, `خصم ${v}٪`] : [`${v} SAR off`, `خصم ${v} ريال`];
    setCodes((c) => [{ code, type: draft.type, value: v, on: true, uses: 0, en: draft.en.trim() || label[0], ar: draft.ar.trim() || label[1] }, ...c]);
    setDraft({ code: '', type: 'percent', value: 10, en: '', ar: '' }); setErr('');
  };

  return (
    <div>
      <PageHead title={t('Offers & promo codes', 'العروض وأكواد الخصم')}
        sub={t('Run a promotion in seconds: a banner across the top of the app and website, and codes customers type at checkout.', 'أطلق عرض بثواني: شريط إعلان أعلى التطبيق والموقع، وأكواد يكتبها العميل عند الدفع.')} />

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card title={t('Announcement banner', 'شريط الإعلان')} icon={Megaphone} action={<Switch on={banner.on} onChange={(on) => setBanner((b) => ({ ...b, on }))} label={t('Banner on', 'الشريط مفعّل')} />}>
          <div className="space-y-3">
            <Field label={t('Text (English)', 'النص (إنجليزي)')}><input value={banner.en} onChange={(e) => setBanner((b) => ({ ...b, en: e.target.value }))} className={inputCls} dir="ltr" /></Field>
            <Field label={t('Text (Arabic)', 'النص (عربي)')}><input value={banner.ar} onChange={(e) => setBanner((b) => ({ ...b, ar: e.target.value }))} className={inputCls} dir="rtl" /></Field>
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink/60">{t('Preview', 'معاينة')}</p>
              <div className={'flex items-center gap-2 overflow-hidden rounded-xl bg-wine px-4 py-2.5 text-[13px] font-medium text-cream ' + (banner.on ? '' : 'opacity-40')}>
                <Sparkle size={14} weight="fill" className="shrink-0 text-sand" /><span className="truncate">{t(banner.en, banner.ar) || '—'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['Order ahead and skip the line at every Kav branch 🤎 Use KAV10 for 10% off', 'اطلب مسبقًا وتخطَّ الانتظار في كل فروع كاف 🤎 استخدم KAV10 لخصم ١٠٪'],
                ['Your morning coffee + a second one for 0.96 SAR ☕', 'قهوة صبحك والثانية بـ ٩٦ هللة ☕'],
                ['New branch now open at King Fahd Specialist Hospital 🤎', 'افتتاح فرعنا الجديد في مستشفى الملك فهد التخصصي 🤎'],
              ].map(([en, ar]) => (
                <button key={en} onClick={() => setBanner((b) => ({ ...b, en, ar, on: true }))} className="rounded-full bg-paper px-3 py-1.5 text-xs text-ink/70 hover:bg-paper-2">{t(en, ar).slice(0, 38)}…</button>
              ))}
            </div>
            <button onClick={saveBanner} className={btnPrimary + ' w-full'}>{saved ? t('Published ✓', 'تم النشر ✓') : t('Publish banner', 'نشر الشريط')}</button>
          </div>
        </Card>

        <Card title={t('New promo code', 'كود خصم جديد')} icon={Ticket}>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('Code', 'الكود')}><input value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} placeholder="SUMMER15" className={inputCls + ' uppercase'} dir="ltr" /></Field>
            <Field label={t('Discount', 'الخصم')}>
              <div className="flex gap-2">
                <input type="number" min="1" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} className={inputCls} />
                <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} className={inputCls + ' w-24'}>
                  <option value="percent">%</option>
                  <option value="amount">{t('SAR', 'ريال')}</option>
                </select>
              </div>
            </Field>
            <Field label={t('Description (English, optional)', 'الوصف (إنجليزي، اختياري)')}><input value={draft.en} onChange={(e) => setDraft((d) => ({ ...d, en: e.target.value }))} className={inputCls} dir="ltr" /></Field>
            <Field label={t('Description (Arabic, optional)', 'الوصف (عربي، اختياري)')}><input value={draft.ar} onChange={(e) => setDraft((d) => ({ ...d, ar: e.target.value }))} className={inputCls} dir="rtl" /></Field>
          </div>
          {err && <p role="alert" className="mt-2 text-sm font-medium text-wine">{err}</p>}
          <button onClick={addCode} disabled={!draft.code.trim()} className={btnPrimary + ' mt-4 w-full'}><Plus size={17} weight="bold" />{t('Create code', 'إنشاء الكود')}</button>
          <Note>{t('Try it: create a code here, then type it at checkout in the app or website.', 'جرّبها: أنشئ كود هنا واكتبه عند الدفع في التطبيق أو الموقع.')}</Note>
        </Card>
      </div>

      <Card title={t('Promo codes', 'أكواد الخصم')} className="mt-5">
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-xs uppercase tracking-wider text-ink/50">
              <tr className="border-b border-ink/5">
                <th className="px-5 py-2 text-start font-semibold">{t('Code', 'الكود')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('Offer', 'العرض')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('Used', 'الاستخدام')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('Active', 'مفعّل')}</th>
                <th className="w-12 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {promos.codes.map((c) => (
                <tr key={c.code}>
                  <td className="px-5 py-3"><span className="rounded-lg bg-paper px-2 py-1 font-mono text-[13px] font-bold tracking-wider">{c.code}</span></td>
                  <td className="px-3 py-3">{t(c.en, c.ar)} <span className="ms-1"><Badge tone={c.type === 'percent' ? 'green' : 'gold'}>{c.type === 'percent' ? `${c.value}%` : t(`${c.value} SAR`, `${c.value} ريال`)}</Badge></span></td>
                  <td className="px-3 py-3 text-end tabular-nums text-ink/60">{c.uses}</td>
                  <td className="px-3 py-3"><div className="flex justify-end"><Switch small on={c.on} onChange={(on) => setCodes((list) => list.map((x) => (x.code === c.code ? { ...x, on } : x)))} label={c.code} /></div></td>
                  <td className="px-3 py-3"><button onClick={() => setCodes((list) => list.filter((x) => x.code !== c.code))} aria-label={t('Delete ' + c.code, 'حذف ' + c.code)} className="grid h-8 w-8 place-items-center rounded-lg text-wine hover:bg-wine/5"><Trash size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
