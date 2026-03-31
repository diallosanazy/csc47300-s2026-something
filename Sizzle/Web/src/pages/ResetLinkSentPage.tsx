import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export function ResetLinkSentPage() {
  return (
    <div className="auth-layout"><aside className="auth-left"><Brand className="sync-logo" titleClassName="" /><div className="auth-hero"><h1>Check your inbox.</h1><p>We sent a password reset link to help you get back to your next pickup faster.</p></div><div className="auth-foot">Loved by 12,000+ food lovers in San Francisco</div></aside><main className="auth-right"><div className="auth-panel"><h2>Reset Link Sent</h2><div className="sync-subtitle">We sent instructions to jane@example.com. The link expires in 30 minutes for security.</div><div className="sync-card auth-note-card"><div className="sync-row-title">Didn’t get the email?</div><div className="sync-subtitle" style={{ maxWidth: 'none' }}>Check spam, wait a minute, or resend the link. You can also return to sign in with Apple or Google.</div></div><Link className="link-reset sync-button-dark" to="/reset-link-sent">Resend Reset Link</Link><Link className="link-reset sync-button-outline" to="/login">Back to Sign In</Link></div></main></div>
  );
}
