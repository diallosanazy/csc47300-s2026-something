import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { saveVendorHours } from '../lib/services/vendorHours';
import { updateVendor } from '../lib/services/vendors';

const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'];

type HourRow = { day: string; open: boolean; start: string; end: string };

const INITIAL: HourRow[] = [
  { day: 'Monday',    open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Tuesday',   open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Wednesday', open: true,  start: '11:00 AM', end: '8:00 PM' },
  { day: 'Thursday',  open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Friday',    open: true,  start: '10:00 AM', end: '10:00 PM' },
  { day: 'Saturday',  open: true,  start: '9:00 AM',  end: '10:00 PM' },
  { day: 'Sunday',    open: false, start: '10:00 AM', end: '9:00 PM' },
];

function to24h(t: string): string {
  const [time, ampm] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function VendorOnboardingHoursPage() {
  const navigate = useNavigate();
  const { vendor } = useAuth();
  const [hours, setHours] = useState<HourRow[]>(INITIAL);
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (i: number) => {
    setHours((prev) => prev.map((r, idx) => idx === i ? { ...r, open: !r.open } : r));
  };

  const update = (i: number, field: 'start' | 'end', val: string) => {
    setHours((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      if (vendor) {
        const dayOrder = [1, 2, 3, 4, 5, 6, 0];
        await saveVendorHours(vendor.id, hours.map((row, i) => ({
          dayOfWeek: dayOrder[i],
          openTime: to24h(row.start),
          closeTime: to24h(row.end),
          isClosed: !row.open,
        })));
        if (location.trim()) {
          await updateVendor(vendor.id, { location_text: location.trim() });
        }
      }
    } catch { /* continue anyway */ }
    setSaving(false);
    navigate('/dashboard');
  };

  return (
    <div className="cvob_layout">
      <div className="cvob_left">
        <Link to="/" className="link-reset cvob_logo">
          <div className="cvob_logo-icon"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div>
          <div className="cvob_logo-text">Sizzle</div>
        </Link>
        <div className="cvob_left-content">
          <div className="cvob_step-label">STEP 3 OF 3</div>
          <h1 className="cvob_left-title">Hours &amp; location.</h1>
          <p className="cvob_left-subtitle">Let customers know when and where they can find you. You can always adjust this later.</p>
          <div className="cvob_steps">
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Business profile</span></div>
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Menu setup</span></div>
            <div className="cvob_step cvob_step-current"><div className="cvob_step-circle">3</div><span>Hours &amp; location</span></div>
          </div>
        </div>
        <div className="cvob_left-footer">You can skip any step and come back later</div>
      </div>
      <div className="cvob_right">
        <div className="cvob_form">
          <h2 className="cvob_form-title">Set your schedule</h2>
          <p className="cvob_form-subtitle">Choose the days and hours you'll be open for orders</p>

          <div className="cvob_hours-table">
            <div className="cvob_hours-header">
              <span>Day</span>
              <span>Open</span>
              <span>Hours</span>
            </div>
            {hours.map((row, i) => (
              <div key={row.day} className="cvob_hours-row" style={row.open ? undefined : { opacity: 0.45 }}>
                <div className="cvob_hours-day">{row.day}</div>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div className={`cvob_toggle ${row.open ? 'on' : ''}`}>
                    <span className="cvob_toggle-dot" />
                  </div>
                </button>
                {row.open ? (
                  <div className="cvob_hours-selects">
                    <select className="cvob_hours-select" value={row.start} onChange={(e) => update(i, 'start', e.target.value)}>
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="cvob_hours-dash">–</span>
                    <select className="cvob_hours-select" value={row.end} onChange={(e) => update(i, 'end', e.target.value)}>
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="cvob_hours-closed">Closed</span>
                )}
              </div>
            ))}
          </div>

          <div className="cvob_location-section">
            <h2 className="cvob_form-title" style={{ fontSize: 20 }}>Primary location</h2>
            <p className="cvob_form-subtitle">Where customers can typically find you</p>
            <div className="cvob_field">
              <label className="cvob_label">ADDRESS OR AREA</label>
              <input
                type="text"
                className="cvob_input"
                placeholder="e.g. Mission District, San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="cvob_actions">
            <button type="button" className="cvob_btn-skip" onClick={() => navigate('/dashboard')}>Skip for now</button>
            <button type="button" className="cvob_btn-continue" onClick={handleContinue} disabled={saving} style={saving ? { opacity: 0.6 } : undefined}>
              {saving ? 'Saving...' : 'Finish Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
