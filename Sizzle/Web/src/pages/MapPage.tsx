import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerTopBar } from '../components/CustomerTopBar';
import { MapView } from '../components/MapView';
import { VENDORS } from '../../assets/ts/vendors';
import { getLiveVendors, type Vendor as DbVendor } from '../lib/services/vendors';
import type { VendorCardData } from '../components/VendorCard';

const ALL_FILTERS = ['Mexican', 'Open Now', 'Rating 4+'];

export function MapPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['Mexican']);
  const [dbVendors, setDbVendors] = useState<VendorCardData[]>([]);

  const removeFilter = (f: string) => setActiveFilters((prev) => prev.filter((x) => x !== f));
  const addFilter = (f: string) => {
    if (!activeFilters.includes(f)) setActiveFilters((prev) => [...prev, f]);
  };
  const inactiveFilters = ALL_FILTERS.filter((f) => !activeFilters.includes(f));

  useEffect(() => {
    getLiveVendors()
      .then((vendors) => {
        const BG_COLORS = ['#1C1917', '#2C3E2E', '#3B2D4A', '#1E3A5F', '#4A3728', '#2D3436', '#6B3A2E'];
        const mapped: VendorCardData[] = vendors.map((v: DbVendor) => ({
          id: v.id,
          name: v.name,
          cuisine: v.cuisine || 'Street Food',
          location: v.location_text || 'Nearby',
          price: '$',
          rating: v.rating ?? 0,
          reviews: v.review_count ?? 0,
          distance: '',
          description: v.description || v.cuisine || 'Street food vendor',
          bgColor: BG_COLORS[v.name.length % BG_COLORS.length],
          label: v.name.split(' ')[0]?.toUpperCase().slice(0, 6) || 'VENDOR',
          open: v.is_live && !v.is_busy,
        }));
        setDbVendors(mapped);
      })
      .catch(() => {});
  }, []);

  const allVendors = useMemo(() => {
    // Prefer DB vendors over static when names match
    const byName = new Map<string, VendorCardData>();
    for (const v of VENDORS) byName.set(v.name.toLowerCase(), v);
    for (const v of dbVendors) byName.set(v.name.toLowerCase(), v);
    return Array.from(byName.values());
  }, [dbVendors]);

  const filtered = allVendors.filter((v) => {
    if (activeFilters.includes('Mexican') && v.cuisine !== 'Mexican') return false;
    if (activeFilters.includes('Open Now') && !v.open) return false;
    if (activeFilters.includes('Rating 4+') && v.rating < 4) return false;
    return true;
  });

  return (
    <div className="c8ad40ac4">
      <CustomerTopBar mode="search" />
      {/* Map hero section */}
      <div style={{ background: '#F7F5F0', borderTop: '1px solid #ECE9E1', padding: '48px 0 56px' }}>
        <div style={{ margin: '0 auto', maxWidth: 1120, padding: '0 24px' }}>
          <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF6B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="3" stroke="#FF6B2C" strokeWidth="1.5" /></svg>
                <div style={{ color: '#FF6B2C', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Map view</div>
              </div>
              <div style={{ color: '#1C1917', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>Explore Street Food Near You</div>
              <div style={{ color: '#9C9890', fontSize: 15, marginTop: 8, maxWidth: 440 }}>Browse all vendors on the map. Click a pin to preview, click again to view the menu.</div>
            </div>
            <Link className="link-reset" to="/search" style={{ alignItems: 'center', background: '#1C1917', borderRadius: 10, color: '#fff', display: 'flex', fontSize: 13, fontWeight: 700, gap: 6, padding: '12px 22px', whiteSpace: 'nowrap' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              List view
            </Link>
          </div>

          {/* Filter chips */}
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 20 }}>
            {activeFilters.map((f) => (
              <button
                key={f}
                onClick={() => removeFilter(f)}
                style={{ alignItems: 'center', background: '#1C1917', border: 'none', borderRadius: 999, color: '#fff', cursor: 'pointer', display: 'flex', fontSize: 13, fontWeight: 600, gap: 6, padding: '8px 16px' }}
              >
                {f} <span style={{ opacity: 0.6 }}>×</span>
              </button>
            ))}
            {inactiveFilters.map((f) => (
              <button
                key={f}
                onClick={() => addFilter(f)}
                style={{ background: '#fff', border: '1.5px solid #E8E6E1', borderRadius: 999, color: '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 16px' }}
              >
                {f}
              </button>
            ))}
            <span style={{ color: '#9C9890', fontSize: 13, marginLeft: 8 }}>{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <MapView vendors={filtered} height={560} />
        </div>
      </div>
    </div>
  );
}
