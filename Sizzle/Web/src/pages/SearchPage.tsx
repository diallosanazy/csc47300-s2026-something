import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomerTopBar } from '../components/CustomerTopBar';
import { VendorCard, type VendorCardData } from '../components/VendorCard';
import { MapView } from '../components/MapView';
import { VENDORS } from '../../assets/ts/vendors';
import { getLiveVendors, type Vendor as DbVendor } from '../lib/services/vendors';

const BG_COLORS = ['#1C1917', '#2C3E2E', '#3B2D4A', '#1E3A5F', '#4A3728', '#2D3436', '#6B3A2E'];

function dbVendorToCard(v: DbVendor): VendorCardData {
  return {
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
  };
}

export function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [dbVendors, setDbVendors] = useState<VendorCardData[]>([]);
  const query = params.get('q') || '';
  const location = params.get('location') || '';
  const rating = params.get('rating') || '';
  const open = params.get('open') === 'true';

  // Load DB vendors
  useEffect(() => {
    getLiveVendors()
      .then((vendors) => setDbVendors(vendors.map(dbVendorToCard)))
      .catch(() => {});
  }, []);

  // Merge static + DB, deduplicate by name (prefer DB when name collides)
  const allVendors = useMemo(() => {
    const byName = new Map<string, VendorCardData>();
    for (const v of VENDORS) byName.set(v.name.toLowerCase(), { ...v });
    for (const v of dbVendors) byName.set(v.name.toLowerCase(), v);
    return Array.from(byName.values());
  }, [dbVendors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allVendors.filter((vendor) => {
      const matchesQuery = !q
        || vendor.name.toLowerCase().includes(q)
        || vendor.cuisine.toLowerCase().includes(q)
        || vendor.location.toLowerCase().includes(q)
        || vendor.description.toLowerCase().includes(q)
        || vendor.label.toLowerCase().includes(q);

      const matchesLocation = !location || vendor.location === location;
      const matchesRating = !rating || vendor.rating >= Number(rating);
      const matchesOpen = !open || vendor.open === true;
      return matchesQuery && matchesLocation && matchesRating && matchesOpen;
    });
  }, [allVendors, location, open, query, rating]);

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value.trim()) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  };

  const toggleFilter = (type: 'location' | 'rating' | 'open' | 'more', value?: string) => {
    if (type === 'more') {
      navigate('/filter-panel');
      return;
    }

    const next = new URLSearchParams(params);
    if (type === 'location') {
      next.get('location') === value ? next.delete('location') : next.set('location', value || '');
    }
    if (type === 'rating') {
      next.get('rating') === value ? next.delete('rating') : next.set('rating', value || '');
    }
    if (type === 'open') {
      open ? next.delete('open') : next.set('open', 'true');
    }
    setParams(next, { replace: true });
  };

  return (
    <div className="c8ad40ac4">
      <CustomerTopBar mode="search" query={query} onSearchChange={updateQuery} onSearchSubmit={updateQuery} />
      <div className="c630e9081">
        <div className="c042c85a1">
          <button type="button" className={`${location === 'Mission District' ? 'c18ee518b' : 'cad1b4dc9'} filter-pill`} onClick={() => toggleFilter('location', 'Mission District')}>
            <div className="cfba8b898 filter-text">Mission District</div>
          </button>
          <button type="button" className={`${rating === '4' ? 'c18ee518b' : 'cad1b4dc9'} filter-pill`} onClick={() => toggleFilter('rating', '4')}>
            <div className="cfba8b898 filter-text">Rating 4+</div>
          </button>
          <button type="button" className={`${open ? 'c18ee518b' : 'cad1b4dc9'} filter-pill`} onClick={() => toggleFilter('open')}>
            <div className="cfba8b898 filter-text">Open Now</div>
          </button>
          <button type="button" className="cad1b4dc9 filter-pill" onClick={() => toggleFilter('more')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M8 12H16M11 18H13" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="cfba8b898 filter-text">More</div>
          </button>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
          <div className="c4f642d18">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''} found</div>
          {/* List / Map toggle */}
          <div style={{ background: '#F0EDE7', borderRadius: 8, display: 'flex', padding: 3 }}>
            <button
              onClick={() => setView('list')}
              style={{ alignItems: 'center', background: view === 'list' ? '#fff' : 'transparent', border: 'none', borderRadius: 6, boxShadow: view === 'list' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', color: '#1C1917', cursor: 'pointer', display: 'flex', fontSize: 12, fontWeight: 600, gap: 5, padding: '5px 10px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              List
            </button>
            <button
              onClick={() => setView('map')}
              style={{ alignItems: 'center', background: view === 'map' ? '#fff' : 'transparent', border: 'none', borderRadius: 6, boxShadow: view === 'map' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', color: '#1C1917', cursor: 'pointer', display: 'flex', fontSize: 12, fontWeight: 600, gap: 5, padding: '5px 10px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Map
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="cc192a01e">
          {filtered.length === 0 ? (
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 80, width: '100%' }}>
              <div style={{ color: '#1C1917', fontSize: 20, fontWeight: 700 }}>No vendors found</div>
              <div style={{ color: '#9C9890', fontSize: 15 }}>Try a different search term</div>
            </div>
          ) : (
            Array.from({ length: Math.ceil(filtered.length / 3) }).map((_, rowIndex) => {
              const row = filtered.slice(rowIndex * 3, rowIndex * 3 + 3);
              return (
                <div key={rowIndex} style={{ display: 'flex', gap: 20, width: '100%' }}>
                  {row.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} size="large" />)}
                  {Array.from({ length: 3 - row.length }).map((__, fillerIndex) => (
                    <div key={fillerIndex} style={{ flexBasis: '0%', flexGrow: 1, flexShrink: 1 }} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ padding: '0 24px 32px' }}>
          {filtered.length === 0 ? (
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 80 }}>
              <div style={{ color: '#1C1917', fontSize: 20, fontWeight: 700 }}>No vendors found</div>
              <div style={{ color: '#9C9890', fontSize: 15 }}>Try a different search term</div>
            </div>
          ) : (
            <MapView vendors={filtered} />
          )}
        </div>
      )}
    </div>
  );
}
