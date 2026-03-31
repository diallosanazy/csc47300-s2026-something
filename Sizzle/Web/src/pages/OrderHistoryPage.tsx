import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerAccountShell } from '../components/CustomerAccountShell';
import { getMyOrders } from '../lib/services/orders';
import { supabase } from '../lib/supabaseClient';

const THUMB_COLORS: Record<string, string> = {
  "Marco's Street Tacos": '#1C1917',
  'Bao House': '#2C3E2E',
  'La Cocina Arepas': '#56411f',
  "Niko's Greek Cart": '#2f3a49',
  'Seoul Bowl': '#1a2340',
  'Saffron Wraps': '#4a2c10',
};

const THUMB_LABELS: Record<string, string> = {
  "Marco's Street Tacos": 'TACOS',
  'Bao House': 'BAO',
  'La Cocina Arepas': 'AREPAS',
  "Niko's Greek Cart": 'GYROS',
  'Seoul Bowl': 'BOWL',
  'Saffron Wraps': 'WRAPS',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatItems(order: any) {
  return (order.order_items ?? []).map((i: any) => `${i.quantity}× ${i.name_snapshot}`).join(', ');
}

export function OrderHistoryPage() {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(() => {});
    const channel = supabase
      .channel('my-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refresh().catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((o) => ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)),
    [orders]
  );
  const pastOrders = useMemo(
    () => orders.filter((o) => !['placed', 'accepted', 'preparing', 'ready'].includes(o.status)),
    [orders]
  );

  if (!loading && orders.length === 0) {
    return (
      <CustomerAccountShell active="history" title="Order History" subtitle="No orders yet">
        <div style={{ alignItems: 'center', border: '1.5px dashed #E8E6E1', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12, padding: '60px 24px', textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#C5C5C0" strokeWidth="1.5" />
            <path d="M7 8H17M7 12H13" stroke="#C5C5C0" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div style={{ color: '#1C1917', fontSize: 16, fontWeight: 600 }}>No orders yet</div>
          <div style={{ color: '#9C9890', fontSize: 14, maxWidth: 280 }}>When you place your first order, it'll appear here along with reorder and review options.</div>
          <Link className="link-reset" to="/search" style={{ background: '#FF6B2C', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 8, padding: '12px 24px' }}>Browse vendors</Link>
        </div>
      </CustomerAccountShell>
    );
  }

  return (
    <CustomerAccountShell active="history" title="Orders" subtitle={loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}>
      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#9C9890', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Active</div>
          <div className="sync-order-list">
            {activeOrders.map((order) => {
              const vendorName = order.vendor?.name || 'Vendor';
              const thumbColor = THUMB_COLORS[vendorName] ?? '#333';
              const thumbLabel = THUMB_LABELS[vendorName] ?? vendorName.slice(0, 4).toUpperCase();
              const statusLabel =
                order.status === 'placed' ? 'Placed'
                  : order.status === 'accepted' ? 'Accepted'
                    : order.status === 'preparing' ? 'Preparing'
                      : order.status === 'ready' ? 'Ready'
                        : order.status;
              return (
                <div key={order.id} className="sync-order-item">
                  <div className="sync-order-thumb" style={{ background: thumbColor }}>{thumbLabel}</div>
                  <div className="sync-order-meta">
                    <h3>{vendorName}</h3>
                    <div className="sync-muted">{formatItems(order) || 'Order'}</div>
                    <div className="sync-muted" style={{ fontSize: 12, marginTop: 2 }}>#{String(order.id).slice(0, 8)}</div>
                  </div>
                  <div className="sync-order-side">
                    <div className="sync-order-side-column">
                      <strong>${((order.total_cents ?? 0) / 100).toFixed(2)}</strong>
                      <span className="sync-muted">{formatDate(order.placed_at)}</span>
                    </div>
                    <span className="sync-mini-btn" style={{ background: '#FFF4EE', color: '#FF6B2C', border: '1px solid #FFE2D4' }}>{statusLabel}</span>
                    <Link className="link-reset sync-mini-btn" to={`/order-tracking?id=${order.id}`}>Track</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past orders */}
      <div className="sync-order-list">
        {pastOrders.map((order) => {
          const vendorName = order.vendor?.name || 'Vendor';
          const thumbColor = THUMB_COLORS[vendorName] ?? '#333';
          const thumbLabel = THUMB_LABELS[vendorName] ?? vendorName.slice(0, 4).toUpperCase();
          const isReviewed = reviewed.has(order.id);
          return (
            <div key={order.id} className="sync-order-item">
              <div className="sync-order-thumb" style={{ background: thumbColor }}>{thumbLabel}</div>
              <div className="sync-order-meta">
                <h3>{vendorName}</h3>
                <div className="sync-muted">{formatItems(order) || 'Order'}</div>
                <div className="sync-muted" style={{ fontSize: 12, marginTop: 2 }}>#{String(order.id).slice(0, 8)}</div>
              </div>
              <div className="sync-order-side">
                <div className="sync-order-side-column">
                  <strong>${((order.total_cents ?? 0) / 100).toFixed(2)}</strong>
                  <span className="sync-muted">{formatDate(order.placed_at)}</span>
                </div>
                <Link className="link-reset sync-mini-btn accent" to={`/vendor?id=${order.vendor_id}`}>Reorder</Link>
                {isReviewed ? (
                  <span className="sync-mini-btn disabled">Reviewed</span>
                ) : (
                  <Link
                    className="link-reset sync-mini-btn"
                    to={`/write-review?id=${encodeURIComponent(String(order.id))}`}
                    onClick={() => setReviewed((s) => new Set(s).add(order.id))}
                  >
                    Review
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CustomerAccountShell>
  );
}
