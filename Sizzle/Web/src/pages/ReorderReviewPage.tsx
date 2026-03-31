import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';

const SERVICE_FEE = 1.5;
const TAX_RATE = 0.0875;

export function ReorderReviewPage() {
  const navigate = useNavigate();
  const { orderHistory, addItem } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  // Use the most recent past order as the base for reordering
  const baseOrder = orderHistory[0];

  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries((baseOrder?.items ?? []).map((item) => [item.id, item.quantity]))
  );

  if (!baseOrder) {
    return (
      <div className="sync-page">
        <header className="sync-topbar sync-topbar-center">
          <Link className="link-reset sync-back-link" to="/order-history">← Order History</Link>
          <Link className="link-reset sync-logo" to="/"><span className="sync-logo-icon">C</span><span>Sizzle</span></Link>
          <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
        </header>
        <main className="sync-content" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div className="sync-title">No order to reorder</div>
          <div className="sync-subtitle" style={{ marginTop: 12 }}>Place an order first, then come back to reorder it.</div>
          <div style={{ marginTop: 24 }}><Link className="link-reset sync-button" to="/search">Browse Vendors</Link></div>
        </main>
      </div>
    );
  }

  const activeItems = baseOrder.items.filter((item) => (quantities[item.id] ?? 0) > 0);

  const subtotal = activeItems.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + SERVICE_FEE + tax;

  const setQty = (id: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const handlePlaceOrder = () => {
    if (activeItems.length === 0) return;
    activeItems.forEach((item) => {
      const qty = quantities[item.id] ?? 0;
      for (let i = 0; i < qty; i++) {
        addItem(baseOrder.vendorId, baseOrder.vendorName, { name: item.name, price: item.price });
      }
    });
    navigate('/cart');
  };

  return (
    <div className="sync-page">
      <header className="sync-topbar sync-topbar-center">
        <Link className="link-reset sync-back-link" to="/order-history">← Order History</Link>
        <Link className="link-reset sync-logo" to="/"><span className="sync-logo-icon">C</span><span>Sizzle</span></Link>
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px', alignItems: 'start', maxWidth: 940, margin: '0 auto', gap: 36 }}>
          <section>
            <div className="sync-title-group">
              <h1 className="sync-title">Reorder from {baseOrder.vendorName}</h1>
              <div className="sync-subtitle">Review your previous items before reordering</div>
            </div>
            <div className="sync-card sync-section-card" style={{ marginTop: 24 }}>
              <div className="sync-label">Your previous order</div>
              {baseOrder.items.map((item) => {
                const qty = quantities[item.id] ?? 0;
                const lineTotal = item.price * qty;
                return (
                  <div key={item.id} className="sync-quantity-row" style={{ marginTop: 14 }}>
                    <div className="sync-stepper">
                      <button onClick={() => setQty(item.id, qty - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, padding: '0 4px' }}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(item.id, qty + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, padding: '0 4px' }}>+</button>
                    </div>
                    <div>
                      <div className="sync-row-title">{item.name}</div>
                    </div>
                    <strong>${lineTotal.toFixed(2)}</strong>
                    <button onClick={() => setQty(item.id, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>🗑</button>
                  </div>
                );
              })}
            </div>
            <Link className="sync-dashed-add link-reset" to={`/vendor?id=${baseOrder.vendorId}`}>+ Add more items from {baseOrder.vendorName}</Link>
          </section>
          <aside className="sync-card sync-section-card">
            <div className="sync-row-title">Order Summary</div>
            <div className="sync-kv" style={{ marginTop: 18 }}>
              {activeItems.map((item) => (
                <>
                  <span key={`${item.id}-k`} className="key">{quantities[item.id]}× {item.name}</span>
                  <span key={`${item.id}-v`}>${(item.price * (quantities[item.id] ?? 0)).toFixed(2)}</span>
                </>
              ))}
            </div>
            <div className="sync-line" style={{ margin: '16px 0' }} />
            <div className="sync-kv">
              <span className="key">Subtotal</span><span>${subtotal.toFixed(2)}</span>
              <span className="key">Service fee</span><span>${SERVICE_FEE.toFixed(2)}</span>
              <span className="key">Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="sync-line" style={{ margin: '16px 0' }} />
            <div className="sync-spread"><span style={{ fontSize: 18, fontWeight: 800 }}>Total</span><strong style={{ fontSize: 18 }}>${total.toFixed(2)}</strong></div>
            <div className="sync-label" style={{ marginTop: 20 }}>Pickup Time</div>
            <div className="sync-inline-actions" style={{ marginTop: 10 }}>
              <span className="sync-button-dark" style={{ flex: 1 }}>ASAP</span>
              <span className="sync-button-outline" style={{ flex: 1, opacity: .45 }}>Schedule</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                onClick={handlePlaceOrder}
                disabled={activeItems.length === 0}
                className="link-reset sync-button"
                style={{ border: 'none', cursor: activeItems.length === 0 ? 'not-allowed' : 'pointer', opacity: activeItems.length === 0 ? 0.5 : 1, width: '100%' }}
              >
                Place Order · ${total.toFixed(2)}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
