import { useMemo, useRef, useState } from 'react';
import { useStore, cellLabel, EDIT_WINDOW_MIN } from '../store';
import { go } from '../router';
import { countKeys, GROUPS, LEVELS, UNITS } from '../data/items';
import { branchById } from '../data/branches';
import { todayKey, fmtDate, fmtTime, addDays, dateKey } from '../lib/dates';
import { Dot, useFormat, DemoNote } from '../components/ui';
import { ArrowRight, MagnifyingGlass, Minus, Plus, User, LockSimple, PaperPlaneTilt, X, Warning } from '@phosphor-icons/react';

export default function CountForm({ branchId }) {
  const { t, ar, counts, saveCount, status } = useStore();
  const branch = branchById[branchId];
  const today = todayKey();
  const existing = counts[today]?.[branchId];
  const locked = existing && Date.now() - existing.at > EDIT_WINDOW_MIN * 60000;

  const [values, setValues] = useState(() => ({ ...(existing?.values || {}) }));
  const [by, setBy] = useState(existing?.by || '');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [review, setReview] = useState(false);
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef(null);

  // Most recent earlier count for this branch, shown as a hint next to each item.
  const previous = useMemo(() => {
    for (let i = 1; i <= 14; i++) {
      const c = counts[dateKey(addDays(new Date(), -i))]?.[branchId];
      if (c) return c.values;
    }
    return {};
  }, [counts, branchId]);

  if (!branch) { go(''); return null; }

  const filled = countKeys.filter(({ key }) => values[key] != null && values[key] !== '').length;
  const shown = countKeys.filter(({ item, variant }) =>
    (tab === 'all' || (tab === 'todo' ? values[variant ? `${item.id}:${variant.id}` : item.id] == null : item.group === tab)) &&
    (item.en + ' ' + item.ar).toLowerCase().includes(q.trim().toLowerCase()));

  const set = (key, v) => setValues((old) => ({ ...old, [key]: v }));

  const openReview = () => {
    if (!by.trim()) { setNameError(true); nameRef.current?.focus(); nameRef.current?.scrollIntoView({ block: 'center' }); return; }
    setReview(true);
  };
  const send = () => {
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v != null));
    saveCount(today, branchId, clean, by.trim());
    go('done/' + branchId);
  };

  return (
    <div className="min-h-dvh pb-32">
      {/* Header: branch name large, so nobody counts into the wrong branch. */}
      <header className="sticky top-0 z-20 bg-ink text-paper shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-3 pt-3">
          <button onClick={() => go('')} aria-label={t('Back to branches', 'رجوع للفروع')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper/10"><ArrowRight size={20} className="ltr:rotate-180" /></button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-paper/55">{t('Counting branch', 'تجرد فرع')} · {fmtDate(today, ar)}</p>
            <h1 className="truncate text-xl font-bold">{t(branch.en, branch.ar)}</h1>
          </div>
          <span className="num shrink-0 rounded-full bg-paper/10 px-3 py-1.5 text-sm font-semibold">{filled}/{countKeys.length}</span>
        </div>
        <div className="h-1 bg-paper/10"><div className="h-full bg-sand transition-all" style={{ width: `${(filled / countKeys.length) * 100}%` }} /></div>
      </header>

      <main className="mx-auto max-w-2xl px-4">
        {locked ? (
          <div className="mt-4 flex gap-3 rounded-2xl bg-warn-soft p-4 text-sm text-warn">
            <LockSimple size={22} weight="fill" className="shrink-0" />
            <p>
              <b className="block">{t('Already sent today', 'تم إرسال جرد اليوم')}</b>
              {t(`Sent by ${existing.by} at ${fmtTime(existing.at, false)}. Staff can edit for ${EDIT_WINDOW_MIN} minutes after sending — after that, only management can change it.`,
                `أرسله ${existing.by} الساعة ${fmtTime(existing.at, true)}. يقدر الموظف يعدّل خلال ${EDIT_WINDOW_MIN} دقيقة من الإرسال، وبعدها التعديل من الإدارة فقط.`)}
            </p>
          </div>
        ) : existing ? (
          <p className="mt-4 rounded-2xl bg-ok-soft p-3 text-sm text-ok">
            {t(`Editing today's count — you can still change it until ${fmtTime(existing.at + EDIT_WINDOW_MIN * 60000, false)}.`, `تعديل جرد اليوم — متاح حتى ${fmtTime(existing.at + EDIT_WINDOW_MIN * 60000, true)}.`)}
          </p>
        ) : null}

        {/* Who is counting — required, since the password is shared. */}
        <label className="mt-4 block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><User size={16} />{t('Your name', 'اسم الموظف')}<span className="text-bad">*</span></span>
          <input ref={nameRef} value={by} disabled={locked} onChange={(e) => { setBy(e.target.value); setNameError(false); }} placeholder={t('e.g. Mohammed', 'مثال: محمد')}
            aria-invalid={nameError} className={'h-12 w-full rounded-xl bg-card px-4 text-[16px] shadow-sm outline-none ring-1 focus:ring-2 disabled:opacity-60 ' + (nameError ? 'ring-bad' : 'ring-ink/10 focus:ring-coffee/50')} />
          {nameError && <span role="alert" className="mt-1 block text-xs text-bad">{t('Please write your name before sending.', 'اكتب اسمك قبل الإرسال.')}</span>}
        </label>

        <div className="sticky top-[76px] z-10 -mx-4 mt-4 bg-paper/95 px-4 pb-3 pt-2 backdrop-blur">
          <label className="flex h-11 items-center gap-2 rounded-xl bg-card px-3 shadow-sm ring-1 ring-ink/5">
            <MagnifyingGlass size={17} className="text-coffee" />
            <span className="sr-only">{t('Search items', 'ابحث عن صنف')}</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search items', 'ابحث عن صنف')} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink/40" />
          </label>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto" role="tablist">
            {[['all', t('All', 'الكل')], ...GROUPS.map((g) => [g.id, t(g.en, g.ar)]), ['todo', t(`Not filled (${countKeys.length - filled})`, `المتبقي (${countKeys.length - filled})`)]].map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={'h-9 shrink-0 rounded-full px-4 text-sm font-medium transition ' + (tab === id ? 'bg-ink text-paper' : 'bg-card text-ink/65 ring-1 ring-ink/5')}>{label}</button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {shown.map((cell) => (
            <Row key={cell.key} cell={cell} value={values[cell.key]} prev={previous[cell.key]} disabled={locked}
              onChange={(v) => set(cell.key, v)} s={status(cell.item, values[cell.key])} />
          ))}
          {!shown.length && <li className="py-12 text-center text-sm text-ink/50">{tab === 'todo' ? t('Everything is filled in 👍', 'كل الأصناف معبّاة 👍') : t('No items match.', 'ما فيه أصناف مطابقة.')}</li>}
        </ul>

        <DemoNote className="mt-6">{t('Demo: saved only in this browser. Items and minimums come from your paper count sheet.', 'نسخة تجريبية: البيانات تُحفظ في هذا المتصفح فقط. الأصناف والحد الأدنى مأخوذة من ورقة الجرد الحالية.')}</DemoNote>
      </main>

      {!locked && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/5 bg-paper/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur">
          <button onClick={openReview} className="mx-auto flex h-14 w-full max-w-2xl items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-paper shadow-lg active:scale-[.99]">
            <PaperPlaneTilt size={20} weight="fill" className="rtl:-scale-x-100" />{t('Review & send', 'مراجعة وإرسال')}
          </button>
        </div>
      )}

      {review && <Review branch={branch} by={by} values={values} filled={filled} onClose={() => setReview(false)} onSend={send} />}
    </div>
  );
}

