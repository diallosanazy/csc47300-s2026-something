import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';

type Status = 'Preparing' | 'Ready' | 'Done';

export function OrderDetailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('Preparing');

  const advance = () => {
    if (status === 'Preparing') setStatus('Ready');
    else if (status === 'Ready') { setStatus('Done'); setTimeout(() => navigate('/orders'), 1200); }
  };

  const statusColor = status === 'Ready' ? '#2D9F6F' : status === 'Done' ? '#9C9890' : '#FF6B2C';

  return (
    <VendorDashboardShell active="orders" title="Order #48">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Link className="link-reset" to="/orders" style={{ color: '#9C9890', fontSize: 14 }}>← Orders</Link>
        <span style={{ color: '#C5C5C0', fontSize: 14 }}>/</span>
        <span style={{ color: '#1C1917', fontSize: 14, fontWeight: 700 }}>Order #48</span>
      </div>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 24 }}>
        <span className="sync-pill sync-pill-status" style={{ background: status === 'Done' ? '#F0EFEC' : status === 'Ready' ? '#EBF8F1' : '#FFF4EE', color: statusColor }}>
          {status}
        </span>
        <span style={{ color: '#9C9890', fontSize: 13 }}>Received 2 minutes ago · Walk-in customer</span>
      </div>

      <div className="sync-grid sync-grid-main-aside">
        <section className="sync-stack">
          <div className="sync-card sync-section-card">
            <div className="sync-row-title">Items</div>
            <div className="sync-kv" style={{ marginTop: 18 }}>
              <span><strong>2× Tacos Al Pastor</strong><br /><span className="sync-muted">No onion</span></span><strong>$18.00</strong>
              <span><strong>1× Elote</strong></span><strong>$6.00</strong>
              <span style={{ fontSize: 18, fontWeight: 800 }}>Total</span><strong style={{ fontSize: 18, color: '#d16d42' }}>$24.00</strong>
            </div>
          </div>
          <div className="sync-card sync-section-card">
            <div className="sync-row-title">Special Instructions</div>
            <div className="sync-message-box" style={{ marginTop: 16, background: '#fbf7f1' }}>
              Extra salsa on the side, extra spicy please
            </div>
          </div>
        </section>

        <aside className="sync-stack">
          <div className="sync-card sync-section-card">
            <div className="sync-row-title">Order Info</div>
            <div className="sync-kv" style={{ marginTop: 16 }}>
              <span className="key">Order #</span><span style={{ color: '#d16d42', fontWeight: 700 }}>#48</span>
              <span className="key">Time</span><span style={{ fontWeight: 700 }}>2 min ago</span>
              <span className="key">Pickup</span><span style={{ fontWeight: 700 }}>ASAP</span>
              <span className="key">Customer</span><span style={{ fontWeight: 700 }}>Walk-in</span>
              <span className="key">Payment</span><span style={{ fontWeight: 700 }}>Paid · Visa</span>
            </div>
          </div>
          <div className="sync-card sync-section-card">
            <div className="sync-row-title">Actions</div>
            <div className="sync-stack" style={{ marginTop: 16 }}>
              {status !== 'Done' ? (
                <button
                  onClick={advance}
                  style={{ background: status === 'Ready' ? '#2D9F6F' : '#FF6B2C', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '12px 0', width: '100%' }}
                >
                  {status === 'Preparing' ? 'Mark as Ready' : 'Mark as Done'}
                </button>
              ) : (
                <div style={{ background: '#F0EFEC', borderRadius: 10, color: '#9C9890', fontSize: 14, fontWeight: 600, padding: '12px 0', textAlign: 'center' }}>
                  Order Complete
                </div>
              )}
              {status !== 'Done' && (
                <Link className="link-reset" to="/reject-order" style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 10, color: '#6B6963', display: 'block', fontSize: 14, fontWeight: 600, padding: '12px 0', textAlign: 'center' }}>
                  Cancel Order
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </VendorDashboardShell>
  );
}
