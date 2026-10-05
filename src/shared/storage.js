// localStorage shared by the customer app and the Admin / Staff Portal (same origin).
// Demo only: a real build would replace this with a backend + realtime updates.
import { useEffect, useState } from 'react';

export const KEYS = {
  orders: 'kav-orders',             // orders placed in the customer app (+ `status` set by staff)
  availability: 'kav-availability', // { [productId]: false } for sold-out items
  store: 'kav-store',               // { paused: boolean, prep: 'normal' | 'busy' | 'very-busy' }
};

export const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent('kav-storage', { detail: key })); // same-tab listeners
};

// State bound to a localStorage key; stays in sync across tabs (customer ↔ staff).
export function useShared(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));
  useEffect(() => {
    const sync = (e) => {
      const k = e.type === 'storage' ? e.key : e.detail;
      if (k === key || k === null) setValue(read(key, fallback));
    };
    window.addEventListener('storage', sync);
    window.addEventListener('kav-storage', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('kav-storage', sync); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (next) => {
    const v = typeof next === 'function' ? next(read(key, fallback)) : next;
    write(key, v);
    setValue(v);
  };
  return [value, set];
}

export const prepEstimates = {
  normal: { en: 'About 10–15 min', ar: 'تقريبًا ١٠–١٥ دقيقة' },
  busy: { en: 'About 20–30 min', ar: 'تقريبًا ٢٠–٣٠ دقيقة' },
  'very-busy': { en: 'About 30–45 min', ar: 'تقريبًا ٣٠–٤٥ دقيقة' },
};

// Admin-managed content shared with both customer apps (phone demo + full-screen site).
export const CONTENT = {
  catalog: 'kav-catalog', // { edits: { [id]: fields }, added: [item], removed: [id] } — see shared/catalog.js
  promos: 'kav-promos',   // { banner: { on, en, ar }, codes: [{ code, type: 'percent' | 'amount', value, on, uses }] }
  loyalty: 'kav-loyalty', // { on, stamps, reward: { en, ar } }
  push: 'kav-push',       // [{ id, en, ar, at }] newest first — "push notifications" sent from the portal
  staff: 'kav-staff',     // staff list edited in the portal
};

export const defaultPromos = {
  banner: { on: true, en: 'Order ahead and skip the line at every Kav branch 🤎 Use KAV10 for 10% off', ar: 'اطلب مسبقًا وتخطَّ الانتظار في كل فروع كاف 🤎 استخدم KAV10 لخصم ١٠٪' },
  codes: [
    { code: 'KAV10', type: 'percent', value: 10, on: true, uses: 37, en: '10% off any order', ar: 'خصم ١٠٪ على أي طلب' },
    { code: 'WELCOME', type: 'amount', value: 5, on: true, uses: 12, en: '5 SAR off your first order', ar: 'خصم ٥ ريال على أول طلب' },
    { code: 'COFFEEDAY', type: 'percent', value: 100, on: false, uses: 214, en: 'World Coffee Day — coffee on us (ended)', ar: 'اليوم العالمي للقهوة — قهوتك علينا (انتهى)' },
  ],
};

export const defaultLoyalty = { on: true, stamps: 8, reward: { en: 'A free drink of your choice', ar: 'مشروب مجاني من اختيارك' } };

// Discount for a promo code on a subtotal (0 if unknown or switched off).
export function promoDiscount(promos, code, subtotal) {
  const c = (promos?.codes || []).find((x) => x.on && x.code.toUpperCase() === String(code || '').trim().toUpperCase());
  if (!c) return { promo: null, discount: 0 };
  const discount = c.type === 'percent' ? Math.round(subtotal * c.value) / 100 : Math.min(subtotal, c.value);
  return { promo: c, discount: Math.round(discount * 100) / 100 };
}
