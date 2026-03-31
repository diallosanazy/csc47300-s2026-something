import { useEffect, useState } from 'react';
import { CustomerAccountShell } from '../components/CustomerAccountShell';
import { useAuth } from '../lib/auth';
import { updateProfile } from '../lib/services/auth';
import { getMyFavorites } from '../lib/services/favorites';
import { getMyOrders } from '../lib/services/orders';

export function UserAccountPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [draft, setDraft] = useState(form);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ orders: 0, favorites: 0, spent: 0 });

  // Load profile data
  useEffect(() => {
    if (profile) {
      const names = (profile.full_name || '').split(' ');
      const f = {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
      };
      setForm(f);
      setDraft(f);
    }
  }, [profile, user]);

  // Load stats
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getMyOrders().catch(() => [] as any[]),
      getMyFavorites().catch(() => [] as any[]),
    ]).then(([orders, favs]) => {
      let totalCents = 0;
      for (const o of orders) totalCents += (o as any).total_cents || 0;
      const spent = totalCents / 100;
      setStats({ orders: orders.length, favorites: favs.length, spent });
    });
  }, [user]);

  const handleEdit = () => { setDraft(form); setEditing(true); setSaved(false); };
  const handleCancel = () => { setEditing(false); setDraft(form); };
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: `${draft.firstName} ${draft.lastName}`.trim(),
        email: draft.email,
        phone: draft.phone || null,
      });
      await refreshProfile();
      setForm(draft);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const actions = editing ? (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={handleCancel} style={{ background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 10, color: '#9C9890', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px' }}>Cancel</button>
      <button onClick={handleSave} style={{ background: '#1C1917', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px', opacity: saving ? 0.6 : 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
    </div>
  ) : (
    <button onClick={handleEdit} style={{ background: '#1C1917', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px' }}>Edit Profile</button>
  );

  return (
    <CustomerAccountShell active="info" title="Personal Info" actions={actions}>
      {saved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, marginBottom: 24, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Profile updated successfully.
        </div>
      )}
      <div className="account-form-grid">
        <label className="account-field">
          <span className="sync-label">First Name</span>
          <input className="account-input" value={editing ? draft.firstName : form.firstName}
            onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
            readOnly={!editing} style={editing ? { borderColor: '#1C1917' } : undefined} />
        </label>
        <label className="account-field">
          <span className="sync-label">Last Name</span>
          <input className="account-input" value={editing ? draft.lastName : form.lastName}
            onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
            readOnly={!editing} style={editing ? { borderColor: '#1C1917' } : undefined} />
        </label>
        <label className="account-field full">
          <span className="sync-label">Email</span>
          <input className="account-input" value={editing ? draft.email : form.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            readOnly={!editing} style={editing ? { borderColor: '#1C1917' } : undefined} />
        </label>
        <label className="account-field full">
          <span className="sync-label">Phone</span>
          <input className="account-input" value={editing ? draft.phone : form.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            readOnly={!editing} style={editing ? { borderColor: '#1C1917' } : undefined} />
        </label>
      </div>
      <div className="account-stat-grid">
        <div className="account-stat">
          <div className="account-stat-number accent">{stats.orders}</div>
          <div className="sync-muted">Orders placed</div>
        </div>
        <div className="account-stat">
          <div className="account-stat-number">{stats.favorites}</div>
          <div className="sync-muted">Saved vendors</div>
        </div>
        <div className="account-stat">
          <div className="account-stat-number">${stats.spent.toFixed(0)}</div>
          <div className="sync-muted">Total spent</div>
        </div>
      </div>
    </CustomerAccountShell>
  );
}
