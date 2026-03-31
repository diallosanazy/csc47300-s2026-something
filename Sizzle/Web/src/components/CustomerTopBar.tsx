import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from './Brand';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="#9C9890" strokeWidth="1.5" />
      <path d="M21 21L16.65 16.65" stroke="#9C9890" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="#9C9890" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6V20C3 20.53 3.211 21.039 3.586 21.414C3.961 21.789 4.47 22 5 22H19C19.53 22 20.039 21.789 20.414 21.414C20.789 21.039 21 20.53 21 20V6L18 2H6Z" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6H21" stroke="#1C1917" strokeWidth="1.5" />
      <path d="M16 10C16 11.061 15.579 12.078 14.828 12.828C14.078 13.579 13.061 14 12 14C10.939 14 9.922 13.579 9.172 12.828C8.421 12.078 8 11.061 8 10" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CustomerTopBar({
  mode,
  query = '',
  onSearchChange,
  onSearchSubmit: onSearchSubmitProp,
}: {
  mode: 'landing' | 'search' | 'vendor';
  query?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const q = String(form.get('q') || '').trim();
    if (onSearchSubmitProp) {
      onSearchSubmitProp(q);
      return;
    }
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  if (mode === 'landing') {
    return (
      <div className="cef3342eb">
        <Brand />
        <div style={{ alignItems: 'center', display: 'flex', gap: 32 }}>
          <Link className="link-reset c91e3dc28" to="/search">Explore</Link>
          <Link className="link-reset c4f642d18" to="/vendor-login">For Vendors</Link>
          {user ? (
            <Link className="link-reset c8ac7e02f" to="/user-account" style={{ marginLeft: 8 }}>
              <div className="c154a3b24">{initial}</div>
            </Link>
          ) : (
            <>
              <Link className="link-reset cec3147fa" to="/login" style={{ marginLeft: 8 }}>
                <div style={{ color: '#1C1917', fontSize: 14, fontWeight: 600, lineHeight: '18px' }}>Sign In</div>
              </Link>
              <Link className="link-reset c502e73f1" to="/register">
                <div className="c154a3b24">Get Started</div>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'search') {
    return (
      <div className="cef3342eb">
        <Brand />
        <form id="search-form" className="cc6e83da2" onSubmit={onSearchSubmit}>
          <SearchIcon />
          <input
            id="search-input"
            name="q"
            type="text"
            value={query}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search vendors, cuisine, location..."
            className="c63bfc7e4"
          />
        </form>
        <div className="cee54018c">
          <Link className="link-reset" to="/favorites" style={{ display: 'flex', alignItems: 'center' }}>
            <HeartIcon />
          </Link>
          <Link className="link-reset c2ce0b259" to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <CartIcon />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#FF6B2C',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: '16px',
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {totalItems}
              </span>
            )}
          </Link>
          <Link className="link-reset c8ac7e02f" to="/user-account">
            <div className="c154a3b24">{initial}</div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cef3342eb">
      <Brand />
      <div className="cee54018c">
        <Link className="link-reset" to="/favorites" style={{ display: 'flex', alignItems: 'center' }}>
          <HeartIcon />
        </Link>
        <Link className="link-reset c2ce0b259" to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <CartIcon />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#FF6B2C',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '16px',
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}>
              {totalItems}
            </span>
          )}
        </Link>
        <Link className="link-reset c8ac7e02f" to="/user-account">
          <div className="c154a3b24">{initial}</div>
        </Link>
      </div>
    </div>
  );
}
