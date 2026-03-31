import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../lib/auth';

export function OrderHistoryEmptyPage() {
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="sync-page">
      <header className="sync-topbar">
        <Brand className="sync-logo" titleClassName="" />
        <form className="sync-topbar-search"><input placeholder="Search vendors..." /></form>
        <div className="sync-topbar-right"><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-title-row">
          <div className="sync-title-group"><h1 className="sync-title">Order History</h1><div className="sync-subtitle">Your past pickups and reorders will show up here.</div></div>
          <Link className="link-reset sync-button-outline" to="/search">Explore Vendors</Link>
        </div>
        <div className="sync-outline-block">
          <div className="sync-center-block">
            <div className="sync-empty-icon sync-empty-icon-dark">#</div>
            <h1 className="sync-title" style={{ fontSize: 26 }}>No Orders Yet</h1>
            <div className="sync-subtitle">When you place your first pickup order, you’ll be able to reorder favorites, leave reviews, and track what you’ve spent.</div>
            <div className="sync-inline-actions">
              <Link className="link-reset sync-button" to="/search">Place Your First Order</Link>
              <Link className="link-reset sync-button-outline" to="/search">See Popular Vendors</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
