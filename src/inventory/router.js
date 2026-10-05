import { useEffect, useState } from 'react';

// Hash router: "#/admin/branch/labn?d=2026-09-27" → { parts: ['admin', 'branch', 'labn'], params: { d: '…' } }
const parse = () => {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: path.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(query)) };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path) => { location.hash = '#/' + path; };
