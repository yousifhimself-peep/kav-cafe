// Admin / Staff Portal data helpers.
// Real orders come from the customer app (KEYS.orders). Sample orders are generated
// so the board and reports look alive in a demo; they are always labelled "Sample".
import { menu, byId, sampleOptions, branches } from '../data/menu';
import { unitPrice } from '../store';
import { read, write } from '../shared/storage';

export const SAMPLES_KEY = 'kav-staff-samples-2';
export const STATUSES = ['new', 'preparing', 'ready', 'completed'];

// Small seeded RNG so the sample data is stable between reloads.
function rng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

const popular = ['salted-caramel', 'matcha', 'caramel-latte', 'zaatar-croissant', 'mojito', 'white-mocha', 'saudi-coffee', 'halloumi-pesto', 'lotus-cheesecake', 'mocha', 'cheese-croissant', 'iced-tea', 'pistachio-cheesecake', 'date-pudding', 'omelette'];

export function makeSamples(now = Date.now()) {
  const r = rng(20260925);
  const orders = [];
  const pick = () => byId[popular[Math.floor(Math.pow(r(), 1.6) * popular.length)]];
  const make = (at, status, i) => {
    const lines = [];
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const p = pick();
      const choice = {};
      if (p.sizes) choice.size = r() > 0.5 ? 'large' : 'small';
      if (p.options?.includes('milk')) choice.milk = r() > 0.8 ? 'oat' : 'regular';
      if (p.options?.includes('ice')) choice.ice = r() > 0.85 ? 'light' : 'regular';
      if (p.options?.includes('shot')) choice.shot = r() > 0.85;
      if (lines.some((l) => l.id === p.id)) continue;
      const qty = r() > 0.8 ? 2 : 1;
      lines.push({ key: p.id + k, id: p.id, choice, qty, unit: unitPrice(p, choice) });
    }
    const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
    const roll = r();
    const mode = roll > 0.8 ? 'delivery' : 'pickup';
    const fee = mode === 'delivery' ? 8 : 0;
    return {
      id: 'A-' + (2100 + i), at, lines, subtotal, fee, total: subtotal + fee, mode, status, sample: true,
      pay: ['applepay', 'mada', 'cash'][Math.floor(r() * 3)], when: 'asap',
      curbside: mode === 'pickup' && roll > 0.4 ? ['White Camry · 4821', 'Black Tahoe · 1190', 'Grey Accent · 7734'][Math.floor(r() * 3)] : null,
      table: null,
      branch: branches[Math.floor(r() * branches.length)].id,
      address: mode === 'delivery' ? 'Sample address' : null,
      note: r() > 0.85 ? ['Less sugar please', 'Extra hot', 'Extra caramel drizzle'][Math.floor(r() * 3)] : '',
      rating: status === 'completed' && r() > 0.7 ? (r() > 0.25 ? 5 : 4) : undefined,
    };
  };

  // History across the last 24 hours, only inside opening hours (6 AM – midnight).
  let i = 0;
  for (let m = 24 * 60; m > 40; m -= 9 + Math.floor(r() * 28)) {
    const at = now - m * 60000;
    const h = new Date(at).getHours();
    if (h < 6) continue;
    orders.push(make(at, r() > 0.04 ? 'completed' : 'cancelled', i++));
  }
  // A few live ones so every column of the board has something in it.
  [[31, 'ready'], [18, 'preparing'], [9, 'preparing'], [4, 'new'], [1, 'new']].forEach(([min, status]) => orders.push(make(now - min * 60000, status, i++)));
  return orders.reverse();
}

export function loadSamples() {
  let s = read(SAMPLES_KEY, null);
  if (!s) { s = makeSamples(); write(SAMPLES_KEY, s); }
  return s;
}

export function describe(line, t) {
  const p = byId[line.id];
  if (!p) return '';
  const parts = [];
  const size = p.sizes?.find((s) => s.id === line.choice?.size);
  if (size) parts.push(t(size.en, size.ar));
  const milk = sampleOptions.milk.choices.find((c) => c.id === line.choice?.milk);
  if (milk && milk.id !== 'regular') parts.push(t(milk.en + ' milk', 'حليب ' + milk.ar));
  if (line.choice?.ice === 'light') parts.push(t('Light ice', 'ثلج خفيف'));
  if (line.choice?.shot) parts.push(t('Extra shot', 'شوت إضافي'));
  for (const g of ['addons', 'remove']) {
    for (const id of line.choice?.[g] || []) {
      const c = sampleOptions[g].choices.find((x) => x.id === id);
      if (c) parts.push(g === 'addons' ? t('+ ' + c.en, '+ ' + c.ar) : t(c.en, c.ar));
    }
  }
  return parts.join(' · ');
}

export const payLabel = (pay, mode, t) => ({
  applepay: 'Apple Pay',
  mada: t('mada / card', 'مدى / بطاقة'),
  cash: mode === 'pickup' ? t('Pay at pickup', 'الدفع عند الاستلام') : t('Cash on delivery', 'الدفع عند الاستلام'),
}[pay] || '—');

export function ago(at, now, t) {
  const m = Math.max(0, Math.round((now - at) / 60000));
  if (m < 1) return t('just now', 'الآن');
  if (m < 60) return t(`${m} min ago`, `قبل ${m} د`);
  const h = Math.floor(m / 60);
  return t(`${h} h ago`, `قبل ${h} س`);
}

export { menu, byId };

