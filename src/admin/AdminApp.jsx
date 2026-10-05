import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, useShared, read, write } from '../shared/storage';
import { loadSamples, SAMPLES_KEY } from './data';
import {
  Receipt, ForkKnife, ChartBar, GearSix, SignOut, Globe, UserCircle, ShieldCheck, Coffee, Pause, Info,
  Storefront, Tag, Medal, UsersThree, BellRinging, IdentificationBadge,
} from '@phosphor-icons/react';
import Orders from './Orders';
import MenuAdmin from './MenuAdmin';
import Overview from './Overview';
import Settings from './Settings';
import Branches from './Branches';
import Offers from './Offers';
import Loyalty from './Loyalty';
import Customers from './Customers';
import Notify from './Notify';
import Staff from './Staff';
import { useCatalog } from '../shared/catalog';
import { Wordmark } from '../components/ui';

const Ctx = createContext(null);
export const useAdmin = () => useContext(Ctx);

const ROLES = {
  staff: { en: 'Staff · Barista', ar: 'موظف · باريستا', pages: ['orders', 'menu', 'branches'] },
  admin: { en: 'Admin · Manager', ar: 'مدير · إدارة', pages: ['orders', 'menu', 'branches', 'overview', 'offers', 'loyalty', 'customers', 'notify', 'staff', 'settings'] },
};

const useHash = () => {
  const get = () => location.hash.replace(/^#\/?/, '') || 'orders';
  const [h, setH] = useState(get);
  useEffect(() => {
    const on = () => setH(get());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return h;
};

export default function AdminApp() {
  const [lang, setLangState] = useState(() => read('kav-staff-lang', 'en'));
  const [role, setRoleState] = useState(() => read('kav-staff-role', null));
  const [appOrders, setAppOrders] = useShared(KEYS.orders, []);
  const [samples, setSamples] = useShared(SAMPLES_KEY, null);
  const [availability, setAvailability] = useShared(KEYS.availability, {});
  const [store, setStore] = useShared(KEYS.store, {});
  const [catalog, setCatalog] = useCatalog(); // menu edits, shared live with both customer apps
  const page = useHash();
  const ar = lang === 'ar';
  const t = (en, arabic) => (ar ? arabic : en);

  useEffect(() => { if (!samples) setSamples(loadSamples()); }, [samples]); // eslint-disable-line
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
  }, [lang, ar]);

  const setLang = (l) => { write('kav-staff-lang', l); setLangState(l); };
  const setRole = (r) => { write('kav-staff-role', r); setRoleState(r); if (r) location.hash = '#/orders'; };

  // One list for the board: real app orders (status defaults to "new") + labelled samples.
  const orders = useMemo(() => [
    ...appOrders.map((o) => ({ ...o, status: o.status || 'new', source: 'app' })),
    ...(samples || []).map((o) => ({ ...o, source: 'sample' })),
  ].sort((a, b) => b.at - a.at), [appOrders, samples]);

  const setStatus = (order, status) => {
    const patch = (list) => list.map((o) => (o.id === order.id && o.at === order.at ? { ...o, status, updatedAt: Date.now() } : o));
    if (order.source === 'app') setAppOrders(patch);
    else setSamples(patch);
  };

  const value = { lang, ar, t, setLang, role, setRole, orders, setStatus, availability, setAvailability, store, setStore, setSamples, setAppOrders, catalog, setCatalog, isAdmin: role === 'admin' };

  if (!role) return <Ctx.Provider value={value}><Login /></Ctx.Provider>;

  const allowed = ROLES[role].pages;
  const current = allowed.includes(page) ? page : 'orders';
  const Page = { orders: Orders, menu: MenuAdmin, overview: Overview, settings: Settings, branches: Branches, offers: Offers, loyalty: Loyalty, customers: Customers, notify: Notify, staff: Staff }[current];

  return (
    <Ctx.Provider value={value}>
      <div className="min-h-dvh bg-paper text-ink lg:flex">
        <Sidebar current={current} allowed={allowed} />
        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <MobileTop />
          {store.paused && (
            <a href="#/settings" className="flex items-center justify-center gap-2 bg-wine px-4 py-2 text-sm font-medium text-cream">
              <Pause size={16} weight="fill" /> {t('Online ordering is paused — customers can’t check out', 'الطلب أونلاين متوقف — العملاء ما يقدرون يطلبون')}
            </a>
          )}
          <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8"><Page /></main>
        </div>
        <MobileTabs current={current} allowed={allowed} />
      </div>
    </Ctx.Provider>
  );
}

function PortalLabel({ light }) {
  const { t } = useAdmin();
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ' + (light ? 'bg-cream/10 text-sand' : 'bg-wine/10 text-wine')}>
      <ShieldCheck size={13} weight="fill" /> {t('Admin / Staff Portal', 'بوابة الإدارة والموظفين')}
    </span>
  );
}

