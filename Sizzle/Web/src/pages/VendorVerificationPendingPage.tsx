import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export function VendorVerificationPendingPage() {
  const [supportSent, setSupportSent] = useState(false);

  return (
    <div className="auth-layout">
      <aside className="auth-left" style={{ background: '#1f1b19' }}>
        <Brand className="sync-logo" titleClassName="" />
        <div className="auth-hero">
          <div className="sync-label" style={{ color: '#9f998f' }}>Application Status</div>
          <h1>You're almost live.</h1>
          <p>We've received your business profile, menu, hours, and payout details. Our team is reviewing everything now.</p>
        </div>
        <div className="sync-stack" style={{ color: '#4ba775', fontWeight: 700, gap: 12, marginTop: 'auto' }}>
          <span>✓ Business profile complete</span>
          <span>✓ Menu setup complete</span>
          <span>✓ Hours &amp; location complete</span>
          <span>✓ Payout setup complete</span>
        </div>
      </aside>
      <main className="auth-right">
        <div className="auth-panel" style={{ width: 'min(820px,100%)' }}>
          {supportSent && (
            <div style={{ alignItems: 'center', background: '#F0FAF4', border: '1px solid #B7E4C7', borderRadius: 10, color: '#2D6A4F', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, marginBottom: 20, padding: '12px 16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Message sent — our team will reach out within 1 business day.
            </div>
          )}
          <div className="sync-card sync-section-card-lg">
            <div className="sync-eyebrow">Review In Progress</div>
            <h2 style={{ marginTop: 12 }}>Expected approval in 1–2 business days</h2>
            <div className="sync-subtitle" style={{ maxWidth: 'none' }}>We'll email and text Marco's Street Tacos as soon as the storefront is approved. You can still update your menu and business details while you wait.</div>
          </div>
          <div className="sync-grid sync-grid-2">
            <div className="sync-card sync-section-card">
              <div className="sync-label">What happens next</div>
              <div className="sync-row-title" style={{ marginTop: 10 }}>We verify your payout account and business details</div>
              <div className="sync-subtitle" style={{ maxWidth: 'none' }}>If anything needs to be fixed, we'll send a task list here instead of making you restart onboarding.</div>
            </div>
            <div className="sync-card sync-section-card">
              <div className="sync-label">While you wait</div>
              <div className="sync-row-title" style={{ marginTop: 10 }}>Keep refining your menu and prep times</div>
              <div className="sync-subtitle" style={{ maxWidth: 'none' }}>You can edit dishes, upload photos, and plan your first go-live window before approval lands.</div>
            </div>
          </div>
          <div className="sync-inline-actions">
            <Link className="link-reset sync-button" to="/vendor-onboarding">Edit Storefront</Link>
            <button
              className="link-reset sync-button-outline"
              style={{ cursor: 'pointer', border: '1.5px solid #E8E6E1', background: 'none' }}
              onClick={() => setSupportSent(true)}
            >
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
