import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { go } from '../router';
import { branches } from '../data/branches';
import { todayKey, fmtDate, fmtTime } from '../lib/dates';
import { Wordmark, LangToggle } from '../components/ui';
import { MagnifyingGlass, Storefront, CheckCircle, CaretLeft, SignOut } from '@phosphor-icons/react';

export default function BranchPicker() {
  const { t, ar, counts, logoutStaff } = useStore();
  const [q, setQ] = useState('');
  const today = todayKey();
  const list = useMemo(() => branches.filter((b) => (b.ar + ' ' + b.en).toLowerCase().includes(q.trim().toLowerCase())), [q]);

  return (
    <div className="min-h-dvh">
      <header className="bg-ink px-4 pb-8 pt-4 text-paper">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button onClick={logoutStaff} className="flex h-9 items-center gap-1.5 rounded-full bg-paper/10 px-3 text-sm"><SignOut size={16} className="ltr:rotate-180" />{t('Exit', 'خروج')}</button>
          <Wordmark light size="sm" sub={false} />
          <LangToggle light />
        </div>
        <div className="mx-auto mt-6 max-w-xl">
          <p className="text-sm text-paper/60">{fmtDate(today, ar, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-2xl font-semibold">{t('Which branch are you counting?', 'أي فرع تجرد اليوم؟')}</h1>
        </div>
      </header>

      <main className="mx-auto -mt-5 max-w-xl px-4 pb-12">
        <label className="flex h-12 items-center gap-2 rounded-2xl bg-card px-4 shadow-md ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coffee/40">
          <MagnifyingGlass size={18} className="text-coffee" />
          <span className="sr-only">{t('Search branches', 'ابحث عن فرع')}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search branches', 'ابحث عن فرع')} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/40" />
        </label>

        <ul className="mt-4 space-y-2">
          {list.map((b) => {
            const done = counts[today]?.[b.id];
            return (
              <li key={b.id}>
                <button onClick={() => go('count/' + b.id)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-start shadow-sm ring-1 ring-ink/5 transition hover:ring-coffee/30 active:scale-[.99]">
                  <span className={'grid h-11 w-11 shrink-0 place-items-center rounded-xl ' + (done ? 'bg-ok-soft text-ok' : 'bg-paper-2 text-coffee')}>
                    {done ? <CheckCircle size={22} weight="fill" /> : <Storefront size={22} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold">{t(b.en, b.ar)}</span>
                    <span className={'text-xs ' + (done ? 'text-ok' : 'text-ink/45')}>
                      {done ? t(`Counted today at ${fmtTime(done.at, false)}`, `تم الجرد اليوم ${fmtTime(done.at, true)}`) : t('Not counted yet today', 'لم يُجرد اليوم')}
                    </span>
                  </span>
                  <CaretLeft size={18} className="text-ink/30 ltr:rotate-180" />
                </button>
              </li>
            );
          })}
          {!list.length && <li className="py-10 text-center text-sm text-ink/50">{t('No branch matches that.', 'ما فيه فرع بهذا الاسم.')}</li>}
        </ul>
      </main>
    </div>
  );
}
