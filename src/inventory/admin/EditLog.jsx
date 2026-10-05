import { useStore } from '../store';
import { branchById } from '../data/branches';
import { countKeys } from '../data/items';
import { fmtDate, fmtTime } from '../lib/dates';
import { Card, useFormat } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { PaperPlaneTilt, PencilSimple, Trash, ArrowLeft } from '@phosphor-icons/react';
import { cellLabel } from '../store';

const ACTIONS = {
  submit: { icon: PaperPlaneTilt, en: 'sent the count', ar: 'أرسل الجرد', tone: 'bg-ok-soft text-ok' },
  edit: { icon: PencilSimple, en: 'edited the count', ar: 'عدّل الجرد', tone: 'bg-warn-soft text-warn' },
  delete: { icon: Trash, en: 'deleted the count', ar: 'حذف الجرد', tone: 'bg-bad-soft text-bad' },
};

// Every submit, edit and delete — who, when, which branch and exactly what changed.
export default function EditLog() {
  const { t, ar, log } = useStore();
  const f = useFormat();
  const cellOf = (key) => countKeys.find((c) => c.key === key);

  return (
    <div className="fade-up">
      <PageHeader title={t('Edit log', 'سجل التعديلات')} sub={t('Every count sent, edited or deleted — with who did it and what changed.', 'كل جرد تم إرساله أو تعديله أو حذفه — مين سوّاه وش تغيّر.')} />
      <Card>
        <ol className="divide-y divide-ink/5">
          {log.slice(0, 150).map((e, i) => {
            const A = ACTIONS[e.action];
            const b = branchById[e.branch];
            return (
              <li key={i} className="flex gap-3 py-3">
                <span className={'grid h-9 w-9 shrink-0 place-items-center rounded-xl ' + A.tone}><A.icon size={17} weight="fill" /></span>
                <div className="min-w-0 flex-1 text-sm">
                  <p>
                    <b>{e.by}</b>{e.role === 'manager' && <span className="mx-1 rounded bg-coffee/10 px-1.5 py-0.5 text-[10px] font-semibold text-coffee">{t('Manager', 'إدارة')}</span>}
                    {' '}{t(A.en, A.ar)} · <a href={`#/admin/branch/${e.branch}?d=${e.date}`} className="font-medium underline-offset-2 hover:underline">{b ? t(b.en, b.ar) : e.branch}</a>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/45">{fmtDate(e.date, ar)} · {fmtTime(e.at, ar)}</p>
                  {e.changes.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {e.changes.slice(0, 12).map((c) => {
                        const cell = cellOf(c.key);
                        if (!cell) return null;
                        return (
                          <li key={c.key} className="flex items-center gap-1 rounded-lg bg-paper-2 px-2 py-1 text-xs">
                            <span className="font-medium">{cellLabel(cell, t)}:</span>
                            <span className="num text-ink/50 line-through">{f.value(cell.item, c.from)}</span>
                            <ArrowLeft size={11} className="ltr:rotate-180" />
                            <span className="num font-semibold">{f.value(cell.item, c.to)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
          {!log.length && <li className="py-10 text-center text-sm text-ink/50">{t('Nothing yet.', 'لا يوجد شيء بعد.')}</li>}
        </ol>
      </Card>
    </div>
  );
}
