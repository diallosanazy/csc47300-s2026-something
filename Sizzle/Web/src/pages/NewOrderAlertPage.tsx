import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';

export function NewOrderAlertPage() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <VendorDashboardShell active="dashboard" title="">
        <div style={{ color: '#9C9890', fontSize: 15, padding: '60px 0', textAlign: 'center' }}>
          Order declined. <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: '#FF6B2C', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: 0 }}>View orders</button>
        </div>
      </VendorDashboardShell>
    );
  }

  return (
    <div className="sync-alert-layout">
      <VendorDashboardShell active="dashboard" title="">
        <div style={{ opacity: 0.16 }}>
          <h1 className="sync-title">Good afternoon, Marco</h1>
        </div>
      </VendorDashboardShell>
      <div className="sync-dimmed" />
      <div className="sync-alert-modal">
        <div className="sync-alert-top">
          <div className="sync-inline-actions">
            <div className="sync-logo-icon" style={{ background: 'rgba(255,255,255,.15)' }}>⌂</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>New Order!</div>
              <div style={{ opacity: 0.8 }}>Order #49 · just now</div>
            </div>
          </div>
        </div>
        <div className="sync-alert-body">
          <div className="sync-label">Items Ordered</div>
          <div className="sync-kv">
            <span>2× Tacos Al Pastor</span><strong>$18.00</strong>
            <span>1× Elote</span><strong>$6.00</strong>
          </div>
          <div className="sync-soft-card" style={{ padding: '10px 14px', color: '#857d72' }}>
            Note: Extra salsa, no cilantro
          </div>
          <div className="sync-line" />
          <div className="sync-spread">
            <div>
              <div className="sync-muted">Total</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>$24.00</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="sync-muted">Pickup</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>ASAP · 10–15 min</div>
            </div>
          </div>
          <div className="sync-inline-actions">
            <button
              className="link-reset sync-button"
              style={{ flex: 1, cursor: 'pointer', border: 'none' }}
              onClick={() => navigate('/order-detail')}
            >
              Accept Order
            </button>
            <button
              className="link-reset sync-button-outline"
              style={{ flex: 1, cursor: 'pointer', background: 'none' }}
              onClick={() => setDismissed(true)}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
