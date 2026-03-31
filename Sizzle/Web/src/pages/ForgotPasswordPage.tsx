import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordReset } from '../lib/services/auth';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      navigate('/reset-link-sent');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cfp_wrap">
      <div className="cfp_left">
        <Link className="link-reset cfp_logo" to="/"><div className="cfp_icon"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div><div className="cfp_wordmark">Sizzle</div></Link>
        <div className="cfp_hero"><div className="cfp_headline">No worries,<br />we've got you.</div><div className="cfp_subtext">We'll send a reset link to your inbox. Back to your street food in no time.</div></div>
        <div className="cfp_foot">Loved by 12,000+ food lovers in San Francisco</div>
      </div>
      <div className="cfp_right">
        <form className="cfp_form" onSubmit={handleSubmit}>
          <div className="cfp_title">Reset your password</div>
          <div className="cfp_subtitle">Enter your email and we'll send you a reset link</div>
          <div className="cfp_field">
            <div className="cfp_label">EMAIL</div>
            <input className="cfp_input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {error && <div style={{ color: '#C0392B', fontSize: 13, marginTop: 4 }}>{error}</div>}
          <button type="submit" className="link-reset cfp_btn" style={{ cursor: 'pointer', border: 'none', opacity: loading ? 0.6 : 1 }} disabled={loading}>
            <div className="cfp_btn_text">{loading ? 'Sending…' : 'Send Reset Link'}</div>
          </button>
          <Link className="link-reset cfp_back" to="/login">Remembered it? Sign in</Link>
        </form>
      </div>
    </div>
  );
}