const navItems = (t) => [
  ['orders', Receipt, t('Live orders', 'الطلبات المباشرة')],
  ['menu', ForkKnife, t('Menu & stock', 'المنيو والتوفر')],
  ['branches', Storefront, t('Branches', 'الفروع')],
  ['overview', ChartBar, t('Reports', 'التقارير')],
  ['offers', Tag, t('Offers & codes', 'العروض والأكواد')],
  ['loyalty', Medal, t('Loyalty', 'الولاء')],
  ['customers', UsersThree, t('Customers & reviews', 'العملاء والتقييمات')],
  ['notify', BellRinging, t('Notifications', 'الإشعارات')],
  ['staff', IdentificationBadge, t('Staff & roles', 'الموظفين والصلاحيات')],
  ['settings', GearSix, t('Store settings', 'إعدادات المتجر')],
];

function useNewCount() {
  const { orders } = useAdmin();
  return orders.filter((o) => o.status === 'new').length;
}

function Sidebar({ current, allowed }) {
  const { t, ar, setLang, role, setRole } = useAdmin();
  const newCount = useNewCount();
  return (
    <aside className="staff-lines sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-forest-deep p-5 text-cream lg:flex">
      <Wordmark light className="h-9 w-auto self-start" />
      <div className="mt-4"><PortalLabel light /></div>
      <nav className="no-scrollbar -mx-1 mt-6 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1" aria-label={t('Portal', 'البوابة')}>
        {navItems(t).filter(([id]) => allowed.includes(id)).map(([id, Icon, label]) => (
          <a key={id} href={'#/' + id} aria-current={current === id ? 'page' : undefined}
            className={'flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition ' + (current === id ? 'bg-cream text-forest-deep font-semibold' : 'text-cream/75 hover:bg-cream/10')}>
            <Icon size={20} weight={current === id ? 'fill' : 'regular'} />
            <span className="flex-1">{label}</span>
            {id === 'orders' && newCount > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-wine px-1.5 text-xs font-bold text-cream">{newCount}</span>}
          </a>
        ))}
      </nav>
      <div className="mt-4 space-y-3 border-t border-cream/10 pt-4 text-sm">
        <div className="flex items-center gap-2 text-cream/80"><UserCircle size={22} />{t(ROLES[role].en, ROLES[role].ar)}</div>
        <div className="flex gap-2">
          <button onClick={() => setLang(ar ? 'en' : 'ar')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cream/20 py-2 hover:bg-cream/10"><Globe size={16} />{ar ? 'English' : 'العربية'}</button>
          <button onClick={() => setRole(null)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cream/20 py-2 hover:bg-cream/10"><SignOut size={16} className="rtl:-scale-x-100" />{t('Sign out', 'خروج')}</button>
        </div>
      </div>
    </aside>
  );
}

function MobileTop() {
  const { t, ar, setLang, setRole } = useAdmin();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-forest-deep px-4 py-3 text-cream lg:hidden">
      <Wordmark light className="h-7 w-auto" />
      <PortalLabel light />
      <span className="flex-1" />
      <button onClick={() => setLang(ar ? 'en' : 'ar')} aria-label={t('Switch language', 'تغيير اللغة')} className="grid h-9 w-9 place-items-center rounded-full bg-cream/10"><Globe size={18} /></button>
      <button onClick={() => setRole(null)} aria-label={t('Sign out', 'خروج')} className="grid h-9 w-9 place-items-center rounded-full bg-cream/10"><SignOut size={18} className="rtl:-scale-x-100" /></button>
    </header>
  );
}

function MobileTabs({ current, allowed }) {
  const { t } = useAdmin();
  const newCount = useNewCount();
  const items = navItems(t).filter(([id]) => allowed.includes(id));
  return (
    <nav className="no-scrollbar fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-ink/10 bg-cream/95 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur lg:hidden">
      {items.map(([id, Icon, label]) => (
        <a key={id} href={'#/' + id} aria-current={current === id ? 'page' : undefined} className={'relative flex min-w-[76px] flex-1 shrink-0 flex-col items-center gap-0.5 px-1 py-1 text-center text-[10.5px] font-medium leading-tight ' + (current === id ? 'text-forest' : 'text-ink/45')}>
          <Icon size={22} weight={current === id ? 'fill' : 'regular'} />{label}
          {id === 'orders' && newCount > 0 && <span className="absolute top-0 start-[calc(50%+6px)] grid h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[10px] font-bold text-cream">{newCount}</span>}
        </a>
      ))}
    </nav>
  );
}

function Login() {
  const { t, ar, setLang, setRole } = useAdmin();
  const Card = ({ id, icon: Icon, title, body }) => (
    <button onClick={() => setRole(id)} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-transparent bg-white p-5 text-start shadow-sm transition hover:border-forest active:scale-[.99]">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest text-cream"><Icon size={28} /></span>
      <span className="flex-1"><span className="block text-lg font-semibold">{title}</span><span className="text-sm text-ink/55">{body}</span></span>
    </button>
  );
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-2">
      <div className="staff-lines relative hidden flex-col justify-between bg-forest-deep p-12 text-cream lg:flex">
        <Wordmark light className="h-12 w-auto self-start" />
        <Coffee size={260} weight="thin" className="mx-auto opacity-90" aria-hidden="true" />
        <p className="max-w-sm text-sm text-cream/60">{t('Staff-only area. Customers use the ordering app — this portal is not linked from it.', 'منطقة للموظفين فقط. العملاء يستخدمون تطبيق الطلب — والبوابة غير مرتبطة فيه.')}</p>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <PortalLabel />
            <button onClick={() => setLang(ar ? 'en' : 'ar')} className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-sm"><Globe size={16} />{ar ? 'English' : 'العربية'}</button>
          </div>
          <h1 className="mt-6 text-3xl font-semibold">{t('Welcome back', 'أهلًا بعودتك')}</h1>
          <p className="mt-1 text-ink/60">{t('Choose how you’re signing in', 'اختر نوع الدخول')}</p>
          <div className="mt-8 space-y-3">
            <Card id="staff" icon={Coffee} title={t('Staff / Barista', 'موظف / باريستا')} body={t('Live orders, item availability, branch status', 'الطلبات المباشرة، توفر الأصناف، حالة الفروع')} />
            <Card id="admin" icon={ShieldCheck} title={t('Admin / Manager', 'مدير / إدارة')} body={t('Everything: menu editing, reports, offers, loyalty, customers, notifications, staff', 'كل شيء: تعديل المنيو، التقارير، العروض، الولاء، العملاء، الإشعارات، الموظفين')} />
          </div>
          <p className="mt-6 flex gap-2 rounded-xl bg-paper-2 p-3 text-xs leading-relaxed text-ink/60">
            <Info size={16} className="mt-0.5 shrink-0" />
            {t('Demo sign-in — no passwords are used or stored. The real portal would use individual staff accounts with secure login.', 'دخول تجريبي — بدون كلمات مرور. البوابة الفعلية ستستخدم حسابات موظفين بدخول آمن.')}
          </p>
        </div>
      </div>
    </div>
  );
}
