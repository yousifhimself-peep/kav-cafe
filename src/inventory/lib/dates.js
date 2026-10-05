export const dateKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const todayKey = () => dateKey(new Date());

// Latin digits in Arabic too — easier to scan for stock numbers.
export const fmtDate = (key, ar, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(key + 'T12:00:00').toLocaleDateString(ar ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', opts);

export const fmtTime = (ms, ar) =>
  new Date(ms).toLocaleTimeString(ar ? 'ar-SA-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' });

export const lastDays = (n, from = new Date()) => Array.from({ length: n }, (_, i) => dateKey(addDays(from, -(n - 1 - i))));
