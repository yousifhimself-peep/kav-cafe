import { useState } from 'react';
import { useStore, DEMO } from '../store';
import { go } from '../router';
import { Wordmark, LangToggle } from '../components/ui';
import { LockKey, ArrowLeft, ChartBar } from '@phosphor-icons/react';

export default function StaffLogin() {
  const { t, loginStaff } = useStore();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (loginStaff(pw)) go('');
    else { setError(true); setPw(''); }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-paper">
      <div className="flex justify-end p-4"><LangToggle light /></div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 pb-10">
        <Wordmark light size="lg" />
        <form onSubmit={submit} className="fade-up mt-14">
          <h1 className="text-center text-xl font-semibold">{t('Daily stock count', 'الجرد اليومي')}</h1>
          <p className="mt-1 text-center text-sm text-paper/60">{t('Enter the staff password to start', 'اكتب كلمة المرور الموحدة للموظفين')}</p>
          <label className="mt-6 flex h-14 items-center gap-3 rounded-2xl bg-paper px-4 text-ink focus-within:ring-4 focus-within:ring-sand/40">
            <LockKey size={22} className="shrink-0 text-coffee" />
            <span className="sr-only">{t('Password', 'كلمة المرور')}</span>
            <input value={pw} onChange={(e) => { setPw(e.target.value); setError(false); }} type="password" inputMode="numeric" autoComplete="off" autoFocus
              placeholder={t('Password', 'كلمة المرور')} className="num min-w-0 flex-1 bg-transparent text-lg tracking-[0.3em] outline-none placeholder:tracking-normal placeholder:text-ink/40" />
          </label>
          {error && <p role="alert" className="mt-2 text-center text-sm text-[#ffb4a8]">{t('Wrong password — try again.', 'كلمة المرور غير صحيحة، حاول مرة ثانية.')}</p>}
          <button className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sand text-[17px] font-semibold text-ink active:scale-[.98]">
            {t('Continue', 'دخول')}<ArrowLeft size={20} className="ltr:rotate-180" />
          </button>
          <p className="mt-6 rounded-xl bg-paper/10 p-3 text-center text-xs text-paper/70">
            {t('Demo password: ', 'كلمة المرور التجريبية: ')}<b className="num text-paper">{DEMO.staffPassword}</b>
          </p>
        </form>
      </div>
      <a href="#/admin" className="mx-auto mb-6 flex items-center gap-1.5 text-xs text-paper/40 hover:text-paper/70">
        <ChartBar size={14} />{t('Management dashboard', 'لوحة الإدارة')}
      </a>
    </div>
  );
}
