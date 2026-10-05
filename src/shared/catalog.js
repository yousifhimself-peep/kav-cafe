// Live menu: the published Kav menu (data/menu.js → baseMenu) + edits made in the Admin portal.
// `menu` and `byId` are rebuilt in place so every existing import sees the edited menu; components re-render
// through useCatalog(), which follows the shared localStorage key (portal ↔ customer apps, across tabs).
import { menu, byId, baseMenu } from '../data/menu';
import { read, useShared, CONTENT } from './storage';

let applied = null;
export function applyCatalog(c = read(CONTENT.catalog, {})) {
  if (c === applied) return;
  applied = c;
  const edits = c.edits || {};
  const removed = new Set(c.removed || []);
  const list = [...baseMenu, ...(c.added || [])].filter((p) => !removed.has(p.id)).map((p) => ({ ...p, ...(edits[p.id] || {}) }));
  menu.length = 0;
  menu.push(...list);
  for (const k of Object.keys(byId)) delete byId[k];
  for (const p of list) byId[p.id] = p;
}
applyCatalog();

export function useCatalog() {
  const [catalog, setCatalog] = useShared(CONTENT.catalog, {});
  applyCatalog(catalog);
  return [catalog, setCatalog];
}

// What customers see: hidden items are left out.
export const visibleMenu = () => menu.filter((p) => !p.hidden);
export const isEdited = (catalog, id) => !!catalog.edits?.[id];
