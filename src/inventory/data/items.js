// Items come straight from items.csv (a proposed list built from Kav's menu — to confirm with Kav), so the CSV stays the single source.
import csv from '../items.csv?raw';

export const UNITS = {
  piece: { en: 'piece', ar: 'حبة' },
  pack: { en: 'pack', ar: 'حزمة' },
  kg: { en: 'kg', ar: 'كجم' },
  level: { en: 'level', ar: 'مستوى' },
};

// Order quantities on the sheet use short codes: 1ct, 2pk, 60kg, 500g, 120pc…
export const ORDER_UNITS = {
  ct: { en: 'carton', enPl: 'cartons', ar: 'كرتون' },
  pk: { en: 'pack', enPl: 'packs', ar: 'حزمة' },
  pc: { en: 'piece', enPl: 'pieces', ar: 'حبة' },
  kg: { en: 'kg', enPl: 'kg', ar: 'كجم' },
  g: { en: 'g', enPl: 'g', ar: 'جم' },
};

// Items that are eyeballed rather than counted (mint, lime, cleaners): Full / Half / Little.
export const LEVELS = [
  { id: 'L.T', rank: 0, en: 'Little', ar: 'قليل' },
  { id: 'H.F', rank: 1, en: 'Half', ar: 'نصف' },
  { id: 'F.L', rank: 2, en: 'Full', ar: 'ممتلئ' },
];
export const levelRank = (id) => LEVELS.find((l) => l.id === id)?.rank ?? null;

const VARIANT_NAMES = {
  Zaatar: { en: 'Zaatar', ar: 'زعتر' },
  Cheese: { en: 'Cheese', ar: 'جبنة' },
  ZaatarChoc: { en: 'Zaatar & chocolate', ar: 'زعتر وشوكلت' },
  Almond: { en: 'Almond', ar: 'لوز' },
  Pistachio: { en: 'Pistachio', ar: 'بستاشيو' },
  Lotus: { en: 'Lotus', ar: 'لوتس' },
  Berry: { en: 'Berry', ar: 'بيري' },
  Date: { en: 'Date', ar: 'تمر' },
  Chocolate: { en: 'Chocolate', ar: 'شوكلت' },
  Lemon: { en: 'Lemon', ar: 'ليمون' },
  Carrot: { en: 'Carrot', ar: 'جزر' },
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "150pc" → 150 · "100g" (kg item) → 0.1 · "500" (kg item, unit missing on sheet) → 0.5 · "H.F" → "H.F"
function parseMin(raw, unit) {
  if (!raw) return null;
  if (unit === 'level') return levelRank(raw) != null ? raw : 'L.T';
  const m = raw.match(/^([\d.]+)\s*([a-z]*)$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (unit === 'kg') {
    if (m[2] === 'g' || (!m[2] && n >= 100)) return n / 1000; // bare 300–600 on the sheet are almost certainly grams
    return n;
  }
  return n;
}

export function parseOrder(raw) {
  const m = (raw || '').match(/^([\d.]+)\s*([a-z]*)$/i);
  if (!m) return null;
  return { n: Number(m[1]), u: m[2] || 'pc' };
}

const rows = csv.trim().split('\n').slice(1).map((line) => line.split(','));

export const items = rows.map(([group, en, ar, low, order, unit, variants, notes]) => ({
  id: slug(en),
  group,
  en,
  ar,
  unit,
  min: parseMin(low, unit),
  minRaw: low,
  order: parseOrder(order),
  orderRaw: order,
  variants: variants
    ? variants.split('|').map((v) => {
        const name = v.trim().split(' ')[0];
        return { id: slug(name), ...(VARIANT_NAMES[name] || { en: name, ar: name }) };
      })
    : null,
  note: notes || '',
}));

export const byId = Object.fromEntries(items.map((i) => [i.id, i]));

// One count cell per item, or per variant (each cheesecake flavour is counted separately).
export const countKeys = items.flatMap((i) => (i.variants ? i.variants.map((v) => ({ key: `${i.id}:${v.id}`, item: i, variant: v })) : [{ key: i.id, item: i, variant: null }]));

export const GROUPS = [
  { id: 'ingredients', en: 'Ingredients & food', ar: 'المواد الغذائية والحلويات' },
  { id: 'supplies', en: 'Supplies & packaging', ar: 'المستلزمات والتغليف' },
];
