import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';
import { getSelectedVendorId, setSelectedVendorId as persistSelectedVendorId } from '../lib/vendorHub';

type Status = 'New' | 'Preparing' | 'Ready';

interface ActiveOrder {
  id: string;
  items: string;
  time: string;
  total: string;
  status: Status;
}

const STATUS_FLOW: Record<Status, Status | 'Done'> = { New: 'Preparing', Preparing: 'Ready', Ready: 'Done' };
const STATUS_ACTION_LABEL: Record<Status, string> = { New: 'Accept', Preparing: 'Mark Ready', Ready: 'Complete' };
const STATUS_ACTION_COLOR: Record<Status, string> = { New: '#FF6B2C', Preparing: '#2D9F6F', Ready: '#1C1917' };
const STATUS_BADGE_BG: Record<Status, string> = { New: '#FFF4EE', Preparing: '#FEF3CD', Ready: '#E8F5E9' };
const STATUS_BADGE_COLOR: Record<Status, string> = { New: '#FF6B2C', Preparing: '#B8860B', Ready: '#2D9F6F' };

const DB_STATUS_MAP: Record<string, Status> = { placed: 'New', accepted: 'New', preparing: 'Preparing', ready: 'Ready' };
const REVERSE_STATUS_MAP: Record<Status | 'Done', string> = { New: 'accepted', Preparing: 'preparing', Ready: 'ready', Done: 'picked_up' };

