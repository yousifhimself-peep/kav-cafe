import { useStore, EDIT_WINDOW_MIN } from '../store';
import { go } from '../router';
import { branchById } from '../data/branches';
import { countKeys } from '../data/items';
import { todayKey, fmtTime } from '../lib/dates';
import { Check, PencilSimple, Storefront } from '@phosphor-icons/react';

export default function Done({ branchId }) {
  const { t, counts, status } = useStore();
  const branch = branchById[branchId];
  const c = counts[todayKey()]?.[branchId];
  if (!branch || !c) { go(''); return null; }
  const low = countKeys.filter(({ key, item }) => status(item, c.values[key]) === 'bad').length;
  const canEdit = Date.now() - c.at < EDIT_WINDOW_MIN * 60000;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <span className="pop grid h-24 w-24 place-items-center rounded-full bg-sand text-ink"><Check size={48} weight="bold" /></span>
      <h1 className="fade-up mt-8 text-2xl font-bold">{t('Count sent', 'تم إرسال الجرد')}</h1>
      <p className="fade-up mt-2 text-lg">{t(branch.en, branch.ar)}</p>
      <p className="fade-up mt-1 text-sm text-paper/60">{t(`by ${c.by} · ${fmtTime(c.editedAt || c.at, false)}`, `بواسطة ${c.by} · ${fmtTime(c.editedAt || c.at, true)}`)}</p>
      {low > 0 && <p className="fade-up mt-4 rounded-full bg-paper/10 px-4 py-2 text-sm">{t(`${low} items at minimum — management has been notified`, `${low} صنف عند الحد الأدنى — ظهرت للإدارة`)}</p>}

      <div className="mt-10 flex w-full max-w-xs flex-col gap-2">
        {canEdit && (
          <button onClick={() => go('count/' + branchId)} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-paper/10 py-3.5 font-semibold">
            <PencilSimple size={18} />{t(`Edit (within ${EDIT_WINDOW_MIN} min)`, `تعديل (خلال ${EDIT_WINDOW_MIN} دقيقة)`)}
          </button>
        )}
        <button onClick={() => go('')} className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-sand py-3.5 font-semibold text-ink">
          <Storefront size={18} />{t('Back to branches', 'رجوع للفروع')}
        </button>
      </div>
    </div>
  );
}
