import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';

const REASONS = [
  { id: 'sold-out', label: 'Item sold out after order was placed', message: "We're sorry, but one of the items in your order just sold out and we can't complete this ticket. Your payment will be refunded automatically within 3–5 business days." },
  { id: 'kitchen', label: 'Kitchen issue or equipment down', message: "We're sorry, but we've had an unexpected kitchen issue and can't complete your order right now. Your payment will be refunded within 3–5 business days." },
  { id: 'early-close', label: 'Unexpected early close', message: "We're sorry, but we had to close early today and can't fulfill your order. Your payment will be refunded within 3–5 business days." },
  { id: 'other', label: 'Something else', message: "We're sorry, but we're unable to fulfill your order at this time. Your payment will be refunded within 3–5 business days." },
];

export function RejectOrderPage() {
  const navigate = useNavigate();
  const [reasonId, setReasonId] = useState(REASONS[0].id);
  const [message, setMessage] = useState(REASONS[0].message);
  const [sent, setSent] = useState(false);

  const selectReason = (r: typeof REASONS[0]) => {
    setReasonId(r.id);
    setMessage(r.message);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => navigate('/orders'), 1500);
  };

  return (
    <VendorDashboardShell active="orders" title="Reject Order">
      {sent ? (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 12, color: '#2D6A4F', display: 'flex', fontSize: 15, fontWeight: 600, gap: 10, padding: '16px 20px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Cancellation sent. Redirecting to Orders…
        </div>
      ) : (
        <div className="sync-grid sync-grid-main-aside">
          <section className="sync-stack">
            <div className="sync-title-group">
              <div className="sync-eyebrow">Order #48</div>
              <div className="sync-subtitle">Let the customer know right away why this order can't be fulfilled.</div>
            </div>
            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Select a reason</div>
              <div className="sync-list-choice" style={{ marginTop: 16 }}>
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectReason(r)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
                  >
                    <div className={`sync-choice${r.id === reasonId ? ' active' : ''}`}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Message the customer</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 10, color: '#1C1917', fontSize: 14, lineHeight: '22px', marginTop: 16, outline: 'none', padding: '14px 16px', resize: 'vertical', width: '100%', minHeight: 100, boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={handleSend}
              style={{ alignSelf: 'flex-start', background: '#C0392B', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '12px 24px' }}
            >
              Send Cancellation
            </button>
          </section>
          <aside className="sync-stack">
            <div className="sync-dark-card sync-section-card">
              <div className="sync-label">Impact</div>
              <div className="sync-row-title" style={{ marginTop: 12 }}>Refund $24.00 to Visa automatically</div>
              <div className="sync-subtitle" style={{ color: '#cec7bc', maxWidth: 'none' }}>The customer gets a cancellation notice and a refund email immediately.</div>
            </div>
            <div className="sync-card sync-section-card">
              <div className="sync-row-title">Order summary</div>
              <div className="sync-subtitle" style={{ maxWidth: 'none', marginTop: 12 }}>2x Tacos Al Pastor, 1x Elote<br />Pickup: ASAP · Paid by Visa</div>
            </div>
          </aside>
        </div>
      )}
    </VendorDashboardShell>
  );
}
