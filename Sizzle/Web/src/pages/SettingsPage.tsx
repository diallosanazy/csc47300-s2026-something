import { useEffect, useState } from 'react';
import { VendorSettingsShell } from '../components/VendorSettingsShell';
import { useAuth } from '../lib/auth';
import { updateVendor } from '../lib/services/vendors';
import { updateProfile } from '../lib/services/auth';

const CUISINE_OPTIONS = ['Mexican Street Food', 'Asian Fusion', 'American BBQ', 'Mediterranean', 'Indian Street Food', 'Caribbean', 'Japanese', 'Italian', 'Other'];

export function SettingsPage() {
  const { user, profile, vendor, refreshProfile, refreshVendor } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [lowStock, setLowStock] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Populate from Supabase data
  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.name || '');
      setCuisine(vendor.cuisine || '');
      setLocation(vendor.location_text || '');
      setDescription(vendor.description || '');
    }
    if (profile) {
      setOwnerName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
    }
  }, [vendor, profile, user]);

  const markDirty = () => { setDirty(true); setSaved(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (vendor) {
        await updateVendor(vendor.id, {
          name: businessName,
          cuisine: cuisine || null,
          location_text: location || null,
          description: description || null,
        });
        await refreshVendor();
      }
      if (user) {
        await updateProfile(user.id, {
          full_name: ownerName || null,
          email: email || null,
          phone: phone || null,
        });
        await refreshProfile();
      }
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: '#F8F6F1',
    border: '1.5px solid #E8E6E1',
    borderRadius: 8,
    color: '#1C1917',
    fontSize: 14,
    outline: 'none',
    padding: '10px 14px',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M6 9L12 15L18 9\' stroke=\'%239C9890\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 80,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    lineHeight: 1.5,
  };

  const actions = (
    <button
      onClick={handleSave}
      className="c71727ab7"
      style={{
        background: dirty ? '#1C1917' : '#1C1917',
        border: 'none',
        borderRadius: 10,
        color: '#fff',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        padding: '10px 20px',
        opacity: dirty ? 1 : 0.6,
      }}
    >
      <div className="c154a3b24">{saving ? 'Saving…' : 'Save Changes'}</div>
    </button>
  );

  return (
    <VendorSettingsShell section="profile" actions={actions}>
      {saved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, marginBottom: 20, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Settings saved successfully.
        </div>
      )}

      <div className="c9c3937fa">
        <div className="c4ecf0f2d"><div className="cdb16dac8">{businessName.charAt(0).toUpperCase()}</div></div>
        <div className="c68a96fd1"><div className="cbeae5a4b">{businessName}</div><div className="c4f642d18">Member since January 2024</div></div>
        <div className="cd5e8c5f3"></div>
        <div className="c63ccd5a6"><div className="cfba8b898">Change Photo</div></div>
      </div>

      <div className="cad887c50">
        <div className="c9c9fa664">
          <div className="ccf301d68">Business Name</div>
          <input style={inputStyle} value={businessName} onChange={(e) => { setBusinessName(e.target.value); markDirty(); }} />
        </div>
        <div className="c9c9fa664">
          <div className="ccf301d68">Owner Name</div>
          <input style={inputStyle} value={ownerName} onChange={(e) => { setOwnerName(e.target.value); markDirty(); }} />
        </div>
      </div>

      <div className="c32490194">
        <div className="c9c9fa664">
          <div className="ccf301d68">Email</div>
          <input style={inputStyle} type="email" value={email} onChange={(e) => { setEmail(e.target.value); markDirty(); }} />
        </div>
        <div className="c9c9fa664">
          <div className="ccf301d68">Phone</div>
          <input style={inputStyle} type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); markDirty(); }} />
        </div>
      </div>

      <div className="c32490194">
        <div className="c9c9fa664">
          <div className="ccf301d68">Location</div>
          <input style={inputStyle} value={location} onChange={(e) => { setLocation(e.target.value); markDirty(); }} />
        </div>
        <div className="c9c9fa664">
          <div className="ccf301d68">Cuisine Type</div>
          <select style={selectStyle} value={cuisine} onChange={(e) => { setCuisine(e.target.value); markDirty(); }}>
            {CUISINE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="c9cd2dde3">
        <div className="ccf301d68">Description</div>
        <textarea style={textareaStyle} value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} />
      </div>

      <div className="cb01c9237">
        <div className="ccc65078c">
          <div className="c3bc4f4c9">
            <div className="c6b9ccd43">Order notifications</div>
            <div className="c101d052c">Get notified when a new order comes in</div>
          </div>
          <button
            onClick={() => { setOrderNotifs(!orderNotifs); markDirty(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ background: orderNotifs ? '#FF6B2C' : '#E8E6E1', borderRadius: 999, height: 24, padding: 2, transition: 'background 0.2s', width: 44 }}>
              <div style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', height: 20, transform: orderNotifs ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', width: 20 }} />
            </div>
          </button>
        </div>
        <div className="ccc65078c">
          <div className="c3bc4f4c9">
            <div className="c6b9ccd43">Daily summary email</div>
            <div className="c101d052c">Receive a summary of daily sales at end of day</div>
          </div>
          <button
            onClick={() => { setDailySummary(!dailySummary); markDirty(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ background: dailySummary ? '#FF6B2C' : '#E8E6E1', borderRadius: 999, height: 24, padding: 2, transition: 'background 0.2s', width: 44 }}>
              <div style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', height: 20, transform: dailySummary ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', width: 20 }} />
            </div>
          </button>
        </div>
        <div className="c6fb7c686">
          <div className="c3bc4f4c9">
            <div className="c6b9ccd43">Low stock alerts</div>
            <div className="c101d052c">Alert when menu items are running low</div>
          </div>
          <button
            onClick={() => { setLowStock(!lowStock); markDirty(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ background: lowStock ? '#FF6B2C' : '#E8E6E1', borderRadius: 999, height: 24, padding: 2, transition: 'background 0.2s', width: 44 }}>
              <div style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', height: 20, transform: lowStock ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', width: 20 }} />
            </div>
          </button>
        </div>
      </div>
    </VendorSettingsShell>
  );
}
