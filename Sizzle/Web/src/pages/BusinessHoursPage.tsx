import { useEffect, useState } from 'react';
import { VendorSettingsShell } from '../components/VendorSettingsShell';
import { useAuth } from '../lib/auth';
import { getVendorHours, saveVendorHours, DAY_NAMES } from '../lib/services/vendorHours';

type HourRow = { day: string; open: boolean; start: string; end: string };

const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'];

// Convert 24h "HH:MM" to 12h "H:MM AM/PM"
function to12h(t: string | null): string {
  if (!t) return '10:00 AM';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${ampm}`;
}
// Convert 12h "H:MM AM/PM" to 24h "HH:MM"
function to24h(t: string): string {
  const [time, ampm] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const INITIAL: HourRow[] = [
  { day: 'Monday',    open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Tuesday',   open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Wednesday', open: true,  start: '11:00 AM', end: '8:00 PM' },
  { day: 'Thursday',  open: true,  start: '10:00 AM', end: '9:00 PM' },
  { day: 'Friday',    open: true,  start: '10:00 AM', end: '10:00 PM' },
  { day: 'Saturday',  open: true,  start: '9:00 AM',  end: '10:00 PM' },
  { day: 'Sunday',    open: false, start: '10:00 AM', end: '9:00 PM' },
];

const selectStyle = { background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '6px 10px', outline: 'none' };

export function BusinessHoursPage() {
  const { vendor } = useAuth();
  const [hours, setHours] = useState<HourRow[]>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load hours from DB
  useEffect(() => {
    if (!vendor) return;
    getVendorHours(vendor.id).then((dbHours) => {
      if (dbHours.length === 0) return;
      // Map day_of_week (0=Sun..6=Sat) to our row order (Mon..Sun)
      const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon=1, Tue=2, ... Sun=0
      const rows = dayOrder.map((dow, i) => {
        const h = dbHours.find((dh) => dh.day_of_week === dow);
        return {
          day: DAY_NAMES[dow],
          open: h ? !h.is_closed : INITIAL[i].open,
          start: h ? to12h(h.open_time) : INITIAL[i].start,
          end: h ? to12h(h.close_time) : INITIAL[i].end,
        };
      });
      setHours(rows);
    }).catch(() => {});
  }, [vendor]);

  const toggle = (i: number) => {
    setHours((prev) => prev.map((r, idx) => idx === i ? { ...r, open: !r.open } : r));
    setSaved(false);
  };

  const update = (i: number, field: 'start' | 'end', val: string) => {
    setHours((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
    setSaved(false);
  };

  const save = async () => {
    if (!vendor) return;
    setSaving(true);
    try {
      const dayOrder = [1, 2, 3, 4, 5, 6, 0];
      await saveVendorHours(vendor.id, hours.map((row, i) => ({
        dayOfWeek: dayOrder[i],
        openTime: to24h(row.start),
        closeTime: to24h(row.end),
        isClosed: !row.open,
      })));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <button onClick={save} style={{ background: '#1C1917', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px', opacity: saving ? 0.6 : 1 }} disabled={saving}>
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );

  return (
    <VendorSettingsShell section="hours" actions={actions}>
      <div className="sync-title-group">
        <div className="sync-row-title">Business Hours</div>
        <div className="sync-subtitle">Set when customers can find and order from you</div>
      </div>
      {saved && (
        <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Hours saved successfully.
        </div>
      )}
      <div className="sync-card sync-table-card">
        <div className="sync-hours-header"><span>Day</span><span>Open</span><span>Hours</span></div>
        {hours.map((row, i) => (
          <div key={row.day} className="sync-hours-row" style={row.open ? undefined : { opacity: 0.5 }}>
            <strong>{row.day}</strong>
            <button
              onClick={() => toggle(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className={`sync-toggle ${row.open ? 'on' : 'off'}`}><span className="dot" /></div>
            </button>
            {row.open ? (
              <div className="sync-inline-actions">
                <select value={row.start} onChange={(e) => update(i, 'start', e.target.value)} style={selectStyle}>
                  {TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <span className="sync-muted">–</span>
                <select value={row.end} onChange={(e) => update(i, 'end', e.target.value)} style={selectStyle}>
                  {TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="sync-muted">Closed</span>
            )}
          </div>
        ))}
      </div>
    </VendorSettingsShell>
  );
}
