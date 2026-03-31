import { useEffect, useState } from 'react';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';
import { getSelectedVendorId } from '../lib/vendorHub';

type Status = 'Preparing' | 'Ready' | 'Done';
type Tab = 'active' | 'completed' | 'all';

interface Order { id: string; items: string; customer: string; time: string; total: string; status: Status; }

const DB_STATUS_MAP: Record<string, Status> = { placed: 'Preparing', accepted: 'Preparing', preparing: 'Preparing', ready: 'Ready', picked_up: 'Done', cancelled: 'Done' };

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function OrdersPage() {
  const { vendor } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');
  const [search, setSearch] = useState('');

  // Load orders from DB
  useEffect(() => {
    const vendorId = getSelectedVendorId() ?? vendor?.id ?? null;
    if (!vendorId) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('id, status, total_cents, placed_at, notes, order_items(name_snapshot, quantity), profiles!orders_user_id_fkey(full_name)')
        .eq('vendor_id', vendorId)
        .order('placed_at', { ascending: false })
        .limit(50);

      setOrders((data ?? []).map((o: any) => ({
        id: o.id,
        items: o.order_items?.map((i: any) => `${i.quantity}x ${i.name_snapshot}`).join(', ') || 'Order',
        customer: o.profiles?.full_name || 'Walk-in',
        time: timeAgo(o.placed_at),
        total: `$${(o.total_cents / 100).toFixed(2)}`,
        status: DB_STATUS_MAP[o.status] || 'Preparing',
      })));
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`orders:${vendorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendorId}` }, () => {
        load().catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [vendor]);

  const advance = async (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    let newStatus: Status;
    let dbStatus: string;
    if (order.status === 'Preparing') { newStatus = 'Ready'; dbStatus = 'ready'; }
    else if (order.status === 'Ready') { newStatus = 'Done'; dbStatus = 'picked_up'; }
    else return;

    // Update DB
    if (id.length > 10) {
      await supabase.from('orders').update({ status: dbStatus as any }).eq('id', id);
    }

    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
  };

  const visible = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.items.toLowerCase().includes(q) || o.id.includes(q) || o.customer.toLowerCase().includes(q);
    const matchTab = tab === 'all' || (tab === 'active' && o.status !== 'Done') || (tab === 'completed' && o.status === 'Done');
    return matchSearch && matchTab;
  });

  const tabClass = (t: Tab) => t === tab ? 'cb93d8af0' : 'ca8e94988';
  const tabTextClass = (t: Tab) => t === tab ? 'c63a465e2' : 'c02fa62dc';

  return (
    <VendorDashboardShell active="orders" title="Orders">
      <div className="c6cb854e6">
        <div className="cedfc72fd">
          <div className="c0207626d">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#9C9890" strokeWidth="1.5" /><path d="M21 21L16.65 16.65" stroke="#9C9890" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: 14, outline: 'none', width: '100%' }}
            />
          </div>
          <div className="c3dc2ab43">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6H20M8 12H16M11 18H13" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <div className="c91e3dc28">Filter</div>
          </div>
        </div>
      </div>

      <div className="c7eb64632" style={{ cursor: 'pointer' }}>
        <div className={tabClass('active')} onClick={() => setTab('active')}><div className={tabTextClass('active')}>Active</div></div>
        <div className={tabClass('completed')} onClick={() => setTab('completed')}><div className={tabTextClass('completed')}>Completed</div></div>
        <div className={tabClass('all')} onClick={() => setTab('all')}><div className={tabTextClass('all')}>All Orders</div></div>
      </div>

      <div className="cbcdd9391">
        <div className="cc24af39d">Order</div>
        <div className="c10238d73">Items</div>
        <div className="c23cc3c1b">Time</div>
        <div className="c661b44e0">Total</div>
        <div className="c23cc3c1b">Status</div>
        <div className="cb3bfe125">Action</div>
      </div>

      {visible.length === 0 && (
        <div style={{ color: '#9C9890', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
          {loading ? 'Loading orders…' : 'No orders found.'}
        </div>
      )}

      {visible.map((order, index) => {
        const isLast = index === visible.length - 1;
        const rowClass = isLast ? 'c624378c5' : 'c47e7aae8';
        const badgeClass = order.status === 'Ready' ? 'c37b95574' : 'c794b9361';
        const badgeTextClass = order.status === 'Ready' ? 'c8bf179eb' : 'c32b35c6f';
        const numWrapClass = order.status === 'Ready' ? 'c7823d89d' : 'c74702699';
        const numTextClass = order.status === 'Ready' ? 'c42a8dfd4' : 'ce79502ad';
        const isDone = order.status === 'Done';
        const shortId = order.id.length > 6 ? order.id.slice(0, 4) : order.id;

        return (
          <div key={order.id} className={rowClass}>
            <div className="cfb4d73af"><div className={numWrapClass}><div className={numTextClass}>#{shortId}</div></div></div>
            <div className="c77a6b11a"><div className="c63a465e2">{order.items}</div><div className="c101d052c">Customer: {order.customer}</div></div>
            <div className="c413a3039">{order.time}</div>
            <div className="c27413839">{order.total}</div>
            <div className="c3d31e98a">
              <div className={badgeClass}><div className={badgeTextClass}>{order.status}</div></div>
            </div>
            <div className="c292f5fc9">
              {isDone ? (
                <div className="c45d8e1e7"><div className="c91280c5a">Done</div></div>
              ) : (
                <button
                  onClick={() => advance(order.id)}
                  className={order.status === 'Ready' ? 'c45d8e1e7' : 'c95226578'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                >
                  <div className={order.status === 'Ready' ? 'c91280c5a' : 'c693b5ace'}>
                    {order.status === 'Preparing' ? 'Mark Ready' : 'Mark Done'}
                  </div>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </VendorDashboardShell>
  );
}
