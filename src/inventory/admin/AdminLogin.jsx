import { useState } from 'react';
import { useStore, DEMO } from '../store';
import { go } from '../router';
import { Wordmark, LangToggle } from '../components/ui';
import { ShieldCheck, ArrowLeft } from '@phosphor-icons/react';

export default function AdminLogin() {
  const { t, loginManager } = useStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (loginManager(user, pass)) go('admin/overview');
    else setError(true);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <Wordmark light size="md" />
        <div>
          <p className="text-4xl font-light leading-snug">{t('Every branch’s stock,', 'جرد كل الفروع')}<br /><b className="font-bold">{t('on one screen.', 'في شاشة وحدة.')}</b></p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">{t('Management only. Staff enter counts from the staff page and cannot see this dashboard.', 'للإدارة فقط. الموظفين يسجلون الجرد من صفحتهم وما يقدرون يشوفون لوحة التحكم.')}</p>
        </div>
        <a href="#/" className="text-xs text-paper/40 hover:text-paper/70">{t('← Staff count page', 'صفحة جرد الموظفين ←')}</a>
      </div>

      <div className="flex flex-col p-6">
        <div className="flex justify-end"><LangToggle /></div>
        <form onSubmit={submit} className="fade-up mx-auto my-auto w-full max-w-sm py-10">
          <div className="mb-8 lg:hidden"><Wordmark size="md" /></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coffee/10 px-3 py-1 text-xs font-semibold text-coffee"><ShieldCheck size={14} weight="fill" />{t('Management dashboard', 'لوحة الإدارة')}</span>
          <h1 className="mt-4 text-3xl font-bold">{t('Sign in', 'تسجيل الدخول')}</h1>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-sm font-medium">{t('Username', 'اسم المستخدم')}</span>
            <input value={user} onChange={(e) => { setUser(e.target.value); setError(false); }} autoComplete="off" autoCapitalize="none" dir="ltr"
              className="h-12 w-full rounded-xl bg-card px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-coffee/50" />
          </label>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-medium">{t('Password', 'كلمة المرور')}</span>
            <input value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }} type="password" autoComplete="off" dir="ltr"
              className="h-12 w-full rounded-xl bg-card px-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-coffee/50" />
          </label>
          {error && <p role="alert" className="mt-2 text-sm text-bad">{t('Username or password is wrong.', 'اسم المستخدم أو كلمة المرور غير صحيحة.')}</p>}
          <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink font-semibold text-paper active:scale-[.99]">{t('Sign in', 'دخول')}<ArrowLeft size={18} className="ltr:rotate-180" /></button>
          <p className="mt-5 rounded-xl bg-paper-2 p-3 text-center text-xs text-ink/60">
            {t('Demo login: ', 'دخول تجريبي: ')}<b dir="ltr" className="num">{DEMO.manager.user} / {DEMO.manager.pass}</b>
          </p>
        </form>
      </div>
    </div>
  );
}
