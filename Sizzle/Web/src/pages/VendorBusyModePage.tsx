import { useState } from 'react';
import { VendorDashboardShell } from '../components/VendorDashboardShell';

const REASONS = ['High order volume right now', 'Running low on ingredients', 'Short break — back soon', 'Equipment issue'];
const REOPEN_TIMES = ['15 minutes', '30 minutes', '45 minutes', '1 hour', '2 hours'];

export function VendorBusyModePage() {
  const [paused, setPaused] = useState(true);
  const [reason, setReason] = useState(REASONS[0]);
  const [reopenIn, setReopenIn] = useState(REOPEN_TIMES[2]);
  const [preOrders, setPreOrders] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <VendorDashboardShell active="orders" title="Busy Mode" actions={
      <button onClick={save} style={{ background: '#1C1917', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px' }}>
        Save Changes
      </button>
    }>
      {saved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Busy mode settings saved.
        </div>
      )}

      <div className="sync-dark-card sync-section-card-lg sync-spread">
        <div className="sync-stack" style={{ gap: 8 }}>
          <div className="sync-label">Incoming Orders</div>
          <div style={{ fontSize: 22, lineHeight: '28px', fontWeight: 800 }}>
            {paused ? `Paused — new orders disabled for ${reopenIn}` : 'Accepting orders normally'}
          </div>
          <div className="sync-subtitle" style={{ color: '#cac2b7', maxWidth: 'none' }}>
            {paused ? 'Existing orders stay visible. Customers can still find you, but checkout is disabled.' : 'Customers can browse your menu and place orders.'}
          </div>
        </div>
        <button onClick={() => setPaused((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div className={`sync-toggle ${paused ? 'on' : 'off'}`} style={{ width: 84, height: 44, padding: 4 }}>
            <span className="dot" style={{ width: 36, height: 36 }} />
          </div>
        </button>
      </div>

      {paused && (
        <div className="sync-grid sync-grid-2">
          <div className="sync-card sync-section-card">
            <div className="sync-label">Reason shown to customers</div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 14, marginTop: 10, outline: 'none', padding: '10px 12px', width: '100%' }}
            >
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div className="sync-muted" style={{ marginTop: 8 }}>This is what customers see on your vendor page.</div>
          </div>
          <div className="sync-card sync-section-card">
            <div className="sync-label">Reopen in</div>
            <select
              value={reopenIn}
              onChange={(e) => setReopenIn(e.target.value)}
              style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 14, marginTop: 10, outline: 'none', padding: '10px 12px', width: '100%' }}
            >
              {REOPEN_TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="sync-muted" style={{ marginTop: 8 }}>Customers see this estimated reopen time.</div>
          </div>
        </div>
      )}

      <div className="sync-grid sync-grid-main-aside">
        <div className="sync-card sync-section-card">
          <div className="sync-row-title">Customer-facing preview</div>
          <div className="sync-soft-card" style={{ marginTop: 16, padding: '20px 18px' }}>
            {paused ? (
              <>
                <div className="sync-row-title">Temporarily paused</div>
                <div className="sync-muted">Marco's Street Tacos is {reason.toLowerCase()} and plans to reopen in {reopenIn}.</div>
              </>
            ) : (
              <>
                <div className="sync-row-title" style={{ color: '#2D9F6F' }}>Open now</div>
                <div className="sync-muted">Marco's Street Tacos is accepting orders.</div>
              </>
            )}
          </div>
          {paused && (
            <div className="sync-inline-actions" style={{ marginTop: 14 }}>
              <button
                onClick={() => setPreOrders((p) => !p)}
                style={{ background: preOrders ? '#FF6B2C' : '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '9px 16px' }}
              >
                {preOrders ? 'Pre-Orders On' : 'Enable Pre-Orders'}
              </button>
              <button
                onClick={() => { setPaused(false); }}
                style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#6B6963', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '9px 16px' }}
              >
                Reopen Now
              </button>
            </div>
          )}
        </div>
        <div className="sync-card sync-section-card">
          <div className="sync-row-title">While paused</div>
          <div className="sync-subtitle" style={{ maxWidth: 'none' }}>Current orders continue as normal. Ready notifications still go out. Analytics keep tracking sales from existing tickets.</div>
        </div>
      </div>
    </VendorDashboardShell>
  );
}
