import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export function ResetLinkExpiredPage() {
  return (
    <div className="auth-layout"><aside className="auth-left"><Brand className="sync-logo" titleClassName="" /><div className="auth-hero"><h1>This link expired.</h1><p>No problem. Request a fresh reset link and we’ll get you back on track in a minute.</p></div><div className="auth-foot">Fast pickups start with fast recovery.</div></aside><main className="auth-right"><div className="auth-panel"><h2>Request a New Reset Link</h2><div className="sync-subtitle">For security, reset links expire quickly. Enter your email again and we’ll send a fresh one.</div><label className="auth-field"><span className="sync-label">Email</span><input className="auth-input" type="email" defaultValue="jane@example.com" /></label><Link className="link-reset sync-button-dark" to="/reset-link-sent">Send Fresh Link</Link><div className="sync-card auth-note-card"><div className="sync-row-title">Need another sign-in option?</div><div className="sync-subtitle" style={{ maxWidth: 'none' }}>Use Apple or Google on the login screen if you connected your account there first.</div></div><Link className="link-reset" style={{ alignSelf: 'center', color: '#8f887b' }} to="/login">Remembered it? Sign in</Link></div></main></div>
  );
}
