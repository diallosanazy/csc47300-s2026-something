import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';

type Issue = 'late' | 'missing' | 'cancel' | null;

export function OrderHelpPage() {
  const { lastOrder } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const [activeIssue, setActiveIssue] = useState<Issue>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState('');
  const [creditClaimed, setCreditClaimed] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);

  const order = lastOrder ?? {
    orderId: 'SZ-4821',
    vendorName: "Marco's Street Tacos",
    items: [{ id: '1', name: 'Tacos Al Pastor', price: 9, quantity: 2 }, { id: '2', name: 'Churros', price: 7, quantity: 1 }],
    total: 28.69,
  };

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="sync-page">
      <header className="sync-topbar">
        <Brand className="sync-logo" titleClassName="" />
        <div />
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-grid sync-grid-main-aside">
          <section className="sync-stack">
            <div className="sync-title-group">
              <div className="sync-eyebrow">Order Support</div>
              <h1 className="sync-title">Need Help With Order #{order.orderId}?</h1>
              <div className="sync-subtitle">Choose the issue that best matches what went wrong and we'll guide you to the fastest fix.</div>
            </div>

            {/* Late order */}
            <div className="sync-row-card" style={activeIssue === 'late' ? { border: '1.5px solid #FF6B2C' } : {}}>
              <div className="sync-row-copy">
                <div className="sync-row-title">My order is running late</div>
                <div className="sync-muted">Get a live prep update and message the vendor before you head over.</div>
                {activeIssue === 'late' && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ background: '#FFF4EE', borderRadius: 10, color: '#C05020', fontSize: 13, fontWeight: 500, padding: '10px 14px' }}>
                      {order.vendorName} is currently preparing your order. Estimated time: <strong>8–12 min</strong> from order time.
                    </div>
                    <Link className="link-reset" to={`/order-tracking?id=${encodeURIComponent(order.orderId)}`} style={{ color: '#FF6B2C', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
                      View live tracking →
                    </Link>
                  </div>
                )}
              </div>
              <button onClick={() => setActiveIssue(activeIssue === 'late' ? null : 'late')}
                style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap' }}>
                {activeIssue === 'late' ? 'Close' : 'Open'}
              </button>
            </div>

            {/* Missing items */}
            <div className="sync-row-card" style={activeIssue === 'missing' ? { border: '1.5px solid #FF6B2C' } : {}}>
              <div className="sync-row-copy">
                <div className="sync-row-title">Items were missing or incorrect</div>
                <div className="sync-muted">Tell us what's wrong and request a refund or credit for affected items.</div>
                {activeIssue === 'missing' && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ color: '#6B6963', fontSize: 13 }}>Which items had an issue?</div>
                    {order.items.map((item) => (
                      <label key={item.id} style={{ alignItems: 'center', cursor: 'pointer', display: 'flex', fontSize: 14, gap: 8 }}>
                        <input type="checkbox" />
                        {item.quantity}× {item.name}
                      </label>
                    ))}
                    {creditClaimed ? (
                      <div style={{ background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', fontSize: 13, fontWeight: 500, padding: '10px 14px' }}>
                        Credit request submitted. You'll receive a $6.00 account credit within 24 hours.
                      </div>
                    ) : (
                      <button onClick={() => setCreditClaimed(true)}
                        style={{ alignSelf: 'flex-start', background: '#FF6B2C', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '9px 18px' }}>
                        Request $6.00 credit
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setActiveIssue(activeIssue === 'missing' ? null : 'missing')}
                style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap' }}>
                {activeIssue === 'missing' ? 'Close' : 'Open'}
              </button>
            </div>

            {/* Cancel */}
            <div className="sync-row-card" style={activeIssue === 'cancel' ? { border: '1.5px solid #FF6B2C' } : {}}>
              <div className="sync-row-copy">
                <div className="sync-row-title">I need to cancel this order</div>
                <div className="sync-muted">See whether the vendor has started prep and whether cancellation is still available.</div>
                {activeIssue === 'cancel' && (
                  <div style={{ marginTop: 12 }}>
                    {cancelRequested ? (
                      <div style={{ background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', fontSize: 13, fontWeight: 500, padding: '10px 14px' }}>
                        Cancellation request sent to {order.vendorName}. You'll be notified of the outcome within 2 minutes.
                      </div>
                    ) : (
                      <>
                        <div style={{ background: '#FFF4EE', borderRadius: 10, color: '#C05020', fontSize: 13, padding: '10px 14px', marginBottom: 10 }}>
                          This vendor has started preparing your order. Cancellation may not be possible at this stage.
                        </div>
                        <button onClick={() => setCancelRequested(true)}
                          style={{ background: '#C0392B', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '9px 18px' }}>
                          Request cancellation anyway
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setActiveIssue(activeIssue === 'cancel' ? null : 'cancel')}
                style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap' }}>
                {activeIssue === 'cancel' ? 'Close' : 'Check'}
              </button>
            </div>

            <div className="sync-dark-card sync-section-card">
              <div className="sync-label">Instant Resolution</div>
              <div className="sync-row-title" style={{ marginTop: 12 }}>You're eligible for a $6.00 credit if an item is missing.</div>
              <div className="sync-subtitle" style={{ color: '#cfc7bc', maxWidth: 'none' }}>Choose "Items were missing or incorrect" and we'll prefill this order so you can submit it in under a minute.</div>
            </div>
          </section>

          <aside className="sync-stack">
            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Order Snapshot</div>
              <div className="sync-kv" style={{ marginTop: 16 }}>
                <span className="key">{order.vendorName} · {itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                <span />
                <span className="key">Order</span>
                <span style={{ fontWeight: 700 }}>#{order.orderId}</span>
                <span className="key">Status</span>
                <span style={{ color: '#d16d42', fontWeight: 700 }}>Preparing</span>
                <span className="key">Pickup ETA</span>
                <span style={{ fontWeight: 700 }}>8–12 min</span>
                <span className="key">Total</span>
                <span style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Talk to the vendor</div>
              <div className="sync-subtitle" style={{ maxWidth: 'none' }}>
                If you're already on the way, message {order.vendorName.split(' ')[0]}'s team before requesting a refund.
              </div>
              {messageSent ? (
                <div style={{ background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', fontSize: 13, fontWeight: 500, marginTop: 16, padding: '10px 14px' }}>
                  Message sent to {order.vendorName}.
                </div>
              ) : (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    placeholder={`Message ${order.vendorName}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', fontSize: 13, padding: '10px 12px', resize: 'none', height: 72, outline: 'none' }}
                  />
                  <button
                    onClick={() => message.trim() && setMessageSent(true)}
                    style={{ alignSelf: 'flex-start', background: '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: message.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, opacity: message.trim() ? 1 : 0.5, padding: '9px 18px' }}>
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
