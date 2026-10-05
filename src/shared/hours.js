// Open / closed for a branch, from the hours in Kav's "أوقات العمل" highlight (src/data/menu.js → branches).

export const fmtHour = (h, ar) => {
  const hr = h % 12 || 12;
  const pm = h % 24 >= 12;
  return ar ? `${hr} ${pm ? 'م' : 'ص'}` : `${hr} ${pm ? 'PM' : 'AM'}`;
};

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

import { read, KEYS } from './storage';

export function openStatus(branch, now = new Date()) {
  if (read(KEYS.store, {}).closedBranches?.[branch.id]) return { isOpen: false, open: null, closedToday: true };
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const today = branch.hours(day);
  if (today && h >= today.open && h < today.close) {
    const tomorrow = branch.hours((day + 1) % 7);
    // "24 hours" only when it runs straight on into tomorrow.
    return { isOpen: true, close: today.close, allDay: today.close === 24 && tomorrow?.open === 0 };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const hrs = branch.hours(d);
    if (hrs && (i > 0 || hrs.open > h)) return { isOpen: false, open: hrs.open, inDays: i, day: d };
  }
  return { isOpen: false, open: null };
}

// "until 12 AM" / "open 24 hours" / "opens 7 AM" / "opens tomorrow 12 PM" / "opens Sun 7 AM"
export function statusText(s, t, ar) {
  if (s.isOpen) return s.allDay ? t('24 hours', '٢٤ ساعة') : t(`until ${fmtHour(s.close, false)}`, `حتى ${fmtHour(s.close, true)}`);
  if (s.closedToday) return t('temporarily closed', 'مغلق مؤقتًا');
  if (s.open == null) return '';
  const when = s.inDays === 0 ? '' : s.inDays === 1 ? t('tomorrow ', 'بكرة ') : (ar ? dayNames.ar : dayNames.en)[s.day] + ' ';
  return t(`opens ${when}${fmtHour(s.open, false)}`, `يفتح ${when}${fmtHour(s.open, true)}`);
}

// Next pickup times in 15-minute steps, only while the branch is open.
export function pickupSlots(branch, now = new Date()) {
  const d = new Date(now);
  d.setMinutes(Math.ceil((d.getMinutes() + 20) / 15) * 15, 0, 0);
  const slots = [];
  for (let i = 0; i < 7 * 96 && slots.length < 6; i++, d.setMinutes(d.getMinutes() + 15)) {
    if (openStatus(branch, d).isOpen) slots.push(new Date(d));
  }
  return slots;
}

export const mapsLink = (branch) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('كاف كافيه ' + branch.ar.replace(' · ', ' '));