// ---- Sample people for the Customers, Loyalty, Staff and Notifications pages (stable between reloads) ----
const FIRST = [
  ['Abdullah', 'عبدالله'], ['Fatimah', 'فاطمة'], ['Hussain', 'حسين'], ['Noura', 'نورة'], ['Mohammed', 'محمد'], ['Zainab', 'زينب'],
  ['Ali', 'علي'], ['Maryam', 'مريم'], ['Ahmed', 'أحمد'], ['Sara', 'سارة'], ['Hassan', 'حسن'], ['Reem', 'ريم'], ['Khalid', 'خالد'],
  ['Hawra', 'حوراء'], ['Yousef', 'يوسف'], ['Layla', 'ليلى'], ['Abbas', 'عباس'], ['Dana', 'دانة'], ['Faisal', 'فيصل'], ['Aseel', 'أسيل'],
  ['Mahdi', 'مهدي'], ['Jana', 'جنى'], ['Turki', 'تركي'], ['Batool', 'بتول'],
];
const LAST = ['A.', 'S.', 'M.', 'H.', 'K.', 'R.', 'J.', 'T.', 'Q.', 'B.', 'D.', 'N.'];

export function sampleCustomers() {
  const r = rng(77031);
  const ids = menu.filter((p) => p.photo).map((p) => p.id);
  return FIRST.map(([en, ar], i) => {
    const orders = 2 + Math.floor(Math.pow(r(), 1.8) * 60);
    const avg = 22 + r() * 30;
    const last = LAST[Math.floor(r() * LAST.length)];
    return {
      id: 'C' + (1001 + i), en: en + ' ' + last, ar: ar + ' ' + last,
      phone: '05' + Math.floor(r() * 10) + ' ••• •• ' + String(10 + Math.floor(r() * 89)),
      orders, spent: Math.round(orders * avg), stamps: orders % 8, rewards: Math.floor(orders / 8),
      lastDays: Math.floor(Math.pow(r(), 2) * 30), fav: ids[Math.floor(r() * ids.length)],
      branch: branches[Math.floor(r() * branches.length)].id, since: 2024 + Math.floor(r() * 2),
    };
  }).sort((a, b) => b.orders - a.orders);
}

const COMMENTS = [
  [5, 'Salted caramel is the best in Qatif!', 'السولتد كراميل أفضل شيء بالقطيف!'],
  [5, 'Drive-thru was ready the second I pulled up.', 'الدرايف ثرو كان جاهز أول ما وصلت.'],
  [4, 'Love the zaatar croissant, a bit busy at 8 AM.', 'كرواسون الزعتر رهيب، بس زحمة الساعة ٨.'],
  [5, 'Lotus cheesecake 🤎', 'تشيز كيك اللوتس 🤎'],
  [3, 'Matcha was a little sweet for me.', 'الماتشا كانت حالية شوي علي.'],
  [5, 'Great staff at the hospital branch, very fast.', 'الموظفين في فرع المستشفى سريعين ومتعاونين.'],
  [4, 'Halloumi pesto sandwich is huge, worth it.', 'ساندويتش حلومي بيستو كبير ويستاهل.'],
  [5, '', ''],
  [2, 'Waited 15 minutes for a mocha.', 'انتظرت ربع ساعة على موكا.'],
  [5, 'Saudi coffee + date pudding = perfect.', 'قهوة سعودية مع بودنغ التمر = مثالي.'],
];
export function sampleReviews(now = Date.now()) {
  const people = sampleCustomers();
  return COMMENTS.map(([rating, en, ar], i) => ({
    id: 'R' + i, rating, comment: { en, ar }, who: people[(i * 5) % people.length],
    at: now - (i * 7 + 2) * 3600000, branch: branches[i % branches.length].id, sample: true,
  }));
}

export const defaultStaff = [
  { id: 's1', name: 'Hussain A.', role: 'admin', branch: 'all', active: true },
  { id: 's2', name: 'Zainab M.', role: 'manager', branch: 'maternity', active: true },
  { id: 's3', name: 'Ali K.', role: 'barista', branch: 'jamiyin', active: true },
  { id: 's4', name: 'Mahdi S.', role: 'barista', branch: 'jamiyin', active: true },
  { id: 's5', name: 'Hawra J.', role: 'barista', branch: 'qatif-central', active: true },
  { id: 's6', name: 'Abbas R.', role: 'barista', branch: 'aziziyah', active: false },
  { id: 's7', name: 'Fatimah T.', role: 'cashier', branch: 'pmbf', active: true },
];

export const sampleCampaigns = (now = Date.now()) => [
  { id: 'c1', en: 'World Coffee Day ☕ Your coffee is on us today at every Kav branch!', ar: 'اليوم العالمي للقهوة ☕ قهوتك علينا اليوم في كل فروع كاف!', audience: 'all', at: now - 4 * 86400000, sent: 1338, opened: 612, sample: true },
  { id: 'c2', en: 'Happy National Day 🇸🇦 Free car hanger with every drive-thru order', ar: 'كل عام والوطن بخير 🇸🇦 تعليقة سيارة هدية مع كل طلب درايف ثرو', audience: 'all', at: now - 12 * 86400000, sent: 1291, opened: 540, sample: true },
  { id: 'c3', en: 'You’re one stamp away from a free drink 🤎', ar: 'باقي لك ختم واحد على مشروبك المجاني 🤎', audience: 'loyal', at: now - 15 * 86400000, sent: 96, opened: 71, sample: true },
];