const topSelling = [
  { rank: 1, item: 'Tacos Al Pastor', sold: '38 sold', revenue: '$342' },
  { rank: 2, item: 'Burrito Bowl', sold: '26 sold', revenue: '$286' },
  { rank: 3, item: 'Churros', sold: '22 sold', revenue: '$154' },
  { rank: 4, item: 'Elote', sold: '19 sold', revenue: '$114' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { vendor, profile } = useAuth();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [notification, setNotification] = useState<ActiveOrder | null>(null);
  const [orderCount, setOrderCount] = useState(47);
  const [revenue, setRevenue] = useState(1284);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [vendors, setVendors] = useState<Pick<Database['public']['Tables']['vendors']['Row'], 'id' | 'name'>[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(() => getSelectedVendorId() ?? vendor?.id ?? null);
  const [seeding, setSeeding] = useState(false);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) ?? (vendor ? { id: vendor.id, name: vendor.name } : null);
  const displayName = (profile?.full_name || vendor?.name || 'Vendor').split(' ')[0] || 'Vendor';

  // Load all vendors (hub)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('vendors').select('id, name').order('name');
      if (cancelled) return;
      if (data) {
        setVendors(data);
        if (!selectedVendorId) {
          const next = vendor?.id ?? data[0]?.id ?? null;
          setSelectedVendorId(next);
          persistSelectedVendorId(next);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    persistSelectedVendorId(selectedVendorId);
  }, [selectedVendorId]);

  // Load orders from DB
  useEffect(() => {
    const vendorId = selectedVendorId ?? vendor?.id ?? null;
    if (!vendorId) return;
    const loadOrders = async () => {
      setLoadingOrders(true);
      const { data } = await supabase
        .from('orders')
        .select('id, status, total_cents, placed_at, order_items(name_snapshot, quantity)')
        .eq('vendor_id', vendorId)
        .in('status', ['placed', 'accepted', 'preparing', 'ready'])
        .order('placed_at', { ascending: false })
        .limit(10);

      const mapped: ActiveOrder[] = (data ?? []).map((o: any) => ({
        id: o.id,
        items: o.order_items?.map((i: any) => `${i.quantity}x ${i.name_snapshot}`).join(', ') || 'Order',
        time: timeAgo(o.placed_at),
        total: `$${(o.total_cents / 100).toFixed(2)}`,
        status: DB_STATUS_MAP[o.status] || 'New',
      }));
      setOrders(mapped);
      setLoadingOrders(false);

      // Load today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_cents')
        .eq('vendor_id', vendorId)
        .gte('placed_at', today);

      if (todayOrders && todayOrders.length > 0) {
        setOrderCount(todayOrders.length);
        setRevenue(todayOrders.reduce((s, o) => s + o.total_cents, 0) / 100);
      } else {
        setOrderCount(0);
        setRevenue(0);
      }
    };

    loadOrders();

    // Subscribe to real-time order changes
    const channel = supabase
      .channel(`vendor-orders:${vendorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendorId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const o = payload.new as any;
          const newOrder: ActiveOrder = {
            id: o.id,
            items: 'New order',
            time: 'Just now',
            total: `$${(o.total_cents / 100).toFixed(2)}`,
            status: 'New',
          };
          setOrders((prev) => [newOrder, ...prev]);
          setOrderCount((c) => c + 1);
          setRevenue((r) => r + o.total_cents / 100);
          setNotification(newOrder);
          setTimeout(() => setNotification(null), 5000);

          // Fetch full order items
          supabase.from('order_items').select('name_snapshot, quantity').eq('order_id', o.id).then(({ data: items }) => {
            if (items) {
              const itemStr = items.map((i: any) => `${i.quantity}x ${i.name_snapshot}`).join(', ');
              setOrders((prev) => prev.map((ord) => ord.id === o.id ? { ...ord, items: itemStr } : ord));
              setNotification((prev) => prev?.id === o.id ? { ...prev, items: itemStr } : prev);
            }
          });
        }
        if (payload.eventType === 'UPDATE') {
          const o = payload.new as any;
          const mappedStatus = DB_STATUS_MAP[o.status];
          if (mappedStatus) {
            setOrders((prev) => prev.map((ord) => ord.id === o.id ? { ...ord, status: mappedStatus } : ord));
          } else {
            // Status like picked_up or cancelled — remove from active list
            setOrders((prev) => prev.filter((ord) => ord.id !== o.id));
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedVendorId, vendor?.id]);

  const seedDemoVendors = async () => {
    setSeeding(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;

      const demoVendors = [
        { name: "Marco's Street Tacos", cuisine: 'Mexican', location_text: 'Mission District, San Francisco', description: 'Street tacos, made fast. Fresh tortillas, bold salsas, and zero fluff.' },
        { name: 'Bao House', cuisine: 'Asian', location_text: 'SoMa, San Francisco', description: 'Steamy baos, crispy sides, and bubble tea—ready for pickup.' },
        { name: 'La Cocina Arepas', cuisine: 'Latin', location_text: 'Castro, San Francisco', description: 'Hand-pressed arepas with bright fillings and house sauces.' },
      ] as const;

      const created: Array<{ id: string; name: string }> = [];
      for (const v of demoVendors) {
        const { data: existing } = await supabase.from('vendors').select('id,name').eq('owner_id', user.id).eq('name', v.name).maybeSingle();
        if (existing?.id) {
          created.push({ id: existing.id, name: existing.name });
          continue;
        }
        const { data: newVendor, error } = await supabase
          .from('vendors')
          .insert({ owner_id: user.id, name: v.name, cuisine: v.cuisine, location_text: v.location_text, description: v.description, is_live: true })
          .select('id,name')
          .single();
        if (error) throw error;
        created.push({ id: newVendor.id, name: newVendor.name });
      }

      // Seed menu items per vendor (idempotent by name)
      for (const v of created) {
        const items = v.name.includes('Tacos')
          ? [
              { name: 'Tacos Al Pastor', price_cents: 900, category: 'mains' },
              { name: 'Burrito Bowl', price_cents: 1100, category: 'mains' },
              { name: 'Horchata', price_cents: 450, category: 'drinks' },
            ]
          : v.name.includes('Bao')
            ? [
                { name: 'Pork Belly Bao', price_cents: 800, category: 'mains' },
                { name: 'Taro Bubble Tea', price_cents: 550, category: 'drinks' },
                { name: 'Crispy Wontons', price_cents: 700, category: 'sides' },
              ]
            : [
                { name: 'Reina Pepiada', price_cents: 900, category: 'mains' },
                { name: 'Plantain Chips', price_cents: 500, category: 'sides' },
                { name: 'Passionfruit Juice', price_cents: 450, category: 'drinks' },
              ];

        for (const item of items) {
          const { data: existingItem } = await supabase
            .from('menu_items')
            .select('id')
            .eq('vendor_id', v.id)
            .eq('name', item.name)
            .maybeSingle();
          if (existingItem?.id) continue;
          await supabase.from('menu_items').insert({
            vendor_id: v.id,
            name: item.name,
            price_cents: item.price_cents,
            category: item.category,
            dietary_tags: [],
            popular: false,
            featured: false,
            is_available: true,
          } as any);
        }
      }

      // Refresh vendor list and select first demo vendor for convenience
      const { data } = await supabase.from('vendors').select('id, name').order('name');
      if (data) setVendors(data);
      if (created[0]?.id) setSelectedVendorId(created[0].id);
    } finally {
      setSeeding(false);
    }
  };

  const advanceOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const next = STATUS_FLOW[order.status];

    // Update in DB if it's a real UUID
    if (orderId.length > 10) {
      const dbStatus = REVERSE_STATUS_MAP[next];
      if (dbStatus) {
        await supabase.from('orders').update({ status: dbStatus as any }).eq('id', orderId);
      }
    }

    // Update local state
    if (next === 'Done') {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: next as Status } : o));
    }
  };

  return (
    <VendorDashboardShell active="dashboard" title="">
      {/* New order notification banner */}
      {notification && (
        <div
          onClick={() => navigate('/order-detail')}
          style={{
            alignItems: 'center',
            animation: 'slideDown 0.3s ease',
            background: 'linear-gradient(135deg, #FF6B2C, #FF8F5C)',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(255,107,44,0.3)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            gap: 14,
            marginBottom: 20,
            padding: '16px 20px',
          }}
        >
          <div style={{ alignItems: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', height: 40, justifyContent: 'center', width: 40 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.409 17.368 4.883 16.243 3.757C15.117 2.632 13.591 2 12 2C10.409 2 8.883 2.632 7.757 3.757C6.632 4.883 6 6.409 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21C13.554 21.303 13.302 21.555 12.998 21.73C12.695 21.904 12.35 21.997 12 21.997C11.65 21.997 11.305 21.904 11.002 21.73C10.698 21.555 10.446 21.303 10.27 21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>New Order #{notification.id.slice(0, 6)}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{notification.items} · {notification.total}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, fontWeight: 600, padding: '8px 16px' }}>
            View
          </div>
        </div>
      )}

      <div className="c02532b2c">
        <div className="c68a96fd1">
          <div className="cc2cdcf25">{getGreeting()}, {displayName}</div>
          <div className="c2873d50d">{formatDate(new Date())}</div>
          {selectedVendor && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ color: '#9C9890', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Viewing vendor</div>
              <select
                value={selectedVendor.id}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                style={{
                  background: '#fff',
                  border: '1.5px solid #E8E6E1',
                  borderRadius: 10,
                  color: '#1C1917',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                  padding: '8px 12px',
                }}
              >
                {(vendors.length ? vendors : [selectedVendor]).map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <div style={{ color: '#9C9890', fontSize: 12 }}>Dashboard updates in real time as orders come in.</div>
            </div>
          )}
        </div>
        <div className="cee54018c" style={{ gap: 12 }}>
          <button
            onClick={() => seedDemoVendors().catch(() => {})}
            disabled={seeding}
            style={{
              alignItems: 'center',
              background: '#1C1917',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: seeding ? 'not-allowed' : 'pointer',
              display: 'flex',
              fontSize: 13,
              fontWeight: 600,
              gap: 6,
              opacity: seeding ? 0.6 : 1,
              padding: '8px 14px',
              whiteSpace: 'nowrap',
            }}
            title="Creates demo vendors + menu items in Supabase"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {seeding ? 'Seeding…' : 'Seed Demo Vendors'}
          </button>
          <div className="c8cb14f1d">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.409 17.368 4.883 16.243 3.757C15.117 2.632 13.591 2 12 2C10.409 2 8.883 2.632 7.757 3.757C6.632 4.883 6 6.409 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21C13.554 21.303 13.302 21.555 12.998 21.73C12.695 21.904 12.35 21.997 12 21.997C11.65 21.997 11.305 21.904 11.002 21.73C10.698 21.555 10.446 21.303 10.27 21" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="ca85f1b8e"><div className="ca0488f65">{displayName.charAt(0).toUpperCase()}</div></div>
        </div>
      </div>

      <div className="c36aa8d7a">
        <div className="caf61eea8">
          <div className="c5fd6f910">
            <div className="c58338591">Today's Revenue</div>
            <div className="c54a594b1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="#2D9F6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="c8bf179eb">18%</div>
            </div>
          </div>
          <div className="c6a60accc">${revenue.toLocaleString()}</div>
          <div className="ce1d1ae4b">vs $1,088 last {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
        <div className="c23fd78fd"><div className="c0082a0f0">Orders</div><div className="c16a667b9">{orderCount}</div><div className="ceacc2391">{orders.length} active now</div></div>
        <div className="c23fd78fd"><div className="c0082a0f0">Avg. Order</div><div className="c16a667b9">${orderCount > 0 ? Math.round(revenue / orderCount) : 0}</div><div className="c4f124f98">+$4 from avg</div></div>
        <div className="c23fd78fd"><div className="c0082a0f0">Items Sold</div><div className="c16a667b9">132</div><div className="ceacc2391">across 8 items</div></div>
      </div>

      <div className="c3684be4f">
        <div className="ca764bb83">
          <div className="c512d51bd"><div className="cc80c44d8">Active Orders</div><Link className="link-reset cc4223e94" to="/orders">View all</Link></div>
          {orders.length === 0 && (
            <div style={{ color: '#9C9890', fontSize: 14, padding: '24px 0', textAlign: 'center' }}>
              {loadingOrders ? 'Loading orders…' : 'No active orders'}
            </div>
          )}
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={index === orders.length - 1 ? 'c22ac83f0' : 'cb3b67cf4'}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/order-detail')}
            >
              <div className="cd286c9c1">
                <div style={{ alignItems: 'center', background: STATUS_BADGE_BG[order.status], borderRadius: 8, display: 'flex', height: 36, justifyContent: 'center', minWidth: 52, padding: '0 8px' }}>
                  <div style={{ color: STATUS_BADGE_COLOR[order.status], fontSize: 12, fontWeight: 700 }}>#{order.id.length > 6 ? order.id.slice(0, 4) : order.id}</div>
                </div>
                <div className="c3bc4f4c9">
                  <div className="c63a465e2">{order.items}</div>
                  <div className="c101d052c">{order.time}</div>
                </div>
              </div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                <div className="ca1f6e49c">{order.total}</div>
                <div style={{ background: STATUS_BADGE_BG[order.status], borderRadius: 6, color: STATUS_BADGE_COLOR[order.status], fontSize: 12, fontWeight: 600, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                  {order.status}
                </div>
                <button
                  onClick={(e) => advanceOrder(order.id, e)}
                  style={{
                    background: STATUS_ACTION_COLOR[order.status],
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {STATUS_ACTION_LABEL[order.status]}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="ce9541fa8">
          <div className="c512d51bd"><div className="cc80c44d8">Top Selling</div><div className="ce2c651e4">Today</div></div>
          {topSelling.map((item, index) => (
            <div key={item.rank} className={index === topSelling.length - 1 ? 'c64b4015d' : 'cdccbc807'}>
              <div className="cd286c9c1">
                <div className="c8ea84246"><div className="c3991ba2f">{item.rank}</div></div>
                <div className="c3bc4f4c9"><div className="c63a465e2">{item.item}</div><div className="c101d052c">{item.sold}</div></div>
              </div>
              <div className="ca1f6e49c">{item.revenue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline animation style */}
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </VendorDashboardShell>
  );
}
