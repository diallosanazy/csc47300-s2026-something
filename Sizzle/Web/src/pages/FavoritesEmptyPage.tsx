import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../lib/auth';

export function FavoritesEmptyPage() {
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="sync-page">
      <header className="sync-topbar">
        <Brand className="sync-logo" titleClassName="" />
        <form className="sync-topbar-search"><input placeholder="Search vendors..." /></form>
        <div className="sync-topbar-right"><span className="sync-heart" style={{ color: 'var(--accent)' }}>♥</span><div className="sync-avatar">{initial}</div></div>
      </header>
      <main className="sync-content">
        <div className="sync-title-row">
          <div className="sync-title-group"><h1 className="sync-title">Saved Vendors</h1><div className="sync-subtitle">Build your shortlist and jump back in when your cravings hit.</div></div>
          <Link className="link-reset sync-button-dark" to="/search">Explore Vendors</Link>
        </div>
        <div className="sync-outline-block">
          <div className="sync-center-block">
            <div className="sync-empty-icon">♥</div>
            <h1 className="sync-title" style={{ fontSize: 26 }}>No Saved Vendors Yet</h1>
            <div className="sync-subtitle">Tap the heart on any vendor card to save your go-to spots for lunch, dinner, and last-minute cravings.</div>
            <div className="sync-inline-actions">
              <Link className="link-reset sync-button" to="/search">Browse Near Me</Link>
              <Link className="link-reset sync-button-outline" to="/search">Popular Right Now</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
