import { useStore } from '../store';
import { Wordmark, LangToggle } from '../components/ui';
import { SquaresFour, Storefront, ShoppingCart, ChartLine, ClockCounterClockwise, GearSix, SignOut, ClipboardText } from '@phosphor-icons/react';
import Overview from './Overview';
import Branches from './Branches';
import BranchDetail from './BranchDetail';
import Orders from './Orders';
import History from './History';
import EditLog from './EditLog';
import Settings from './Settings';

const NAV = [
  ['overview', SquaresFour, 'Today', 'اليوم'],
  ['branches', Storefront, 'Branches', 'الفروع'],
  ['orders', ShoppingCart, 'Order list', 'قائمة الطلبات'],
  ['history', ChartLine, 'History', 'السجل التاريخي'],
  ['log', ClockCounterClockwise, 'Edit log', 'سجل التعديلات'],
  ['settings', GearSix, 'Items & settings', 'الأصناف والإعدادات'],
];

export default function AdminLayout({ page, id, params }) {
  const { t, manager, logoutManager } = useStore();
  const current = page === 'branch' ? 'branches' : page;
  const Page = { overview: Overview, branches: Branches, branch: BranchDetail, orders: Orders, history: History, log: EditLog, settings: Settings }[page] || Overview;

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-ink p-5 text-paper lg:flex">
        <div className="py-2"><Wordmark light size="sm" /></div>
        <nav className="mt-8 space-y-1" aria-label={t('Dashboard', 'لوحة التحكم')}>
          {NAV.map(([key, Icon, en, ar]) => (
            <a key={key} href={'#/admin/' + key} aria-current={current === key ? 'page' : undefined}
              className={'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition ' + (current === key ? 'bg-paper font-semibold text-ink' : 'text-paper/70 hover:bg-paper/10')}>
              <Icon size={20} weight={current === key ? 'fill' : 'regular'} />{t(en, ar)}
            </a>
          ))}
        </nav>
        <a href="#/" target="_blank" rel="noreferrer" className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-paper/50 hover:bg-paper/10">
          <ClipboardText size={18} />{t('Open staff count page', 'فتح صفحة جرد الموظفين')}
        </a>
        <div className="mt-auto space-y-3 border-t border-paper/10 pt-4 text-sm">
          <p className="text-paper/60">{t('Signed in as', 'مسجل باسم')} <b className="text-paper" dir="ltr">{manager}</b></p>
          <div className="flex gap-2">
            <LangToggle light className="flex-1 justify-center" />
            <button onClick={logoutManager} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-paper/10 hover:bg-paper/20"><SignOut size={16} className="ltr:rotate-180" />{t('Sign out', 'خروج')}</button>
          </div>
        </div>
      </aside>

      {/* Phone / tablet: top bar + scrollable tabs */}
      <div className="no-print sticky top-0 z-30 bg-ink text-paper lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Wordmark light size="sm" sub={false} />
          <div className="flex gap-2"><LangToggle light /><button onClick={logoutManager} aria-label={t('Sign out', 'خروج')} className="grid h-9 w-9 place-items-center rounded-full bg-paper/10"><SignOut size={16} className="ltr:rotate-180" /></button></div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV.map(([key, Icon, en, ar]) => (
            <a key={key} href={'#/admin/' + key} className={'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm ' + (current === key ? 'bg-paper font-semibold text-ink' : 'text-paper/70')}>
              <Icon size={16} />{t(en, ar)}
            </a>
          ))}
        </nav>
      </div>

      <main className="print-full min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <Page id={id} params={params} />
      </main>
    </div>
  );
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink/55">{sub}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
