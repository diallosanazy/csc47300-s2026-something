import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerTopBar } from '../components/CustomerTopBar';
import { useAuth } from '../lib/auth';
import { getMyFavorites, removeFavorite } from '../lib/services/favorites';
import type { Database } from '../lib/database.types';

const BG_COLORS = ['#1C1917', '#2C3E2E', '#3B2D4A', '#1E3A5F', '#4A3728', '#2D3436', '#6B3A2E'];

export function FavoritesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Database['public']['Tables']['vendors']['Row'][]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load favorites: from DB if authenticated, otherwise empty for new users
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoaded(true);
      return;
    }
    getMyFavorites().then((favs) => {
      // Each favorite has a joined vendor row
      const vendors = favs
        .map((f: any) => f.vendor as Database['public']['Tables']['vendors']['Row'] | null)
        .filter((v): v is Database['public']['Tables']['vendors']['Row'] => !!v);
      setFavorites(vendors);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [user]);

  const unfavorite = async (id: string) => {
    setFavorites((prev) => prev.filter((v) => v.id !== id));
    if (user) {
      try { await removeFavorite(id); } catch { /* silent */ }
    }
  };

  const visible = favorites.filter(
    (v) => v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="c8ad40ac4">
      <CustomerTopBar mode="search" query={search} onSearchChange={setSearch} onSearchSubmit={setSearch} />

      <div style={{ padding: '40px 60px 56px' }}>
        <div style={{ alignItems: 'baseline', display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ color: '#1C1917', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>Saved Vendors</div>
            <div style={{ color: '#9C9890', fontSize: 14, marginTop: 6 }}>{favorites.length} vendor{favorites.length !== 1 ? 's' : ''} saved</div>
          </div>
          <Link className="link-reset c74ebae70" to="/search">Browse more</Link>
        </div>

        {!loaded ? (
          <div style={{ color: '#9C9890', fontSize: 15, paddingTop: 60, textAlign: 'center' }}>Loading…</div>
        ) : visible.length === 0 ? (
          <div style={{ color: '#9C9890', fontSize: 15, paddingTop: 60, textAlign: 'center' }}>
            {search ? 'No saved vendors match your search.' : 'No saved vendors yet. Browse vendors to save your favorites.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Array.from({ length: Math.ceil(visible.length / 3) }).map((_, rowIndex) => {
              const row = visible.slice(rowIndex * 3, rowIndex * 3 + 3);
              return (
                <div key={rowIndex} style={{ display: 'flex', gap: 20, width: '100%' }}>
                  {row.map((vendor) => {
                    const rating = vendor.rating ?? 4.8;
                    const reviewCount = vendor.review_count ?? 0;
                    const cuisine = vendor.cuisine ?? 'Pickup';
                    const location = vendor.location_text ?? 'Nearby';
                    const price = '$$';
                    const label = vendor.name.split(' ')[0]?.toUpperCase().slice(0, 6) || 'VENDOR';
                    const bgColor = BG_COLORS[vendor.name.length % BG_COLORS.length];
                    const open = !vendor.is_busy;

                    return (
                      <div key={vendor.id} style={{ flexBasis: '0%', flexGrow: 1, flexShrink: 1, position: 'relative' }}>
                        <Link className="link-reset" to={`/vendor?id=${vendor.id}`}>
                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E6E1', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}>
                          <div style={{ alignItems: 'center', backgroundColor: bgColor, display: 'flex', flexShrink: 0, height: 160, justifyContent: 'center', position: 'relative', width: '100%' }}>
                            <div style={{ color: '#FFFFFF0D', fontSize: 36, fontWeight: 900, lineHeight: '44px' }}>{label}</div>
                            <div style={{ backgroundColor: open ? '#2D9F6F' : '#9C9890', borderRadius: 6, display: 'flex', left: 12, padding: '4px 10px', position: 'absolute', top: 12 }}>
                              <div style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600, lineHeight: '14px' }}>{open ? 'Open Now' : 'Closed'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ color: '#1C1917', fontSize: 17, fontWeight: 700, lineHeight: '22px' }}>{vendor.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B2C" /></svg>
                                <div style={{ color: '#1C1917', fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>{rating.toFixed(1)}</div>
                                <div style={{ color: '#9C9890', fontSize: 13, lineHeight: '16px' }}>({reviewCount})</div>
                              </div>
                            </div>
                            <div style={{ color: '#9C9890', fontSize: 14, lineHeight: '20px' }}>{cuisine}{location ? ` · ${location}` : ''} · {price}</div>
                            <div style={{ color: '#9C9890', fontSize: 13, lineHeight: '16px' }}>{vendor.description ?? 'Popular for pickup'}</div>
                          </div>
                        </div>
                        </Link>
                        {/* Unfavorite button */}
                        <button
                          onClick={() => unfavorite(vendor.id)}
                        title="Remove from favorites"
                        style={{ alignItems: 'center', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', height: 32, justifyContent: 'center', position: 'absolute', right: 48, top: 12, width: 32, zIndex: 2 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF6B2C"><path d="M20.84 4.61C19.8 3.58 18.4 2.99 16.95 2.99C15.5 2.99 14.1 3.58 13.06 4.61L12 5.67L10.94 4.61C8.79 2.46 5.32 2.46 3.16 4.61C1 6.77 1 10.24 3.16 12.39L12 21.23L20.84 12.39C21.87 11.35 22.45 9.96 22.45 8.5C22.45 7.04 21.87 5.65 20.84 4.61Z"/></svg>
                      </button>
                      </div>
                    );
                  })}
                  {Array.from({ length: 3 - row.length }).map((__, fi) => (
                    <div key={fi} style={{ flexBasis: '0%', flexGrow: 1, flexShrink: 1 }} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
