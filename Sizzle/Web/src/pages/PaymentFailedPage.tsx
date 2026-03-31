import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../lib/auth';

export function PaymentFailedPage() {
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="sync-page">
      <header className="sync-topbar sync-topbar-center">
        <Brand className="sync-logo" titleClassName="" />
        <Link className="link-reset sync-back-link" to="/vendor">← Back to Marco's Street Tacos</Link>
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-grid sync-grid-main-aside">
          <section className="sync-stack">
            <div className="sync-title-group"><h1 className="sync-title">Payment Needs Attention</h1></div>
            <div className="sync-soft-card sync-section-card"><div className="sync-row-title">Your card was declined</div><div className="sync-subtitle" style={{ maxWidth: 'none' }}>Visa ending in 4829 needs to be updated before we can place this order. Your cart is saved and nothing has been charged.</div></div>
            <div className="sync-row-card"><div className="sync-row-copy"><div className="sync-row-title">Use a different card</div><div className="sync-muted">Switch to Mastercard ending in 1044 or add a new card.</div></div><Link className="link-reset sync-button-dark" to="/payment-methods">Choose Payment</Link></div>
            <div className="sync-row-card"><div className="sync-row-copy"><div className="sync-row-title">Update billing info</div><div className="sync-muted">Check the expiration date, ZIP code, or security code on your default card.</div></div><Link className="link-reset sync-button-outline" to="/payment-methods">Edit Card</Link></div>
            <div className="sync-card sync-section-card">
              <div className="sync-label">Still want these items?</div>
              <div className="sync-stack" style={{ gap: 10, marginTop: 14 }}>
                <div className="sync-spread"><div><div className="sync-row-title">2x Tacos Al Pastor</div><div className="sync-muted">No onion</div></div><strong>$18.00</strong></div>
                <div className="sync-spread"><div className="sync-row-title">1x Churros</div><strong>$7.00</strong></div>
              </div>
            </div>
          </section>
          <aside className="sync-stack">
            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Order Summary</div>
              <div className="sync-kv" style={{ marginTop: 16 }}><span className="key">Subtotal</span><span>$25.00</span><span className="key">Service fee</span><span>$1.50</span><span className="key">Tax</span><span>$2.19</span></div>
              <div className="sync-line" style={{ margin: '16px 0 12px' }}></div>
              <div className="sync-spread"><span style={{ fontSize: 22, fontWeight: 800 }}>Total</span><span style={{ fontSize: 22, fontWeight: 800 }}>$28.69</span></div>
            </div>
            <div className="sync-dark-card sync-section-card"><div className="sync-label">Recommended Next Step</div><div className="sync-row-title" style={{ marginTop: 10 }}>Swap payment method and place the order in one tap.</div></div>
            <Link className="link-reset sync-button" to="/payment-methods">Try Another Payment Method</Link>
            <Link className="link-reset sync-button-outline" to="/cart">Save Cart For Later</Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
