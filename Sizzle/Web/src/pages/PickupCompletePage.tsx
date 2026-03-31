import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { getOrderById } from '../lib/services/orders';

export function PickupCompletePage() {
  const [params] = useSearchParams();
  const { lastOrder } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  const orderIdParam = params.get('id');
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderById>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!orderIdParam) return;
      try {
        const data = await getOrderById(orderIdParam);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setOrder(null);
      }
    })();
    return () => { cancelled = true; };
  }, [orderIdParam]);

  const vendorName = order?.vendor?.name || lastOrder?.vendorName || "Marco's Street Tacos";
  const orderId = String(order?.id || lastOrder?.orderId || 'SZ-4821');
  const total = ((order?.total_cents ?? 0) / 100) || lastOrder?.total || 28.69;
  const itemCount =
    (order?.order_items?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0)
    || (lastOrder?.items.reduce((s, i) => s + i.quantity, 0) ?? 2);

  return (
    <div className="sync-page">
      <header className="sync-topbar">
        <Brand className="sync-logo" titleClassName="" />
        <div></div>
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-grid sync-grid-main-aside">
          <section className="sync-stack">
            <div className="sync-title-group">
              <div className="sync-eyebrow" style={{ color: '#4ba775' }}>Pickup Complete</div>
              <h1 className="sync-title">You're All Set</h1>
              <div className="sync-subtitle">Order #{orderId} has been marked as picked up. Enjoy your meal, and come back anytime for a one-tap reorder.</div>
            </div>
            <div className="sync-card sync-section-card">
              <div className="sync-inline-actions" style={{ marginBottom: 18 }}><span className="sync-badge-check">✓</span><span className="sync-row-title">Picked up successfully</span></div>
              <div className="sync-split-card">
                <div style={{ background: '#f7f3ec', borderRadius: 16, padding: '18px 16px' }}>
                  <div className="sync-label">Vendor</div>
                  <div className="sync-row-title" style={{ marginTop: 8 }}>{vendorName}</div>
                </div>
                <div style={{ background: '#f7f3ec', borderRadius: 16, padding: '18px 16px' }}>
                  <div className="sync-label">Order Total</div>
                  <div className="sync-row-title" style={{ marginTop: 8 }}>${total.toFixed(2)}</div>
                  <div className="sync-muted">{itemCount} item{itemCount !== 1 ? 's' : ''} picked up successfully</div>
                </div>
              </div>
              <div className="sync-inline-actions" style={{ marginTop: 18 }}>
                <Link className="link-reset sync-button" to={`/write-review?id=${encodeURIComponent(orderId)}`}>Leave a Review</Link>
                <Link className="link-reset sync-button-outline" to="/reorder-review">Reorder This Meal</Link>
              </div>
            </div>
            <div className="sync-dark-card sync-section-card"><div className="sync-label">Need a receipt?</div><div className="sync-row-title" style={{ marginTop: 12 }}>We emailed your order summary and saved it in your history.</div></div>
          </section>
          <aside className="sync-stack">
            <div className="sync-card sync-section-card"><div className="sync-row-title">What's next</div><div className="sync-subtitle" style={{ maxWidth: 'none' }}>Rate your food, save the vendor, or reorder this exact meal the next time you need a fast pickup.</div></div>
            <div className="sync-card sync-section-card"><div className="sync-row-title">Need help after pickup?</div><div className="sync-subtitle" style={{ maxWidth: 'none' }}>Report a missing item or quality issue within 24 hours.</div><div style={{ marginTop: 16 }}><Link className="link-reset sync-button-outline" to="/order-help">Get Support</Link></div></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
