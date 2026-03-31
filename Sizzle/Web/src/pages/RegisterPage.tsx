import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpCustomer } from '../lib/services/auth';
import { supabase } from '../lib/supabaseClient';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName) { setError('Enter your full name.'); return; }
    if (!form.email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('You must agree to the Terms of Service.'); return; }
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`;
      await signUpCustomer(form.email, form.password, fullName);
      // Update phone if provided
      if (form.phone) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ phone: form.phone }).eq('id', user.id);
      }
      navigate('/search');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'none', border: 'none', color: '#1C1917', fontSize: 15, outline: 'none', width: '100%' };

  return (
    <div className="c2019817c">
      <div className="cba42d34d">
        <Link className="link-reset cedfc72fd" to="/">
          <div className="c80980012"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div>
          <div className="c1d2600e1">Sizzle</div>
        </Link>
        <div className="c25c152b2">
          <div className="c2d95caf9">Find your next<br />favorite street<br />food spot.</div>
          <div className="c486496ea">Create an account to save vendors, reorder fast, and track every pickup.</div>
        </div>
      </div>
      <div className="cc2dc37af">
        <form className="c881f17af" style={{ display: 'contents' }} onSubmit={handleSubmit}>
          <div className="c881f17af">
            <Link className="link-reset ccdaa188e" to="/login">
              <div className="c101d052c">Already have an account?</div>
              <div className="c5a22ee9f">Sign in</div>
            </Link>
          </div>
          <div className="cc6ff8010">Create your account</div>
          <div className="ce0a55529">Tell us a few details to get started</div>
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          <div className="c91154ccb">
            <div className="cdb25641d"><div className="c4ef88116">First name</div><div className="c94812fc8"><input style={inputStyle} placeholder="Jane" value={form.firstName} onChange={set('firstName')} /></div></div>
            <div className="cdb25641d"><div className="c4ef88116">Last name</div><div className="c94812fc8"><input style={inputStyle} placeholder="Doe" value={form.lastName} onChange={set('lastName')} /></div></div>
          </div>
          <div className="c98642753">
            <div className="cdb25641d"><div className="c4ef88116">Email</div><div className="c94812fc8"><input type="email" style={inputStyle} placeholder="jane@example.com" value={form.email} onChange={set('email')} /></div></div>
            <div className="cdb25641d"><div className="c4ef88116">Phone</div><div className="c94812fc8"><input type="tel" style={inputStyle} placeholder="(415) 555-0182" value={form.phone} onChange={set('phone')} /></div></div>
          </div>
          <div className="c98642753">
            <div className="cdb25641d"><div className="c4ef88116">Password</div><div className="c29aeea0c"><input type="password" style={inputStyle} placeholder="••••••••••" value={form.password} onChange={set('password')} /></div></div>
            <div className="cdb25641d"><div className="c4ef88116">Confirm password</div><div className="c29aeea0c"><input type="password" style={inputStyle} placeholder="••••••••••" value={form.confirm} onChange={set('confirm')} /></div></div>
          </div>
          <div className="c08855b11">
            <div className="c80b80899">
              <div className="cb4c6c4bc" onClick={() => setAgreed((a) => !a)} style={{ cursor: 'pointer', background: agreed ? '#FF6B2C' : 'transparent', border: agreed ? 'none' : '1.5px solid #9C9890', borderRadius: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {agreed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div><div className="c55def3dc">I agree to the </div><div className="c015b14f3">Terms of Service</div></div>
            </div>
            <button type="submit" className="link-reset cbbe62cc7" style={{ cursor: 'pointer', border: 'none', opacity: loading ? 0.6 : 1 }} disabled={loading}>
              <div className="ca0488f65">{loading ? 'Creating…' : 'Create Account'}</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
