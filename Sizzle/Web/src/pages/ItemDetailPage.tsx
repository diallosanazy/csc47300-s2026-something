import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { ALL_DIETARY_TAGS, CATEGORY_LABELS } from '../lib/menuItems';
import { deleteMenuItem, getMenuItemById, setMenuItemAvailability, type DbMenuItem } from '../lib/services/menuItems';

function DetailPlaceholder() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12C2 12 5 20 12 20C19 20 22 12 22 12" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="12" r="1" fill="#D0CFCB" />
      <circle cx="12" cy="10" r="1" fill="#D0CFCB" />
      <circle cx="16" cy="12" r="1" fill="#D0CFCB" />
    </svg>
  );
}

export function ItemDetailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [item, setItem] = useState<DbMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!params.get('id')) {
    return <Navigate to="/menu" replace />;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = params.get('id');
      if (!id) return;
      setLoading(true);
      try {
        const data = await getMenuItemById(id);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params]);

  if (!loading && !item) return <Navigate to="/menu" replace />;
  if (!item) return <Navigate to="/menu" replace />;

  const activeTags = new Set(item.dietary_tags || []);

  const onDelete = () => {
    deleteMenuItem(item.id);
    setShowModal(false);
    setToast('Item deleted');
    window.setTimeout(() => navigate('/menu'), 800);
  };

  return (
    <VendorDashboardShell
      active="menu"
      title={item.name}
      actions={
        <>
          <Link className="btn btn-secondary link-reset" to={`/add-item?edit=${item.id}`}>Edit Item</Link>
          <button className="btn btn-danger" type="button" onClick={() => setShowModal(true)}>Delete</button>
        </>
      }
    >
      <div className="detail-content">
        <div className="detail-left">
          <div className="detail-image">
            {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <DetailPlaceholder />}
          </div>

          <div className="detail-section">
            <div className="section-label">Description</div>
            <div className="section-body">{item.description || 'No description provided.'}</div>
          </div>

          <div className="detail-section">
            <div className="section-label">Ingredients</div>
            <div className="section-body">—</div>
          </div>

          <div className="detail-section">
            <div className="section-label">Badges</div>
            <div className="badge-group">
              {item.popular ? <span className="badge badge-popular">Popular</span> : null}
              {item.featured ? <span className="badge badge-featured">Featured</span> : null}
              {!item.popular && !item.featured ? <span className="badge badge-inactive">No badges</span> : null}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Price</span>
              <span className="info-value price">${((item.price_cents ?? 0) / 100).toFixed(2)}</span>
            </div>
            <div className="info-divider" />
            <div className="info-row">
              <span className="info-label">Category</span>
              <span className="info-value">{CATEGORY_LABELS[item.category] || item.category || '—'}</span>
            </div>
            <div className="info-divider" />
            <div className="info-row">
              <span className="info-label">Availability</span>
              <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`avail-dot ${(item.is_available ?? true) ? 'available' : 'sold-out'}`} />
                <span className={`avail-text ${(item.is_available ?? true) ? 'available' : 'sold-out'}`}>{(item.is_available ?? true) ? 'Available' : 'Sold Out'}</span>
                <button
                  onClick={async () => {
                    const next = !(item.is_available ?? true);
                    try {
                      const updated = await setMenuItemAvailability(item.id, next);
                      setItem(updated);
                      setToast(next ? 'Marked available' : 'Marked sold out');
                      setTimeout(() => setToast(null), 2000);
                    } catch {
                      setToast('Failed to update availability');
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#FF6B2C', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}
                >
                  {(item.is_available ?? true) ? 'Mark Sold Out' : 'Mark Available'}
                </button>
              </span>
            </div>
            <div className="info-divider" />
            <div className="info-row">
              <span className="info-label">Prep Time</span>
              <span className="info-value">{item.prep_time || '—'}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="section-label">Dietary Tags</div>
            <div className="tag-group">
              {ALL_DIETARY_TAGS.map((tag) => {
                const label = tag.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
                return <span key={tag} className={`diet-tag ${activeTags.has(tag) ? 'active' : 'inactive'}`}>{label}</span>;
              })}
            </div>
          </div>

          <div className="info-card">
            <div className="section-label">Performance</div>
            <div className="stats-grid">
              <div className="stat-cell">
                <span className="stat-number">—</span>
                <span className="stat-label">Sold today</span>
              </div>
              <div className="stat-cell">
                <span className="stat-number">—</span>
                <span className="stat-label">This week</span>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-cell">
                <span className="stat-number accent">—</span>
                <span className="stat-label">Revenue today</span>
              </div>
              <div className="stat-cell">
                <span className="stat-number">—</span>
                <span className="stat-label">Avg. rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="toast show">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#2D9F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{toast}</span>
        </div>
      ) : null}

      {showModal ? (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Delete Item</div>
            <div className="modal-body">Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-danger" type="button" onClick={onDelete}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </VendorDashboardShell>
  );
}
