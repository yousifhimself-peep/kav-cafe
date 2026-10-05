import { useState } from 'react';
import { useAdmin } from './AdminApp';
import { useShared, CONTENT } from '../shared/storage';
import { branches, branchById } from '../data/menu';
import { defaultStaff } from './data';
import { UserPlus, Trash, Check, Minus } from '@phosphor-icons/react';
import { PageHead, Card, Switch, Field, Note, inputCls, btnPrimary } from './kit';

const ROLES = {
  admin: { en: 'Owner / Admin', ar: 'المالك / مدير عام' },
  manager: { en: 'Branch manager', ar: 'مدير فرع' },
  barista: { en: 'Barista', ar: 'باريستا' },
  cashier: { en: 'Cashier', ar: 'كاشير' },
};
// What each role can do in the portal.
const PERMS = [
  [{ en: 'Live orders', ar: 'الطلبات المباشرة' }, ['admin', 'manager', 'barista', 'cashier']],
  [{ en: 'Mark items sold out', ar: 'إيقاف الأصناف' }, ['admin', 'manager', 'barista']],
  [{ en: 'Open / close a branch', ar: 'فتح / إغلاق الفرع' }, ['admin', 'manager']],
  [{ en: 'Edit menu & prices', ar: 'تعديل المنيو والأسعار' }, ['admin']],
  [{ en: 'Sales reports', ar: 'تقارير المبيعات' }, ['admin', 'manager']],
  [{ en: 'Offers, loyalty, notifications', ar: 'العروض والولاء والإشعارات' }, ['admin']],
  [{ en: 'Staff accounts', ar: 'حسابات الموظفين' }, ['admin']],
];

export default function Staff() {
  const { t } = useAdmin();
  const [staff, setStaff] = useShared(CONTENT.staff, defaultStaff);
  const [f, setF] = useState({ name: '', role: 'barista', branch: branches[0].id });
  const add = () => {
    if (!f.name.trim()) return;
    setStaff((s) => [...s, { id: 's' + Date.now(), name: f.name.trim(), role: f.role, branch: f.role === 'admin' ? 'all' : f.branch, active: true }]);
    setF((x) => ({ ...x, name: '' }));
  };
  const patch = (id, v) => setStaff((s) => s.map((x) => (x.id === id ? { ...x, ...v } : x)));

  return (
    <div>
      <PageHead title={t('Staff & roles', 'الموظفين والصلاحيات')}
        sub={t('Every team member gets their own login, tied to their branch. Roles decide what they can see and change.', 'لكل موظف دخول خاص مربوط بفرعه. والصلاحيات تحدد وش يشوف ووش يعدّل.')} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card title={t(`Team · ${staff.filter((s) => s.active).length} active`, `الفريق · ${staff.filter((s) => s.active).length} نشط`)}>
          <ul className="divide-y divide-ink/5">
            {staff.map((s) => (
              <li key={s.id} className={'flex flex-wrap items-center gap-3 py-3 ' + (s.active ? '' : 'opacity-50')}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest/10 font-semibold text-forest">{s.name.slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.name}</span>
                  <span className="text-xs text-ink/50">{s.branch === 'all' ? t('All branches', 'كل الفروع') : branchById[s.branch] ? t(branchById[s.branch].en, branchById[s.branch].ar) : '—'}</span>
                </span>
                <select value={s.role} onChange={(e) => patch(s.id, { role: e.target.value })} aria-label={t('Role', 'الدور')} className="h-9 rounded-lg border border-ink/10 bg-paper/60 px-2 text-sm">
                  {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{t(r.en, r.ar)}</option>)}
                </select>
                <Switch small on={s.active} onChange={(active) => patch(s.id, { active })} label={t('Active', 'نشط')} />
                <button onClick={() => setStaff((list) => list.filter((x) => x.id !== s.id))} aria-label={t('Remove ' + s.name, 'حذف ' + s.name)} className="grid h-8 w-8 place-items-center rounded-lg text-wine hover:bg-wine/5"><Trash size={16} /></button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('Add a team member', 'إضافة موظف')} icon={UserPlus}>
          <div className="space-y-3">
            <Field label={t('Name', 'الاسم')}><input value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && add()} className={inputCls} /></Field>
            <Field label={t('Role', 'الدور')}>
              <select value={f.role} onChange={(e) => setF((x) => ({ ...x, role: e.target.value }))} className={inputCls}>
                {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{t(r.en, r.ar)}</option>)}
              </select>
            </Field>
            {f.role !== 'admin' && (
              <Field label={t('Branch', 'الفرع')}>
                <select value={f.branch} onChange={(e) => setF((x) => ({ ...x, branch: e.target.value }))} className={inputCls}>
                  {branches.map((b) => <option key={b.id} value={b.id}>{t(b.en, b.ar)}</option>)}
                </select>
              </Field>
            )}
            <button onClick={add} disabled={!f.name.trim()} className={btnPrimary + ' w-full'}>{t('Add & send invite', 'إضافة وإرسال دعوة')}</button>
          </div>
        </Card>
      </div>

      <Card title={t('What each role can do', 'صلاحيات كل دور')} className="mt-5">
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-ink/5 text-xs text-ink/50">
              <th className="px-5 py-2 text-start font-semibold" />
              {Object.values(ROLES).map((r) => <th key={r.en} className="px-3 py-2 text-center font-semibold">{t(r.en, r.ar)}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-ink/5">
              {PERMS.map(([label, who]) => (
                <tr key={label.en}>
                  <td className="px-5 py-2.5">{t(label.en, label.ar)}</td>
                  {Object.keys(ROLES).map((r) => <td key={r} className="px-3 py-2.5 text-center">{who.includes(r) ? <Check size={16} weight="bold" className="inline text-forest" /> : <Minus size={14} className="inline text-ink/20" />}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Note>{t('Names are sample data. The demo portal has two sign-ins (Staff, Admin); the real build gives everyone their own secure login.', 'الأسماء تجريبية. بوابة التجربة فيها دخولين (موظف، مدير)؛ النسخة الفعلية تعطي كل موظف دخول آمن خاص.')}</Note>
    </div>
  );
}