function Row({ cell, value, prev, onChange, disabled, s }) {
  const { t, minOf } = useStore();
  const f = useFormat();
  const { item, variant } = cell;
  const min = minOf(item);
  return (
    <li className={'rounded-2xl bg-card p-3.5 shadow-sm ring-1 ring-ink/5 ' + (disabled ? 'opacity-70' : '')}>
      <div className="flex items-start gap-2">
        <Dot s={s} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{cellLabel(cell, t)}</p>
          <p className="mt-0.5 text-xs text-ink/45">
            {t(`Min ${f.min(item, min)}`, `الحد الأدنى: ${f.min(item, min)}`)}
            {prev != null && <> · {t(`Last: ${f.value(item, prev)}`, `آخر جرد: ${f.value(item, prev)}`)}</>}
          </p>
        </div>
      </div>
      <div className="mt-3">
        {item.unit === 'level'
          ? <LevelInput value={value} onChange={onChange} disabled={disabled} />
          : <NumberInput item={item} value={value} onChange={onChange} disabled={disabled} label={cellLabel(cell, t)} />}
      </div>
    </li>
  );
}

function NumberInput({ item, value, onChange, disabled, label }) {
  const { t, minOf } = useStore();
  const min = minOf(item);
  const step = item.unit === 'kg' ? (min != null && min < 2 ? 0.1 : 0.5) : 1;
  const bump = (d) => {
    const next = Math.max(0, Math.round(((Number(value) || 0) + d * step) * 100) / 100);
    onChange(next);
  };
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => bump(-1)} disabled={disabled || !value} aria-label={t('Decrease', 'إنقاص')} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paper-2 text-ink active:scale-95 disabled:opacity-40"><Minus size={18} weight="bold" /></button>
      <label className="flex h-12 min-w-0 flex-1 items-center rounded-xl bg-paper px-3 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-coffee/50">
        <span className="sr-only">{label}</span>
        <input type="number" inputMode="decimal" step={step} min="0" disabled={disabled} value={value ?? ''} placeholder="0"
          onChange={(e) => onChange(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
          className="num min-w-0 flex-1 bg-transparent text-center text-xl font-semibold outline-none placeholder:text-ink/25" />
        <span className="shrink-0 text-sm text-ink/50">{t(UNITS[item.unit].en, UNITS[item.unit].ar)}</span>
      </label>
      <button type="button" onClick={() => bump(1)} disabled={disabled} aria-label={t('Increase', 'زيادة')} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-paper active:scale-95 disabled:opacity-40"><Plus size={18} weight="bold" /></button>
    </div>
  );
}

