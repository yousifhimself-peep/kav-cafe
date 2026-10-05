// Deterministic sample history (14 days × 7 branches) so the dashboard has something realistic to show.
import { countKeys, LEVELS } from './items';
import { branches } from './branches';
import { dateKey, addDays } from '../lib/dates';

const DAYS = 14;
const MISSING_TODAY = ['pmbf', 'kfsh'];
const STAFF = ['حسين', 'علي', 'محمد', 'زينب', 'فاطمة', 'حسن', 'مريم', 'عباس', 'جعفر', 'نرجس', 'أحمد', 'زهراء'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const roundFor = (item, v) => {
  if (item.unit !== 'kg') return Math.max(0, Math.round(v));
  const step = item.min != null && item.min < 2 ? 0.1 : 0.5;
  return Math.max(0, Math.round(v / step) * step);
};

export function buildSeed(now = new Date()) {
  const r = rng(20261027);
  const counts = {};
  const log = [];
  const today = dateKey(now);

  for (const b of branches) {
    // Each branch/cell runs its own stock level: it drops every day and is restocked near the minimum.
    const level = {};
    for (const { key, item } of countKeys) {
      if (item.unit === 'level') level[key] = 2;
      else if (item.min != null) level[key] = item.min * (2.2 + r() * 3);
      else level[key] = 150 + r() * 1500;
    }
    for (let d = DAYS - 1; d >= 0; d--) {
      const day = addDays(now, -d);
      const key = dateKey(day);
      if (key === today && MISSING_TODAY.includes(b.id)) continue;
      if (key !== today && r() < 0.05) continue; // the odd missed day in history

      const values = {};
      for (const { key: k, item } of countKeys) {
        if (item.unit === 'level') {
          if (r() < 0.2) level[k] -= 1;
          if (level[k] < 0 || (level[k] === 0 && r() < 0.75)) level[k] = 2;
          values[k] = LEVELS[Math.max(0, level[k])].id;
          continue;
        }
        const base = item.min ?? 200;
        level[k] -= base * (0.1 + r() * 0.3);
        if (level[k] <= base * 1.4 && r() < 0.85) level[k] += base * (2 + r() * 2.5);
        if (level[k] < 0) level[k] = base * 0.3 * r();
        values[k] = roundFor(item, level[k]);
      }
      const at = new Date(day);
      at.setHours(7 + Math.floor(r() * 4), Math.floor(r() * 60), 0, 0);
      const by = STAFF[Math.floor(r() * STAFF.length)];
      counts[key] ??= {};
      counts[key][b.id] = { at: at.getTime(), by, values };
      if (key === today) log.push({ at: at.getTime(), date: key, branch: b.id, by, role: 'staff', action: 'submit', changes: [] });
    }
  }

  // A couple of corrections so the edit log isn't empty.
  const fix = (branch, k, to, by, mins) => {
    const c = counts[today]?.[branch];
    if (!c) return;
    const from = c.values[k];
    c.values[k] = to;
    log.push({ at: c.at + mins * 60000, date: today, branch, by, role: 'staff', action: 'edit', changes: [{ key: k, from, to }] });
  };
  fix('jamiyin', 'espresso-beans', 8, 'حسين', 12);
  fix('aziziyah', 'fresh-milk-1l', 30, 'زينب', 20);
  log.sort((a, b) => b.at - a.at);
  return { counts, log };
}
