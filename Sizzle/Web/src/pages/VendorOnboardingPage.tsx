import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { createMenuItem } from '../lib/services/menuItems';

interface MenuItem {
  name: string;
  price: string;
  description: string;
}

export function VendorOnboardingPage() {
  const navigate = useNavigate();
  const { vendor } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    if (!name.trim()) { setFormError('Enter an item name.'); return; }
    const parsedPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setFormError('Enter a valid price.'); return; }
    setItems((prev) => [...prev, { name: name.trim(), price: parsedPrice.toFixed(2), description: description.trim() }]);
    setName('');
    setPrice('');
    setDescription('');
    setFormError('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (items.length === 0) { setFormError('Add at least one menu item before continuing.'); return; }
    if (!vendor) { navigate('/vendor-onboarding-hours'); return; }
    setSaving(true);
    try {
      for (const item of items) {
        await createMenuItem({
          vendor_id: vendor.id,
          name: item.name,
          price_cents: Math.round(parseFloat(item.price) * 100),
          description: item.description || null,
        });
      }
    } catch { /* continue anyway */ }
    setSaving(false);
    navigate('/vendor-onboarding-hours');
  };

  return (
    <div className="cvob_layout">
      <div className="cvob_left">
        <Link to="/" className="link-reset cvob_logo">
          <div className="cvob_logo-icon"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div>
          <div className="cvob_logo-text">Sizzle</div>
        </Link>
        <div className="cvob_left-content">
          <div className="cvob_step-label">STEP 2 OF 3</div>
          <h1 className="cvob_left-title">Set up your menu.</h1>
          <p className="cvob_left-subtitle">Add your best-selling items to start taking orders right away. You can always update later.</p>
          <div className="cvob_steps">
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Business profile</span></div>
            <div className="cvob_step cvob_step-current"><div className="cvob_step-circle">2</div><span>Menu setup</span></div>
            <div className="cvob_step cvob_step-upcoming"><div className="cvob_step-circle-muted">3</div><span>Hours &amp; location</span></div>
          </div>

        </div>
        <div className="cvob_left-footer">You can skip any step and come back later</div>
      </div>
      <div className="cvob_right">
        <div className="cvob_form">
          <h2 className="cvob_form-title">Add menu items</h2>
          <p className="cvob_form-subtitle">Start with your most popular dishes</p>
          <div className="cvob_input-row">
            <div className="cvob_field cvob_field-wide">
              <label className="cvob_label">ITEM NAME</label>
              <input type="text" className="cvob_input" placeholder="e.g. Tacos Al Pastor" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="cvob_field cvob_field-narrow">
              <label className="cvob_label">PRICE</label>
              <input type="text" className="cvob_input" placeholder="$ 0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="cvob_field">
            <label className="cvob_label">DESCRIPTION</label>
            <textarea className="cvob_textarea" placeholder="Describe this item..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {formError && <div style={{ color: '#C0392B', fontSize: 13, marginBottom: 8 }}>{formError}</div>}
          {items.length > 0 && (
            <div className="cvob_items-card">
              <div className="cvob_items-title">Items added ({items.length})</div>
              {items.map((item, i) => (
                <div key={i} className="cvob_item-row">
                  <div className="cvob_item-info">
                    <div className="cvob_item-name">{item.name}</div>
                    {item.description && <div className="cvob_item-desc">{item.description.slice(0, 40)}{item.description.length > 40 ? '...' : ''}</div>}
                  </div>
                  <div className="cvob_item-price">${item.price}</div>
                  <button className="cvob_item-delete" onClick={() => removeItem(i)} type="button">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="cvob_actions">
            <button type="button" className="cvob_btn-add" onClick={addItem}>+ Add Another Item</button>
            <button type="button" className="cvob_btn-continue" onClick={handleContinue} disabled={saving} style={saving ? { opacity: 0.6 } : undefined}>
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
