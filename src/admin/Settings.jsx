import { useState } from 'react';
import { useAdmin } from './AdminApp';
import { makeSamples } from './data';
import { prepEstimates, CONTENT, write } from '../shared/storage';
import { Pause, Play, Clock, Timer, Users, ArrowCounterClockwise, Info } from '@phosphor-icons/react';

export default function Settings() {
  const { t, ar, store, setStore, setSamples, setAvailability, setAppOrders } = useAdmin();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const paused = !!store.paused;
  const prep = store.prep || 'normal';

  const reset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    setSamples(makeSamples());
    setAvailability({});
    setStore({});
    // Menu edits, offers, loyalty rules, notifications and staff go back to the starting demo content.
    Object.values(CONTENT).forEach((key) => { try { localStorage.removeItem(key); } catch { /* ignore */ } write(key, null); });
    setAppOrders((list) => list.map(({ status, updatedAt, ...o }) => o)); // eslint-disable-line no-unused-vars
    setConfirmReset(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('Store settings', 'إعدادات المتجر')}</h1>
      <p className="mt-1 text-sm text-ink/55">{t('Changes apply to the customer app immediately.', 'التغييرات تنطبق على تطبيق العملاء فورًا.')}</p>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span className={'grid h-12 w-12 shrink-0 place-items-center rounded-xl ' + (paused ? 'bg-wine text-cream' : 'bg-forest text-cream')}>
            {paused ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
          </span>
          <div className="flex-1">
            <h2 className="font-semibold">{t('Accept online orders', 'استقبال الطلبات أونلاين')}</h2>
            <p className="text-sm text-ink/55">{paused ? t('Paused — customers can browse but not check out.', 'متوقف — العملاء يتصفحون فقط بدون طلب.') : t('On — customers can order ahead.', 'مفعّل — العملاء يقدرون يطلبون.')}</p>
          </div>
          <button role="switch" aria-checked={!paused} aria-label={t('Accept online orders', 'استقبال الطلبات أونلاين')} onClick={() => setStore((s) => ({ ...s, paused: !s.paused }))}
            className={'relative h-8 w-14 shrink-0 rounded-full transition ' + (!paused ? 'bg-forest' : 'bg-ink/20')}>
            <span className={'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ' + (!paused ? 'start-7' : 'start-1')} />
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><Timer size={20} className="text-forest" />{t('How busy are we?', 'مستوى الضغط')}</h2>
        <p className="text-sm text-ink/55">{t('Sets the pickup estimate customers see at checkout.', 'يحدد وقت الاستلام المتوقع اللي يشوفه العميل.')}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup">
          {[['normal', t('Normal', 'عادي')], ['busy', t('Busy', 'مشغول')], ['very-busy', t('Very busy', 'مشغول جدًا')]].map(([id, label]) => (
            <button key={id} role="radio" aria-checked={prep === id} onClick={() => setStore((s) => ({ ...s, prep: id }))}
              className={'rounded-xl border-2 p-3 text-start transition ' + (prep === id ? 'border-forest bg-forest/5' : 'border-ink/10 hover:bg-paper')}>
              <span className="block font-semibold">{label}</span>
              <span className="text-xs text-ink/55">{ar ? prepEstimates[id].ar : prepEstimates[id].en}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a href="#/branches" className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm hover:bg-paper-2"><Clock size={22} className="text-forest" /><span><span className="block font-semibold">{t('Branches & hours', 'الفروع والأوقات')}</span><span className="text-sm text-ink/55">{t('Open or close a branch', 'افتح أو سكّر فرع')}</span></span></a>
        <a href="#/staff" className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm hover:bg-paper-2"><Users size={22} className="text-forest" /><span><span className="block font-semibold">{t('Staff & roles', 'الموظفين والصلاحيات')}</span><span className="text-sm text-ink/55">{t('Logins and permissions', 'الدخول والصلاحيات')}</span></span></a>
      </div>

      <section className="mt-4 rounded-2xl border border-wine/15 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">{t('Demo data', 'بيانات التجربة')}</h2>
        <p className="mt-1 text-sm text-ink/55">{t('Regenerates sample orders, restocks every item, reopens branches, resumes ordering, and puts the menu, offers, loyalty, notifications and staff back to the starting demo.', 'يعيد الطلبات التجريبية، يرجّع الأصناف، يفتح الفروع، يفعّل الطلب، ويرجّع المنيو والعروض والولاء والإشعارات والموظفين للبداية.')}</p>
        <button onClick={reset} onBlur={() => setConfirmReset(false)}
          className={'mt-4 flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ' + (confirmReset ? 'bg-wine text-cream' : 'bg-paper text-wine')}>
          <ArrowCounterClockwise size={17} />{confirmReset ? t('Click again to confirm', 'اضغط مرة ثانية للتأكيد') : t('Reset demo data', 'إعادة ضبط بيانات التجربة')}
        </button>
        {resetDone && <p role="status" className="mt-2 text-sm text-forest">{t('Demo data reset.', 'تمت إعادة الضبط.')}</p>}
      </section>

      <p className="mt-4 flex gap-2 text-xs text-ink/50"><Info size={15} className="mt-px shrink-0" />{t('Demo: settings are stored in this browser only.', 'تجربة: الإعدادات محفوظة في هذا المتصفح فقط.')}</p>
    </div>
  );
}
