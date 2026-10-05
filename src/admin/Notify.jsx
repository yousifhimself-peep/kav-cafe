import { useMemo, useState } from 'react';
import { useAdmin } from './AdminApp';
import { useShared, CONTENT } from '../shared/storage';
import { branches } from '../data/menu';
import { sampleCampaigns, ago } from './data';
import { PaperPlaneTilt, BellRinging, CheckCircle } from '@phosphor-icons/react';
import { PageHead, Card, Field, Note, Badge, inputCls, btnPrimary } from './kit';
import { Wordmark } from '../components/ui';

const TEMPLATES = [
  ['Morning coffee is ready ☕ Order ahead and skip the line', 'قهوة الصباح جاهزة ☕ اطلب مسبقًا وتخطَّ الانتظار'],
  ['New: Espresso Shake — double espresso + vanilla ice cream 🤎', 'جديد: اسبريسو شيك — دبل اسبريسو + آيس كريم فانيلا 🤎'],
  ['You’re one stamp away from a free drink 🤎', 'باقي لك ختم واحد على مشروبك المجاني 🤎'],
  ['Weekend treat: 10% off with code KAV10', 'دلّع نفسك بالويكند: خصم ١٠٪ بكود KAV10'],
];

export default function Notify() {
  const { t } = useAdmin();
  const [push, setPush] = useShared(CONTENT.push, []);
  const [f, setF] = useState({ en: TEMPLATES[0][0], ar: TEMPLATES[0][1], audience: 'all' });
  const [sent, setSent] = useState(false);
  const history = useMemo(() => [...push.map((p) => ({ ...p, opened: Math.round(p.sent * 0.12) })), ...sampleCampaigns()], [push]);
  const audiences = [
    ['all', t('All customers', 'كل العملاء'), 1338],
    ['loyal', t('Loyalty members 1–2 stamps from a reward', 'أعضاء الولاء القريبين من المكافأة'), 96],
    ['lapsed', t('Haven’t ordered in 14 days', 'ما طلبوا من ١٤ يوم'), 241],
    ...branches.map((b) => ['b-' + b.id, t('Usual branch: ' + b.en, 'الفرع المعتاد: ' + b.ar), 120 + b.id.length * 23]),
  ];
  const reach = audiences.find((a) => a[0] === f.audience)?.[2] || 0;

  const send = () => {
    setPush((list) => [{ id: 'p' + Date.now(), en: f.en.trim(), ar: f.ar.trim(), audience: f.audience, at: Date.now(), sent: reach }, ...list].slice(0, 20));
    setSent(true); setTimeout(() => setSent(false), 2500);
  };

  return (
    <div>
      <PageHead title={t('Push notifications', 'الإشعارات')}
        sub={t('Message customers straight on their phones — new items, offers, “we miss you”. Try it: keep the app or website open in another tab, then send.', 'راسل عملاءك على جوالاتهم مباشرة — أصناف جديدة، عروض، “اشتقنا لك”. جرّبها: افتح التطبيق أو الموقع في تبويب ثاني وأرسل.')} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card title={t('New notification', 'إشعار جديد')} icon={BellRinging}>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(([en, ar]) => (
              <button key={en} onClick={() => setF((x) => ({ ...x, en, ar }))} className="rounded-full bg-paper px-3 py-1.5 text-xs text-ink/70 hover:bg-paper-2">{t(en, ar).slice(0, 34)}…</button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <Field label={t('Message (English)', 'الرسالة (إنجليزي)')}><textarea rows={2} maxLength={120} value={f.en} onChange={(e) => setF((x) => ({ ...x, en: e.target.value }))} className={inputCls + ' h-auto py-2'} dir="ltr" /></Field>
            <Field label={t('Message (Arabic)', 'الرسالة (عربي)')}><textarea rows={2} maxLength={120} value={f.ar} onChange={(e) => setF((x) => ({ ...x, ar: e.target.value }))} className={inputCls + ' h-auto py-2'} dir="rtl" /></Field>
            <Field label={t('Send to', 'إرسال إلى')}>
              <select value={f.audience} onChange={(e) => setF((x) => ({ ...x, audience: e.target.value }))} className={inputCls}>
                {audiences.map(([id, l, n]) => <option key={id} value={id}>{l} · {n}</option>)}
              </select>
            </Field>
          </div>
          <button onClick={send} disabled={!f.en.trim() || !f.ar.trim()} className={btnPrimary + ' mt-4 w-full !h-12'}>
            {sent ? <><CheckCircle size={18} weight="fill" />{t(`Sent to ${reach} customers`, `أُرسل إلى ${reach} عميل`)}</> : <><PaperPlaneTilt size={18} weight="fill" />{t(`Send to ${reach} customers`, `إرسال إلى ${reach} عميل`)}</>}
          </button>
        </Card>

        <Card title={t('Preview', 'معاينة')}>
          <div className="rounded-[28px] bg-gradient-to-b from-forest to-forest-deep p-4">
            <p className="text-center text-3xl font-light text-cream/90 tabular-nums">9:41</p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-cream/95 p-3 shadow-xl">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest p-1.5"><Wordmark light className="h-full w-auto" /></span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="flex justify-between text-[11px] text-ink/50"><span className="font-semibold uppercase tracking-wider">Kav Cafe</span>{t('now', 'الآن')}</span>
                <span className="mt-0.5 block font-medium leading-snug">{t(f.en, f.ar) || '…'}</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t('Sent', 'المرسلة')} className="mt-5">
        <ul className="divide-y divide-ink/5">
          {history.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{t(h.en, h.ar)}</span>
                <span className="text-xs text-ink/45">{ago(h.at, Date.now(), t)} · {audiences.find((a) => a[0] === h.audience)?.[1] || h.audience}</span>
              </span>
              {!h.sample && <Badge tone="green">{t('Live', 'مباشر')}</Badge>}
              <span className="text-xs tabular-nums text-ink/55">{t(`${h.sent} sent · ${Math.round((h.opened / h.sent) * 100)}% opened`, `${h.sent} مرسل · ${Math.round((h.opened / h.sent) * 100)}٪ فتح`)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Note>{t('In the demo the notification pops up inside the app and website open in this browser. The real app sends true push notifications to customers’ phones (iPhone and Android).', 'في التجربة يظهر الإشعار داخل التطبيق والموقع المفتوحين بهذا المتصفح. التطبيق الفعلي يرسل إشعارات حقيقية لجوالات العملاء (آيفون وأندرويد).')}</Note>
    </div>
  );
}
