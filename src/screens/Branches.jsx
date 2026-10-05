import { useStore } from '../store';
import { go } from '../router';
import { cafe, branches } from '../data/menu';
import { TopBar } from '../components/ui';
import { Car, MapPin, Clock, NavigationArrow, InstagramLogo } from '../components/icons';
import { openStatus, statusText, mapsLink } from '../shared/hours';

// Own screen (bottom-bar tab), like the website's Branches page.
export default function Branches() {
  const { t, ar, branch, mode, setBranch, setMode, setToast } = useStore();
  const choose = (b) => {
    setBranch(b.id); setMode('pickup');
    setToast(t('Ordering from ' + b.en, 'الطلب من ' + b.ar));
    go('menu');
  };
  return (
    <div className="min-h-full pb-32">
      <TopBar title={t('Branches', 'الفروع')} right={<span className="text-xs text-ink/50">{t(cafe.city.en, cafe.city.ar)}</span>} />
      <ul className="space-y-3 px-4">
        {branches.map((b) => {
          const s = openStatus(b);
          const on = mode === 'pickup' && branch.id === b.id;
          return (
            <li key={b.id} className={'rounded-3xl bg-white p-4 shadow-sm ring-2 ' + (on ? 'ring-forest' : 'ring-transparent')}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-wine">{b.drive ? <Car size={20} /> : <MapPin size={20} />}</span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold leading-snug">{t(b.en, b.ar)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/60">
                    <span className={'h-1.5 w-1.5 rounded-full ' + (s.isOpen ? 'bg-leaf' : 'bg-wine')} />
                    {s.isOpen ? t('Open', 'مفتوح') : t('Closed', 'مغلق')} · {statusText(s, t, ar)}
                  </p>
                </div>
              </div>
              <dl className="mt-3 space-y-1 text-[13px]">
                {b.lines.map((l) => (
                  <div key={l[0]} className="flex justify-between gap-3"><dt className="flex items-center gap-1.5 text-ink/55"><Clock size={13} />{t(l[0], l[1])}</dt><dd className="font-medium">{t(l[2], l[3])}</dd></div>
                ))}
              </dl>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <button onClick={() => choose(b)} className={'h-11 rounded-xl text-sm font-semibold ' + (on ? 'bg-forest/10 text-forest' : 'bg-forest text-cream')}>{on ? t('Ordering from here ✓', 'تطلب من هنا ✓') : t('Order from here', 'اطلب من هنا')}</button>
                <a href={mapsLink(b)} target="_blank" rel="noreferrer" aria-label={t('Directions', 'الاتجاهات')} className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-forest"><NavigationArrow size={18} weight="fill" className="rtl:-scale-x-100" /></a>
              </div>
            </li>
          );
        })}
      </ul>
      <a href={cafe.instagram} target="_blank" rel="noreferrer" className="mx-4 mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-forest shadow-sm"><InstagramLogo size={18} />@kav.cafe</a>
    </div>
  );
}
