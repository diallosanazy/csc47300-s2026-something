import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function VendorOnboardingPayoutPage() {
  const navigate = useNavigate();
  const [accountHolder, setAccountHolder] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');

  const handleContinue = () => {
    navigate('/vendor-verification-pending');
  };

  return (
    <div className="cvob_layout">
      <div className="cvob_left">
        <Link to="/" className="link-reset cvob_logo">
          <div className="cvob_logo-icon"><img src="/assets/food-stand.png" alt="Sizzle" width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} /></div>
          <div className="cvob_logo-text">Sizzle</div>
        </Link>
        <div className="cvob_left-content">
          <div className="cvob_step-label">STEP 4 OF 4</div>
          <h1 className="cvob_left-title">Payout setup.</h1>
          <p className="cvob_left-subtitle">Tell us where to send your earnings. Payouts are processed weekly with no hidden fees.</p>
          <div className="cvob_steps">
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Business profile</span></div>
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Menu setup</span></div>
            <div className="cvob_step cvob_step-done"><div className="cvob_step-check">✓</div><span>Hours &amp; location</span></div>
            <div className="cvob_step cvob_step-current"><div className="cvob_step-circle">4</div><span>Payout setup</span></div>
          </div>
        </div>
        <div className="cvob_left-footer">You can skip any step and come back later</div>
      </div>
      <div className="cvob_right">
        <div className="cvob_form">
          <h2 className="cvob_form-title">Bank account details</h2>
          <p className="cvob_form-subtitle">We'll deposit your earnings directly into this account</p>

          <div className="cvob_payout-card">
            <div className="cvob_field">
              <label className="cvob_label">ACCOUNT HOLDER NAME</label>
              <input type="text" className="cvob_input" placeholder="e.g. Marco Alvarez" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
            </div>
            <div className="cvob_payout-row">
              <div className="cvob_field">
                <label className="cvob_label">ROUTING NUMBER</label>
                <input type="text" className="cvob_input" placeholder="9 digits" maxLength={9} value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="cvob_field">
                <label className="cvob_label">ACCOUNT NUMBER</label>
                <input type="text" className="cvob_input" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <div className="cvob_field">
              <label className="cvob_label">ACCOUNT TYPE</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setAccountType('checking')}
                  style={{
                    background: accountType === 'checking' ? '#1C1917' : '#FFFFFF',
                    border: accountType === 'checking' ? '1.5px solid #1C1917' : '1.5px solid #E8E6E1',
                    borderRadius: 10,
                    color: accountType === 'checking' ? '#FFFFFF' : '#1C1917',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '10px 22px',
                  }}
                >
                  Checking
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('savings')}
                  style={{
                    background: accountType === 'savings' ? '#1C1917' : '#FFFFFF',
                    border: accountType === 'savings' ? '1.5px solid #1C1917' : '1.5px solid #E8E6E1',
                    borderRadius: 10,
                    color: accountType === 'savings' ? '#FFFFFF' : '#1C1917',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '10px 22px',
                  }}
                >
                  Savings
                </button>
              </div>
            </div>
          </div>

          <div className="cvob_payout-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#6B6963" strokeWidth="1.5"/><path d="M12 16V12M12 8h.01" stroke="#6B6963" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Your banking information is encrypted and stored securely. Payouts are processed every Thursday.
          </div>

          <div className="cvob_actions">
            <button type="button" className="cvob_btn-skip" onClick={() => navigate('/vendor-verification-pending')}>Skip for now</button>
            <button type="button" className="cvob_btn-continue" onClick={handleContinue}>Finish Setup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
