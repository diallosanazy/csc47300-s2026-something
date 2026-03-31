import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../lib/auth';

const CUISINES = ['Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'Middle Eastern'];
const DISTANCES = ['0.5 mi', '1 mi', '2 mi', '5 mi'];
const RATINGS = ['3+', '4+', '4.5+'];
const PRICES = ['$', '$$', '$$$'];

export function FilterPanelPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const [cuisines, setCuisines] = useState<string[]>(['Mexican']);
  const [distance, setDistance] = useState('1 mi');
  const [rating, setRating] = useState('');
  const [prices, setPrices] = useState<string[]>(['$', '$$']);
  const [openNow, setOpenNow] = useState(true);
  const [preOrder, setPreOrder] = useState(false);

  const toggleCuisine = (c: string) =>
    setCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const togglePrice = (p: string) =>
    setPrices((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const activeChips: string[] = [...cuisines, ...(openNow ? ['Open Now'] : [])];

  const removeChip = (chip: string) => {
    if (chip === 'Open Now') { setOpenNow(false); return; }
    toggleCuisine(chip);
  };

  const clearAll = () => {
    setCuisines([]);
    setDistance('1 mi');
    setRating('');
    setPrices([]);
    setOpenNow(false);
    setPreOrder(false);
  };

  const resultCount = 12 - (cuisines.length === 0 ? 0 : 0); // simplified count display

  return (
    <div className="sync-page">
      <header className="sync-topbar">
        <Brand className="sync-logo" titleClassName="" />
        <form className="sync-topbar-search"><input defaultValue="Mexican street food, Mission..." /></form>
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', minHeight: 'calc(100vh - 60px)' }}>
        <section style={{ padding: '18px 30px', background: '#f7f6f3' }}>
          {activeChips.length > 0 && (
            <div className="sync-inline-actions" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
              {activeChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => removeChip(chip)}
                  style={{ alignItems: 'center', background: '#1C1917', border: 'none', borderRadius: 999, color: '#fff', cursor: 'pointer', display: 'flex', fontSize: 13, fontWeight: 600, gap: 6, padding: '10px 16px' }}
                >
                  {chip} <span style={{ opacity: 0.7 }}>×</span>
                </button>
              ))}
            </div>
          )}
          <div className="sync-grid sync-grid-2">
            <div className="sync-card" style={{ height: 280, background: '#fbfaf7' }}></div>
            <div className="sync-card" style={{ height: 280, background: '#fbfaf7' }}></div>
          </div>
        </section>
        <aside className="sync-card" style={{ borderRadius: 0, borderTop: 0, borderRight: 0, borderBottom: 0, boxShadow: 'none', padding: '24px 0' }}>
          <div className="sync-spread" style={{ padding: '0 28px 18px', borderBottom: '1px solid #ece6dc' }}>
            <div className="sync-metric-strong">Filters</div>
            <button onClick={clearAll} className="link-reset sync-row-action" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Clear all</button>
          </div>
          <div className="sync-stack" style={{ padding: '18px 28px 0' }}>
            <section className="sync-stack" style={{ gap: 14 }}>
              <div className="sync-label">Cuisine</div>
              <div className="sync-inline-actions" style={{ flexWrap: 'wrap' }}>
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    style={{ background: cuisines.includes(c) ? '#1C1917' : 'transparent', border: cuisines.includes(c) ? 'none' : '1.5px solid #E8E6E1', borderRadius: 999, color: cuisines.includes(c) ? '#fff' : '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '10px 16px' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
            <div className="sync-line" />
            <section className="sync-stack" style={{ gap: 14 }}>
              <div className="sync-label">Distance</div>
              <div className="sync-inline-actions">
                {DISTANCES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDistance(d)}
                    style={{ background: distance === d ? '#1C1917' : 'transparent', border: distance === d ? 'none' : '1.5px solid #E8E6E1', borderRadius: 999, color: distance === d ? '#fff' : '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '10px 16px' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </section>
            <div className="sync-line" />
            <section className="sync-stack" style={{ gap: 14 }}>
              <div className="sync-label">Minimum Rating</div>
              <div className="sync-inline-actions">
                {RATINGS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(rating === r ? '' : r)}
                    style={{ background: rating === r ? '#1C1917' : 'transparent', border: rating === r ? 'none' : '1.5px solid #E8E6E1', borderRadius: 999, color: rating === r ? '#fff' : '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '10px 16px' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>
            <div className="sync-line" />
            <section className="sync-stack" style={{ gap: 14 }}>
              <div className="sync-label">Price</div>
              <div className="sync-inline-actions">
                {PRICES.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePrice(p)}
                    style={{ background: prices.includes(p) ? '#1C1917' : 'transparent', border: prices.includes(p) ? 'none' : '1.5px solid #E8E6E1', borderRadius: 999, color: prices.includes(p) ? '#fff' : '#1C1917', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '10px 16px' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>
            <div className="sync-line" />
            <section className="sync-stack" style={{ gap: 14 }}>
              <div className="sync-label">Availability</div>
              <div className="sync-spread">
                <span>Open now only</span>
                <button onClick={() => setOpenNow((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div className={`sync-toggle ${openNow ? 'on' : 'off'}`}><span className="dot" /></div>
                </button>
              </div>
              <div className="sync-spread">
                <span>Pre-order available</span>
                <button onClick={() => setPreOrder((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div className={`sync-toggle ${preOrder ? 'on' : 'off'}`}><span className="dot" /></div>
                </button>
              </div>
            </section>
            <button
              onClick={() => navigate('/search')}
              className="link-reset sync-button"
              style={{ width: '100%', marginTop: 8, cursor: 'pointer', border: 'none' }}
            >
              Show {resultCount} results
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
