import { useEffect, useState } from 'react';

// Tiny hash router: "#/menu?c=cold" -> { name: 'menu', params: { c: 'cold' } }
const parse = () => {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [name = '', id] = path.split('/');
  return { name: name || 'home', id, params: Object.fromEntries(new URLSearchParams(query)) };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const go = (path) => { location.hash = '#/' + path; };