function LevelInput({ value, onChange, disabled }) {
  const { t } = useStore();
  const tone = { 'L.T': 'bg-bad text-white', 'H.F': 'bg-warn text-white', 'F.L': 'bg-ok text-white' };
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup">
      {LEVELS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={value === l.id} disabled={disabled} onClick={() => onChange(l.id)}
          className={'h-12 rounded-xl text-[15px] font-semibold transition active:scale-95 ' + (value === l.id ? tone[l.id] : 'bg-paper-2 text-ink/70')}>
          {t(l.en, l.ar)} <span className="num text-[10px] opacity-60">{l.id}</span>
        </button>
      ))}
    </div>
  );
}

function Review({ branch, by, values, filled, onClose, onSend }) {
  const { t, status } = useStore();
  const f = useFormat();
  const low = countKeys.filter(({ key, item }) => status(item, values[key]) === 'bad');
  const missing = countKeys.length - filled;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={t('Confirm and send', 'تأكيد وإرسال')}>
      <div className="fade-up max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-5 sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <p className="text-sm text-ink/55">{t('You are sending the count for', 'أنت ترسل جرد فرع')}</p>
          <button onClick={onClose} aria-label={t('Close', 'إغلاق')} className="grid h-9 w-9 place-items-center rounded-full bg-paper-2"><X size={16} /></button>
        </div>
        <h2 className="mt-1 rounded-2xl bg-ink p-4 text-center text-2xl font-bold text-paper">{t(branch.en, branch.ar)}</h2>
        <p className="mt-2 text-center text-sm text-ink/60">{t('Make sure this is your branch.', 'تأكد إن هذا فرعك قبل الإرسال.')}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-card p-3 ring-1 ring-ink/5"><dt className="text-[11px] text-ink/50">{t('Counted by', 'الموظف')}</dt><dd className="mt-0.5 truncate font-semibold">{by}</dd></div>
          <div className="rounded-xl bg-card p-3 ring-1 ring-ink/5"><dt className="text-[11px] text-ink/50">{t('Items filled', 'الأصناف')}</dt><dd className="num mt-0.5 font-semibold">{filled}/{countKeys.length}</dd></div>
          <div className="rounded-xl bg-bad-soft p-3"><dt className="text-[11px] text-bad/80">{t('At minimum', 'عند الحد الأدنى')}</dt><dd className="num mt-0.5 font-semibold text-bad">{low.length}</dd></div>
        </dl>

        {missing > 0 && (
          <p className="mt-3 flex gap-2 rounded-xl bg-warn-soft p-3 text-sm text-warn"><Warning size={18} className="shrink-0" />
            {t(`${missing} items are empty. You can still send, or go back and fill them.`, `${missing} صنف بدون كمية. تقدر ترسل، أو ترجع وتعبّيها.`)}</p>
        )}
        {low.length > 0 && (
          <div className="mt-3 rounded-xl bg-card p-3 ring-1 ring-ink/5">
            <p className="mb-2 text-xs font-semibold text-ink/60">{t('At or below minimum', 'عند الحد الأدنى أو أقل')}</p>
            <ul className="flex flex-wrap gap-1.5">{low.map((c) => <li key={c.key} className="rounded-full bg-bad-soft px-2.5 py-1 text-xs text-bad">{cellLabel(c, t)} · {f.value(c.item, values[c.key])}</li>)}</ul>
          </div>
        )}

        <div className="mt-5 grid grid-cols-[1fr_2fr] gap-2">
          <button onClick={onClose} className="h-13 rounded-2xl bg-paper-2 py-3.5 font-semibold">{t('Back', 'رجوع')}</button>
          <button onClick={onSend} className="h-13 rounded-2xl bg-ink py-3.5 font-semibold text-paper">{t('Confirm & send', 'تأكيد الإرسال')}</button>
        </div>
      </div>
    </div>
  );
}
