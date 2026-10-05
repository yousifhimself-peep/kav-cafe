import { useState } from 'react';
import { useStore } from '../store';
import { branches } from '../data/branches';
import { todayKey } from '../lib/dates';
import { Card } from '../components/ui';
import { PageHeader } from './AdminLayout';
import { useSummary, DayPicker } from './shared';
import { BranchTile } from './Overview';

export default function Branches() {
  const { t } = useStore();
  const summary = useSummary();
  const [date, setDate] = useState(todayKey());
  const rows = branches.map((b) => ({ b, s: summary(date, b.id) }));

  return (
    <div className="fade-up">
      <PageHeader title={t('Branches', 'الفروع')} sub={t(`${branches.length} branches · pick a day to see its counts`, `${branches.length} فرع · اختر اليوم لعرض الجرد`)} />
      <DayPicker value={date} onChange={setDate} />
      <Card className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map(({ b, s }) => <BranchTile key={b.id} b={b} s={s} date={date} />)}
        </div>
      </Card>
    </div>
  );
}
