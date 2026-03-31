import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomerTopBar } from './CustomerTopBar';
import { useAuth } from '../lib/auth';
import { signOut } from '../lib/services/auth';

function Sidebar({ active }: { active: 'info' | 'history' | 'favorites' | 'payments' }) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : 'Member';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="account-sidebar">
      <div className="account-profile">
        <div className="account-avatar">{initial}</div>
        <div className="account-name">{displayName}</div>
        <div className="sync-muted">{displayEmail}</div>
        <div className="account-success">{memberSince}</div>
      </div>
      <nav className="account-nav">
        <Link className={`link-reset account-nav-item${active === 'info' ? ' active' : ''}`} to="/user-account">Personal Info</Link>
        <Link className={`link-reset account-nav-item${active === 'history' ? ' active' : ''}`} to="/order-history">Order History</Link>
        <Link className={`link-reset account-nav-item${active === 'favorites' ? ' active' : ''}`} to="/favorites">Saved Vendors</Link>
        <Link className={`link-reset account-nav-item${active === 'payments' ? ' active' : ''}`} to="/payment-methods">Payment Methods</Link>
        <span className="account-nav-item">Notifications</span>
        <button className="link-reset account-nav-item signout" onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', textAlign: 'left', width: '100%', padding: '12px 12px' }}>Sign Out</button>
      </nav>
    </aside>
  );
}

export function CustomerAccountShell({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  active: 'info' | 'history' | 'favorites' | 'payments';
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sync-page">
      <CustomerTopBar mode="search" />
      <div className="account-layout">
        <Sidebar active={active} />
        <main className="account-main">
          <div className="sync-title-row">
            <div className="sync-title-group">
              <h1 className="sync-title">{title}</h1>
              {subtitle ? <div className="sync-subtitle">{subtitle}</div> : null}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
