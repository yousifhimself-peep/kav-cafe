// Demo state lives in localStorage. The live version swaps this file for Supabase (same shape: counts, log, settings).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { byId, countKeys, levelRank } from './data/items';
import { buildSeed } from './data/seed';
import { todayKey } from './lib/dates';

const KEY = 'kav-inventory-v1';
export const EDIT_WINDOW_MIN = 30;
export const DEMO = { staffPassword: '1234', manager: { user: 'manager', pass: '1234' } };

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s?.seededFor === todayKey()) return s;
  } catch { /* fall through to a fresh seed */ }
  return { seededFor: todayKey(), ...buildSeed(), mins: {} }; // re-seed daily so the demo's "today" is always today
};

const session = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(load);
  const [lang, setLangState] = useState(() => { try { return localStorage.getItem('kav-inv-lang') || 'ar'; } catch { return 'ar'; } });
  const [staff, setStaff] = useState(() => session.get('kav-inv-staff') === '1');
  const [manager, setManager] = useState(() => session.get('kav-inv-manager'));
  const [toast, setToast] = useState(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode */ } }, [data]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kav-inv-lang', lang); } catch { /* ignore */ }
  }, [lang]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const ar = lang === 'ar';
  const t = useCallback((en, arabic) => (ar ? arabic : en), [ar]);

  // Minimums can be adjusted by managers; fall back to the paper sheet's value.
  const minOf = useCallback((item) => (item.id in data.mins ? data.mins[item.id] : item.min), [data.mins]);

  const status = useCallback((item, value) => {
    if (value == null || value === '') return 'missing';
    const min = minOf(item);
    if (min == null) return 'none';
    if (item.unit === 'level') {
      const r = levelRank(value), m = levelRank(min);
      return r <= m ? 'bad' : r === m + 1 ? 'warn' : 'ok';
    }
    return value <= min ? 'bad' : value <= min * 1.5 ? 'warn' : 'ok';
  }, [minOf]);

  const saveCount = useCallback((date, branch, values, by, role = 'staff') => {
    setData((d) => {
      const prev = d.counts[date]?.[branch];
      const changes = prev
        ? countKeys.filter(({ key }) => prev.values[key] !== values[key]).map(({ key }) => ({ key, from: prev.values[key], to: values[key] }))
        : [];
      const now = Date.now();
      const entry = prev ? { ...prev, values, editedAt: now, editedBy: by } : { at: now, by, values };
      const logEntry = { at: now, date, branch, by, role, action: prev ? 'edit' : 'submit', changes };
      return { ...d, counts: { ...d.counts, [date]: { ...d.counts[date], [branch]: entry } }, log: [logEntry, ...d.log] };
    });
  }, []);

  const deleteCount = useCallback((date, branch, by) => {
    setData((d) => {
      const day = { ...d.counts[date] };
      delete day[branch];
      return { ...d, counts: { ...d.counts, [date]: day }, log: [{ at: Date.now(), date, branch, by, role: 'manager', action: 'delete', changes: [] }, ...d.log] };
    });
  }, []);

  // min === undefined removes the override (back to the paper sheet's value); null means "no minimum".
  const setMin = useCallback((id, min) => setData((d) => {
    const mins = { ...d.mins };
    if (min === undefined) delete mins[id]; else mins[id] = min;
    return { ...d, mins };
  }), []);

  const resetDemo = useCallback(() => {
    setData({ seededFor: todayKey(), ...buildSeed(), mins: {} });
    setToast(ar ? 'تمت إعادة البيانات التجريبية' : 'Demo data reset');
  }, [ar]);

  const value = useMemo(() => ({
    ...data, lang, ar, t, setLang: setLangState, toast, setToast,
    minOf, status, saveCount, deleteCount, setMin, resetDemo,
    staff, loginStaff: (pw) => { const ok = pw === DEMO.staffPassword; if (ok) { session.set('kav-inv-staff', '1'); setStaff(true); } return ok; },
    logoutStaff: () => { session.set('kav-inv-staff', null); setStaff(false); },
    manager, loginManager: (u, p) => { const ok = u.trim().toLowerCase() === DEMO.manager.user && p === DEMO.manager.pass; if (ok) { session.set('kav-inv-manager', u.trim()); setManager(u.trim()); } return ok; },
    logoutManager: () => { session.set('kav-inv-manager', null); setManager(null); },
  }), [data, lang, ar, t, toast, minOf, status, saveCount, deleteCount, setMin, resetDemo, staff, manager]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// Label for a count cell ("Cookies · Large").
export const cellLabel = ({ item, variant }, t) => t(item.en, item.ar) + (variant ? ' · ' + t(variant.en, variant.ar) : '');
export const itemOfKey = (key) => byId[key.split(':')[0]];
