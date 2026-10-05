import { useStore } from '../store';
import { LEVELS, ORDER_UNITS, UNITS } from '../data/items';
import { CheckCircle, Globe, Warning } from '@phosphor-icons/react';

// Kav logo (traced from their Instagram, see ~/kav-cafe): cream on dark, maroon on light.
export function Wordmark({ light = false, size = 'md', sub = true }) {
  const { t } = useStore();
  const h = { sm: 'h-10', md: 'h-20', lg: 'h-28' }[size];
  return (
    <div className="flex flex-col items-center leading-none">
      <img src={import.meta.env.BASE_URL + (light ? 'assets/logo-cream.png' : 'assets/logo-brown.png')} alt={t('Kav Cafe', 'كاف كافيه')} className={'w-auto ' + h} />
      {sub && <span className={'mt-1.5 text-[11px] font-medium ' + (light ? 'text-paper/60' : 'text-ink/50')}>{t('Kav Cafe · Inventory', 'كاف كافيه · الجرد')}</span>}
    </div>
  );
}

export const STATUS = {
  ok: { en: 'Good', ar: 'جيد', dot: 'bg-ok', pill: 'bg-ok-soft text-ok', ring: 'ring-ok/30' },
  warn: { en: 'Getting low', ar: 'قارب', dot: 'bg-warn', pill: 'bg-warn-soft text-warn', ring: 'ring-warn/30' },
  bad: { en: 'At minimum', ar: 'الحد الأدنى', dot: 'bg-bad', pill: 'bg-bad-soft text-bad', ring: 'ring-bad/30' },
  none: { en: 'No minimum', ar: 'بدون حد', dot: 'bg-ink/20', pill: 'bg-paper-2 text-ink/50', ring: 'ring-ink/10' },
  missing: { en: 'Not counted', ar: 'لم يُجرد', dot: 'bg-ink/15', pill: 'bg-paper-2 text-ink/40', ring: 'ring-ink/10' },
};

export function StatusPill({ s, className = '' }) {
  const { t } = useStore();
  return (
    <span className={'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ' + STATUS[s].pill + ' ' + className}>
      <span className={'h-1.5 w-1.5 rounded-full ' + STATUS[s].dot} />
      {t(STATUS[s].en, STATUS[s].ar)}
    </span>
  );
}

export const Dot = ({ s, className = '' }) => <span className={'inline-block h-2.5 w-2.5 shrink-0 rounded-full ' + STATUS[s].dot + ' ' + className} />;

export function useFormat() {
  const { t } = useStore();
  const num = (n) => (Number.isInteger(n) ? n.toLocaleString('en') : n.toLocaleString('en', { maximumFractionDigits: 2 }));
  const value = (item, v) => {
    if (v == null || v === '') return '—';
    if (item.unit === 'level') { const l = LEVELS.find((x) => x.id === v); return l ? t(l.en, l.ar) : v; }
    return `${num(v)} ${t(UNITS[item.unit].en, UNITS[item.unit].ar)}`;
  };
  const min = (item, m) => (m == null ? '—' : value(item, m));
  const order = (o, times = 1) => {
    if (!o) return '—';
    const u = ORDER_UNITS[o.u] || ORDER_UNITS.pc;
    const n = o.n * times;
    return `${num(n)} ${t(n === 1 ? u.en : u.enPl, u.ar)}`;
  };
  return { num, value, min, order };
}

export function LangToggle({ light = false, className = '' }) {
  const { ar, setLang } = useStore();
  return (
    <button onClick={() => setLang(ar ? 'en' : 'ar')}
      className={'flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ' + (light ? 'bg-paper/10 text-paper hover:bg-paper/20' : 'bg-card text-ink shadow-sm ring-1 ring-ink/5 hover:bg-paper-2') + ' ' + className}>
      <Globe size={16} />{ar ? 'English' : 'العربية'}
    </button>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" className="no-print fade-up pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-xl">
        <CheckCircle size={18} weight="fill" className="text-sand" />{toast}
      </div>
    </div>
  );
}

export function DemoNote({ children, className = '' }) {
  return (
    <p className={'flex gap-2 rounded-xl bg-paper-2 p-3 text-xs leading-relaxed text-ink/60 ' + className}>
      <Warning size={15} className="mt-0.5 shrink-0" />{children}
    </p>
  );
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={'rounded-2xl bg-card p-5 shadow-sm ring-1 ring-ink/5 ' + className}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
