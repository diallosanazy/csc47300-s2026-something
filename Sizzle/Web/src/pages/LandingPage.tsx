import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerTopBar } from '../components/CustomerTopBar';
import { VendorCard } from '../components/VendorCard';
import { MapView } from '../components/MapView';
import { getFeaturedVendors, VENDORS } from '../../assets/ts/vendors';

export function LandingPage() {
  const navigate = useNavigate();
  const featured = getFeaturedVendors();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const q = String(form.get('q') || '').trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <div className="c8ad40ac4">
      <CustomerTopBar mode="landing" />
      <div className="c8c70634d">
        <div className="c0d78ccf7">
          <div className="c4138f1e6">
            <div className="c693b5ace">New</div>
          </div>
          <div className="cc4223e94">42 vendors just joined in New York</div>
        </div>
        <div className="c3feb7414">Find Street Food You'll Love</div>
        <div className="c7a7300cd">Discover the best tacos, bao buns, arepas, and more from local vendors in your neighborhood.</div>
      </div>
      <form className="cd8b9a1d4" onSubmit={onSubmit}>
        <div className="cfabc42ab">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9C9890" strokeWidth="1.5" />
            <path d="M21 21L16.65 16.65" stroke="#9C9890" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input id="landing-search" name="q" type="text" placeholder="Search by vendor, cuisine, or location..." className="c50b25fd8" />
          <button type="submit" className="c7cd84909">
            <div className="c154a3b24">Search</div>
          </button>
        </div>
      </form>
      <div className="c3bd1f52c">
        <div className="cf0fbc4ef">
          <div className="c78bf244b">Popular Near You</div>
          <button className="link-reset c74ebae70" type="button" onClick={() => navigate('/search')}>View all</button>
        </div>
        <div className="ce522eec8">
          {featured.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} size="small" />
          ))}
        </div>
      </div>
      {/* ── Explore the Map section ── */}
      <div style={{ background: '#F7F5F0', borderTop: '1px solid #ECE9E1', marginTop: 24, padding: '56px 0 0' }}>
        <div style={{ padding: '0 60px' }}>
          <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF6B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="3" stroke="#FF6B2C" strokeWidth="1.5" /></svg>
                <div style={{ color: '#FF6B2C', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Explore the map</div>
              </div>
              <div style={{ color: '#1C1917', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>Vendors Near You</div>
              <div style={{ color: '#9C9890', fontSize: 15, marginTop: 8, maxWidth: 440 }}>Browse all street food vendors on the map. Click a pin to preview, click again to view the menu.</div>
            </div>
            <button className="link-reset" type="button" onClick={() => navigate('/map')} style={{ alignItems: 'center', background: '#1C1917', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'flex', fontSize: 13, fontWeight: 700, gap: 6, padding: '14px 24px', whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Open full map
            </button>
          </div>
        </div>
        <div style={{ padding: '0 60px 64px' }}>
          <MapView vendors={VENDORS} height={560} />
        </div>
      </div>
    </div>
  );
}
