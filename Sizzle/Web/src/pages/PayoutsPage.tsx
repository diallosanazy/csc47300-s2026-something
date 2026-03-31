import { useState } from 'react';
import { VendorSettingsShell } from '../components/VendorSettingsShell';

export function PayoutsPage() {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [changingAccount, setChangingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState('');
  const [accountSaved, setAccountSaved] = useState(false);

  const handleRequest = () => {
    setRequesting(false);
    setRequested(true);
    setTimeout(() => setRequested(false), 4000);
  };

  const handleSaveAccount = () => {
    setChangingAccount(false);
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 3000);
  };

  return (
    <VendorSettingsShell section="payment">
      <div className="sync-row-title">Payment &amp; Payouts</div>

      {requested && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Payout of $847.20 requested. Funds arrive in 1–2 business days.
        </div>
      )}
      {accountSaved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Payout account updated.
        </div>
      )}

      <div className="sync-dark-card sync-section-card-lg sync-spread">
        <div className="sync-stack" style={{ gap: 8 }}>
          <div className="sync-label">Available Balance</div>
          <div style={{ fontSize: 44, lineHeight: '46px', fontWeight: 800, letterSpacing: '-0.04em' }}>$847.20</div>
          <div className="sync-muted">Next automatic payout: Thursday, Mar 27</div>
        </div>
        {requesting ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ color: '#cac2b7', fontSize: 13 }}>Request payout of $847.20?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setRequesting(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#ccc', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Cancel</button>
              <button onClick={handleRequest} style={{ background: '#FF6B2C', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Confirm</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRequesting(true)} className="link-reset sync-button" style={{ cursor: 'pointer', border: 'none' }}>
            Request Payout
          </button>
        )}
      </div>

      <div className="sync-row-card">
        <div className="sync-inline-actions">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⌂</div>
          <div className="sync-row-copy">
            <div className="sync-row-title">Chase Bank ···· 4829</div>
            <div className="sync-muted">Primary payout account</div>
          </div>
        </div>
        {changingAccount ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="New account number"
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', fontSize: 13, outline: 'none', padding: '8px 12px', width: 160 }}
            />
            <button onClick={handleSaveAccount} style={{ background: '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Save</button>
            <button onClick={() => setChangingAccount(false)} style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#6B6963', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setChangingAccount(true)} className="sync-row-action" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Change</button>
        )}
      </div>

      <div className="sync-card sync-table-card">
        <div className="sync-section-card" style={{ borderBottom: '1px solid #ece6dc' }}><div className="sync-metric-strong">Payout History</div></div>
        <div className="sync-history-row"><div><div className="sync-row-title">Mar 20, 2026</div><div className="sync-muted">Weekly payout · 47 orders</div></div><div className="sync-inline-actions"><strong>$1,284.00</strong><span className="sync-pill sync-pill-success">Paid</span></div></div>
        <div className="sync-history-row"><div><div className="sync-row-title">Mar 13, 2026</div><div className="sync-muted">Weekly payout · 52 orders</div></div><div className="sync-inline-actions"><strong>$1,416.50</strong><span className="sync-pill sync-pill-success">Paid</span></div></div>
        <div className="sync-history-row"><div><div className="sync-row-title">Mar 6, 2026</div><div className="sync-muted">Weekly payout · 38 orders</div></div><div className="sync-inline-actions"><strong>$987.00</strong><span className="sync-pill sync-pill-success">Paid</span></div></div>
      </div>
    </VendorSettingsShell>
  );
}
