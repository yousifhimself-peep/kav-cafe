import { useMemo, useState } from 'react';
import { useAdmin } from './AdminApp';
import { useShared, CONTENT, defaultLoyalty } from '../shared/storage';
import { sampleCustomers } from './data';
import { Medal, Coffee, Minus, Plus, Gift, UsersThree, Repeat } from '@phosphor-icons/react';
import { PageHead, Card, Switch, Field, Note, inputCls, btnPrimary } from './kit';

export default function Loyalty() {
  const { t } = useAdmin();
  const [loyalty, setLoyalty] = useShared(CONTENT.loyalty, defaultLoyalty);
  const [f, setF] = useState(loyalty);
  const [saved, setSaved] = useState(false);
  const people = useMemo(sampleCustomers, []);
  const save = () => { setLoyalty(f); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const members = 412;
  const close = people.filter((p) => f.stamps - (p.orders % f.stamps) <= 2);

  return (
    <div>
      <PageHead title={t('Loyalty program', 'برنامج الولاء')}
        sub={t('Kav’s stamp card, built into the app: every order adds a stamp automatically — no paper card, no QR to scan. Change the rules here and customers see them right away.', 'بطاقة أختام كاف داخل التطبيق: كل طلب يضيف ختم تلقائيًا — بدون بطاقة ورقية أو باركود. غيّر الشروط هنا ويشوفها العملاء فورًا.')} />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [UsersThree, members, t('members', 'عضو')],
          [Coffee, '3,180', t('stamps this month', 'ختم هذا الشهر')],
          [Gift, 214, t('rewards redeemed', 'مكافأة مستلمة')],
          [Repeat, '61%', t('come back within 7 days', 'يرجعون خلال ٧ أيام')],
        ].map(([Icon, v, l]) => (
          <div key={l} className="rounded-2xl bg-white p-4 shadow-sm">
            <Icon size={20} className="text-wine" />
            <p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p>
            <p className="text-xs text-ink/55">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card title={t('Rules', 'الشروط')} icon={Medal} action={<Switch on={f.on} onChange={(on) => setF((x) => ({ ...x, on }))} label={t('Loyalty on', 'الولاء مفعّل')} />}>
          <p className="text-xs font-medium text-ink/60">{t('Stamps for a reward', 'عدد الأختام للمكافأة')}</p>
          <div className="mt-2 flex items-center gap-3">
            <button onClick={() => setF((x) => ({ ...x, stamps: Math.max(4, x.stamps - 1) }))} aria-label={t('Fewer', 'أقل')} className="grid h-10 w-10 place-items-center rounded-full bg-paper"><Minus size={16} weight="bold" /></button>
            <span className="w-10 text-center text-2xl font-semibold tabular-nums">{f.stamps}</span>
            <button onClick={() => setF((x) => ({ ...x, stamps: Math.min(12, x.stamps + 1) }))} aria-label={t('More', 'أكثر')} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-cream"><Plus size={16} weight="bold" /></button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t('Reward (English)', 'المكافأة (إنجليزي)')}><input value={f.reward.en} onChange={(e) => setF((x) => ({ ...x, reward: { ...x.reward, en: e.target.value } }))} className={inputCls} dir="ltr" /></Field>
            <Field label={t('Reward (Arabic)', 'المكافأة (عربي)')}><input value={f.reward.ar} onChange={(e) => setF((x) => ({ ...x, reward: { ...x.reward, ar: e.target.value } }))} className={inputCls} dir="rtl" /></Field>
          </div>
          <button onClick={save} className={btnPrimary + ' mt-4 w-full'}>{saved ? t('Saved — live in the app ✓', 'تم الحفظ — مفعّل بالتطبيق ✓') : t('Save rules', 'حفظ الشروط')}</button>
        </Card>

        <Card title={t('What customers see', 'اللي يشوفه العميل')}>
          <div className={'staff-lines rounded-3xl bg-wine p-5 text-cream ' + (f.on ? '' : 'opacity-40')}>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cream/60">{t('Kav loyalty', 'برنامج ولاء كاف')}</p>
            <p className="mt-1 text-lg font-semibold">{t(`${f.stamps - 3} more cups to your reward`, `باقي ${f.stamps - 3} أكواب على مكافأتك`)}</p>
            <p className="text-sm text-cream/75">{t(f.reward.en, f.reward.ar)}</p>
            <div className="mt-4 flex gap-1.5" dir="ltr">
              {Array.from({ length: f.stamps }).map((_, i) => (
                <span key={i} className={'grid aspect-square max-w-10 flex-1 place-items-center rounded-full border ' + (i < 3 ? 'border-cream bg-cream text-wine' : 'border-cream/30 text-cream/30')}><Coffee size={13} weight={i < 3 ? 'fill' : 'regular'} /></span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium">{t(`${close.length} customers are 1–2 stamps from a reward`, `${close.length} عميل باقي لهم ١–٢ ختم على المكافأة`)}</p>
          <p className="text-xs text-ink/50">{t('Send them a nudge from Notifications → “Almost there”.', 'أرسل لهم تذكير من الإشعارات ← “قربت”.')}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {close.slice(0, 8).map((p) => <li key={p.id} className="rounded-full bg-paper px-2.5 py-1 text-xs">{t(p.en, p.ar)}</li>)}
          </ul>
        </Card>
      </div>
      <Note>{t('Member numbers are sample data. In the real build, stamps are tied to the customer’s phone number and work at every branch.', 'أرقام الأعضاء تجريبية. في النسخة الفعلية الأختام مربوطة برقم جوال العميل وتشتغل في كل الفروع.')}</Note>
    </div>
  );
}
