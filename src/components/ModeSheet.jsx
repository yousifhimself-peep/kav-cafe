import { useStore } from '../store';
import { branches } from '../data/menu';
import { openStatus, statusText } from '../shared/hours';
import Sheet from './Sheet';
import { SampleTag } from './ui';
import { Storefront, Moped, Check, Car } from './icons';

export default function ModeSheet({ onClose }) {
  const { t, ar, mode, setMode, branch, setBranch } = useStore();
  const pick = (m) => { setMode(m); onClose(); };
  const pickBranch = (id) => { setBranch(id); setMode('pickup'); onClose(); };
  return (
    <Sheet onClose={onClose} label={t('How would you like it?', 'كيف تبي طلبك؟')}>
      <div className="px-5 pb-8 pt-5">
        <h2 className="text-xl font-semibold">{t('Pick up from', 'الاستلام من')}</h2>
        <p className="mb-4 text-sm text-ink/55">{t('Choose your Kav branch', 'اختر فرع كاف')}</p>
        <div className="space-y-2">
          {branches.map((b) => {
            const on = mode === 'pickup' && branch.id === b.id;
            const s = openStatus(b);
            const Icon = b.drive ? Car : Storefront;
            return (
              <button key={b.id} onClick={() => pickBranch(b.id)} aria-pressed={on}
                className={'flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-start transition ' + (on ? 'border-forest bg-forest/5' : 'border-transparent bg-white')}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-forest"><Icon size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{t(b.en, b.ar)}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55">
                    <span className={'h-1.5 w-1.5 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />
                    {s.isOpen ? t('Open', 'مفتوح') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}
                    {b.drive && <> · {t('Drive-thru', 'درايف ثرو')}</>}
                  </span>
                </span>
                {on && <Check size={20} weight="bold" className="shrink-0 text-forest" />}
              </button>
            );
          })}
        </div>

        <button onClick={() => pick('delivery')} aria-pressed={mode === 'delivery'}
          className={'mt-4 flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-start transition ' + (mode === 'delivery' ? 'border-forest bg-forest/5' : 'border-transparent bg-white')}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-forest"><Moped size={22} /></span>
          <span className="flex-1">
            <span className="flex items-center gap-2 font-semibold">{t('Delivery', 'توصيل')}<SampleTag /></span>
            <span className="mt-0.5 block text-xs text-ink/55">{t('Straight to your door', 'لباب بيتك')}</span>
          </span>
          {mode === 'delivery' && <Check size={20} weight="bold" className="text-forest" />}
        </button>
      </div>
    </Sheet>
  );
}
