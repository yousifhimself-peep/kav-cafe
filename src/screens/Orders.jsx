import { useStore } from '../store';
import { go } from '../router';
import { byId } from '../data/menu';
import { Money, TopBar, Empty, ProductArt, itemCount } from '../components/ui';
import { Receipt, CaretRight, Storefront, Moped } from '../components/icons';

export default function Orders() {
  const { t, ar, orders, add, setToast } = useStore();

  if (!orders.length) {
    return (
      <div className="min-h-full pb-32">
        <TopBar title={t('Your orders', 'طلباتي')} />
        <Empty icon={Receipt} title={t('No orders yet', 'ما عندك طلبات')} body={t('When you place an order, you can track it and reorder from here.', 'لما تطلب، تقدر تتابع طلبك وتعيده من هنا.')}
          action={<button onClick={() => go('menu')} className="rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-cream shadow-lg">{t('Start an order', 'ابدأ طلبك')}</button>} />
      </div>
    );
  }

  const reorder = (o) => {
    o.lines.forEach((l) => byId[l.id] && add(l.id, l.choice, l.qty));
    setToast(t('Added to your bag', 'أضفناه لسلتك'));
    go('bag');
  };

  return (
    <div className="min-h-full pb-32">
      <TopBar title={t('Your orders', 'طلباتي')} />
      <ul className="space-y-3 px-4">
        {orders.map((o) => {
          const items = o.lines.map((l) => byId[l.id]).filter(Boolean);
          const qty = o.lines.reduce((s, l) => s + l.qty, 0);
          return (
            <li key={o.id} className="rounded-3xl bg-white p-4 shadow-sm">
              <button onClick={() => go('order/' + o.id)} className="flex w-full items-center gap-3 text-start">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  {items.slice(0, 3).map((p, i) => <ProductArt key={p.id + i} product={p} size="sm" className="h-12 w-12 rounded-xl ring-2 ring-white" />)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {o.mode === 'pickup' ? <Storefront size={15} /> : <Moped size={15} />} {o.id}
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {new Date(o.at).toLocaleString(ar ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {itemCount(qty, ar)}
                  </p>
                </div>
                <Money value={o.total} className="text-sm font-semibold" />
                <CaretRight size={16} className="text-ink/30 rtl:-scale-x-100" />
              </button>
              <button onClick={() => reorder(o)} className="mt-3 h-10 w-full rounded-xl bg-paper text-sm font-medium text-forest active:scale-[.98]">{t('Order again', 'اطلب مرة ثانية')}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
