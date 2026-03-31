import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function VendorDashboardShell({
  active,
  title,
  actions,
  children,
}: {
  active: 'dashboard' | 'orders' | 'menu' | 'analytics' | 'settings';
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="vendor-settings-layout">
      <aside className="vendor-sidebar">
        <Link className="link-reset sync-logo" to="/">
          <span className="sync-logo-icon"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></span>
          <span>Sizzle</span>
        </Link>
        <nav className="vendor-nav">
          <Link className={`link-reset vendor-nav-item${active === 'dashboard' ? ' active' : ''}`} to="/dashboard">Dashboard</Link>
          <Link className={`link-reset vendor-nav-item${active === 'orders' ? ' active' : ''}`} to="/orders">Orders</Link>
          <Link className={`link-reset vendor-nav-item${active === 'menu' ? ' active' : ''}`} to="/menu">Menu</Link>
          <Link className={`link-reset vendor-nav-item${active === 'analytics' ? ' active' : ''}`} to="/analytics">Analytics</Link>
          <Link className={`link-reset vendor-nav-item${active === 'settings' ? ' active' : ''}`} to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="vendor-settings-main">
        {title ? (
          <div className="sync-title-row">
            <div className="sync-title-group">
              <h1 className="sync-title">{title}</h1>
            </div>
            {actions && <div>{actions}</div>}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
