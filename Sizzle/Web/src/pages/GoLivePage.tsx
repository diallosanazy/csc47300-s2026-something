import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { useAuth } from '../lib/auth';
import { setVendorLive, updateVendor } from '../lib/services/vendors';

export function GoLivePage() {
  const { vendor, refreshVendor } = useAuth();

  const [open, setOpen] = useState(true);
  const [address, setAddress] = useState('24th St & Mission St');
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState(address);
  const [closeEarly, setCloseEarly] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (vendor) {
      setOpen(vendor.is_live);
      setAddress(vendor.location_text || '24th St & Mission St');
      setDraftAddress(vendor.location_text || '24th St & Mission St');
    }
  }, [vendor]);

  const handleToggleLive = async (live: boolean) => {
    setOpen(live);
    if (vendor) {
      await setVendorLive(vendor.id, live);
      await refreshVendor();
    }
  };

  const saveAddress = async () => {
    setAddress(draftAddress);
    setEditingAddress(false);
    if (vendor) {
      await updateVendor(vendor.id, { location_text: draftAddress });
      await refreshVendor();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <VendorDashboardShell active="dashboard" title="Go Live">
      {saved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Location updated successfully.
        </div>
      )}

      {/* Open/Closed toggle */}
      <div className="sync-card sync-section-card-lg" style={{ border: `2px solid ${open ? '#5ab287' : '#E8E6E1'}` }}>
        <div className="sync-spread">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{open ? 'You are currently Open' : 'You are currently Closed'}</div>
            <div className="sync-muted">{open ? 'Customers can find you and place orders.' : 'You are hidden from search and cannot receive orders.'}</div>
          </div>
          <button onClick={() => handleToggleLive(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div className={`sync-toggle ${open ? 'on' : 'off'}`} style={{ width: 66, height: 36, padding: 3 }}>
              <span className="dot" style={{ width: 30, height: 30 }} />
            </div>
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="sync-card sync-section-card-lg">
        <div className="sync-spread" style={{ alignItems: 'flex-start' }}>
          <div className="sync-stack" style={{ gap: 18, flex: 1 }}>
            <div className="sync-row-title">Current Location</div>
            <div className="sync-inline-actions" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 220, height: 140, borderRadius: 18, background: 'linear-gradient(90deg,#e6e0d3 47%,#f9f6ef 47%,#f9f6ef 53%,#e6e0d3 53%), linear-gradient(#e6e0d3 46%,#f9f6ef 46%,#f9f6ef 54%,#e6e0d3 54%)', position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', left: 92, top: 36, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '6px 10px', fontSize: 11, fontWeight: 700 }}>You're here</span>
              </div>
              <div className="sync-stack" style={{ gap: 8 }}>
                <div className="sync-label">Current address</div>
                {editingAddress ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      value={draftAddress}
                      onChange={(e) => setDraftAddress(e.target.value)}
                      style={{ background: '#F8F6F1', border: '1.5px solid #1C1917', borderRadius: 8, color: '#1C1917', fontSize: 14, outline: 'none', padding: '10px 12px', width: 220 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveAddress} style={{ background: '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Save</button>
                      <button onClick={() => setEditingAddress(false)} style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#6B6963', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sync-row-title">{address}</div>
                    <div className="sync-muted">Mission District, San Francisco</div>
                    <div className="sync-inline-actions" style={{ marginTop: 10 }}>
                      <button onClick={() => { setDraftAddress(address); setEditingAddress(true); }} style={{ background: '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 14px' }}>
                        Edit Address
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="sync-card sync-section-card-lg">
        <div className="sync-spread">
          <div className="sync-row-title">Today's Hours</div>
          <Link className="link-reset" to="/business-hours" style={{ color: '#FF6B2C', fontSize: 14, fontWeight: 600 }}>Edit hours</Link>
        </div>
        <div className="sync-line" style={{ margin: '18px 0' }} />
        <div className="sync-spread">
          <div className="sync-inline-actions">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: open && !closeEarly ? '#5ab287' : '#C5C5C0' }} />
            <span>{open && !closeEarly ? 'Open until 9:00 PM' : 'Closed for today'}</span>
          </div>
          <button onClick={() => setCloseEarly((c) => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div className={`sync-toggle ${closeEarly ? 'on' : 'off'}`}><span className="dot" /></div>
          </button>
        </div>
        <div className="sync-muted" style={{ marginTop: 14 }}>{closeEarly ? 'Closed early today — toggle off to reopen' : 'Close early today'}</div>
      </div>
    </VendorDashboardShell>
  );
}
