import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../lib/services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/search');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c2019817c">
      <div className="c477430cc">
        <Link className="link-reset cedfc72fd" to="/">
          <div className="cc59bd8c0"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div>
          <div className="c1d2600e1">Sizzle</div>
        </Link>
        <div className="c72b7280d">
          <div className="c408846e3">Discover<br />street food<br />around you.</div>
          <div className="c74dc3fc1">Find the best local vendors, order ahead, and skip the line. Your next favorite meal is just around the corner.</div>
        </div>
      </div>
      <div className="cfa34f91a">
        <form className="ca71a26f0" onSubmit={handleSubmit}>
          <div className="c00507de5">Welcome back</div>
          <div className="ce0a55529">Sign in to your Sizzle account</div>
          <div className="cb65e5fcc">
            <div className="cdee2a80c" style={{ cursor: 'not-allowed', opacity: 0.6 }}><div className="c91e3dc28">Google</div></div>
            <div className="cdee2a80c" style={{ cursor: 'not-allowed', opacity: 0.6 }}><div className="c91e3dc28">Apple</div></div>
          </div>
          <div className="c938fd7f6"><div className="ccb9ee9be" /><div className="c982c0b77">or</div><div className="ccb9ee9be" /></div>
          <div className="c9e1cc4e3">
            <div className="c4ef88116">Email</div>
            <div className="c580783d8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: 15, outline: 'none', width: '100%' }}
              />
            </div>
          </div>
          <div className="cac95cb05">
            <div className="c5fd6f910">
              <div className="c4ef88116">Password</div>
              <Link className="link-reset c73167643" to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="cb3bb90c7">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: 15, outline: 'none', width: '100%' }}
              />
            </div>
          </div>
          {error && <div style={{ color: '#C0392B', fontSize: 13, marginTop: -8 }}>{error}</div>}
          <div className="c0452cf75">
            <button type="submit" className="link-reset cb18a41d9" style={{ cursor: 'pointer', border: 'none', opacity: loading ? 0.6 : 1 }} disabled={loading}>
              <div className="ca0488f65">{loading ? 'Signing in…' : 'Sign In'}</div>
            </button>
            <Link className="link-reset cae99bc63" to="/register">
              <div className="c101d052c">New to Sizzle?</div>
              <div className="c1ae11093">Create an account</div>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
