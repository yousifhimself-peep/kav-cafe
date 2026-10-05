import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { byId, sampleOptions, branches, branchById } from './data/menu';
import { KEYS, CONTENT, useShared, defaultPromos, defaultLoyalty } from './shared/storage';
import { useCatalog } from './shared/catalog';

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: state stays in memory */ }
};

// Unit price for a product with the chosen options.
export function unitPrice(product, choice = {}) {
  const size = product.sizes?.find((s) => s.id === choice.size);
  let price = size ? size.price : product.price;
  const milk = sampleOptions.milk.choices.find((c) => c.id === choice.milk);
  if (milk) price += milk.price;
  if (choice.shot) price += sampleOptions.shot.price;
  for (const id of choice.addons || []) price += sampleOptions.addons.choices.find((c) => c.id === id)?.price || 0;
  return price;
}

const lineKey = (id, choice) => id + '|' + JSON.stringify(choice);

const Store = createContext(null);

// No language screen: the link opens straight into the app, in the visitor's browser language.
const defaultLang = () => ((navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en');

export function StoreProvider({ children }) {
  const [lang, setLang] = useState(() => read('kav-lang', null) || defaultLang());
  const [cart, setCart] = useState(() => read('kav-cart', []).filter((l) => byId[l.id]));
  const [orders, setOrders] = useShared(KEYS.orders, []); // staff portal updates `status` live
  const [availability] = useShared(KEYS.availability, {});
  const [storeSettings] = useShared(KEYS.store, {});
  const [catalog] = useCatalog(); // admin menu edits (prices, photos, new / hidden items)
  const [promos] = useShared(CONTENT.promos, defaultPromos);
  const [loyalty] = useShared(CONTENT.loyalty, defaultLoyalty);
  const [push] = useShared(CONTENT.push, []);
  const [mode, setMode] = useState(() => read('kav-mode', 'pickup'));
  const [branchId, setBranch] = useState(() => (branchById[read('kav-branch', '')] ? read('kav-branch', '') : branches[0].id));
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null); // product id shown in the detail sheet

  useEffect(() => write('kav-lang', lang), [lang]);
  useEffect(() => write('kav-cart', cart), [cart]);
  useEffect(() => write('kav-mode', mode), [mode]);
  useEffect(() => write('kav-branch', branchId), [branchId]);

  const ar = lang === 'ar';
  useEffect(() => {
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
  }, [ar]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const t = useCallback((en, arabic) => (ar ? arabic : en), [ar]);

  const add = useCallback((id, choice, qty) => {
    const key = lineKey(id, choice);
    setCart((old) => old.some((l) => l.key === key)
      ? old.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      : [...old, { key, id, choice, qty }]);
  }, []);

  const setQty = useCallback((key, qty) => {
    setCart((old) => (qty <= 0 ? old.filter((l) => l.key !== key) : old.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const lines = useMemo(() => cart.map((l) => {
    const product = byId[l.id];
    const unit = unitPrice(product, l.choice);
    return { ...l, product, unit, total: unit * l.qty };
  }), [cart, catalog]);

  const count = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  const placeOrder = useCallback((details) => {
    const order = {
      id: 'A-' + String(Math.floor(1000 + Math.random() * 9000)),
      at: Date.now(),
      lines: lines.map(({ key, id, choice, qty, unit }) => ({ key, id, choice, qty, unit })),
      subtotal,
      branch: branchId,
      ...details,
    };
    setOrders((old) => [order, ...old].slice(0, 20));
    setCart([]);
    return order;
  }, [lines, subtotal, branchId]);

  // Customer rating after an order is completed; shows up under Customers → Reviews in the portal.
  const rateOrder = useCallback((id, rating, comment = '') => {
    setOrders((old) => old.map((o) => (o.id === id ? { ...o, rating, comment, ratedAt: Date.now() } : o)));
  }, []);

  const resetDemo = useCallback(() => {
    setCart([]); setOrders([]); setMode('pickup');
    location.hash = '#/home';
  }, []);

  const value = {
    lang, setLang, ar, t, cart, lines, count, subtotal, add, setQty, orders, placeOrder,
    mode, setMode, branch: branchById[branchId], setBranch, toast, setToast, resetDemo, sheet, setSheet,
    isAvailable: (id) => availability[id] !== false,
    rateOrder, promos, loyalty, push,
    branchClosed: mode === 'pickup' && !!storeSettings.closedBranches?.[branchId],
    paused: !!storeSettings.paused || (mode === 'pickup' && !!storeSettings.closedBranches?.[branchId]),
    prep: storeSettings.prep || 'normal',
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export const useStore = () => useContext(Store);
