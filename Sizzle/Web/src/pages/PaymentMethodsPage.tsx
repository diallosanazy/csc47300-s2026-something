import { useState } from 'react';
import { CustomerAccountShell } from '../components/CustomerAccountShell';

interface Card {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  note: string;
}

const INITIAL_CARDS: Card[] = [
  { id: 'visa-4829', brand: 'Visa', last4: '4829', expiry: '09/27', note: 'Billing ZIP 94110' },
  { id: 'mc-1044', brand: 'Mastercard', last4: '1044', expiry: '01/28', note: 'Work lunches' },
];

function CardIcon({ brand }: { brand: string }) {
  return (
    <div style={{ alignItems: 'center', background: brand === 'Visa' ? '#1a1f71' : '#eb001b', borderRadius: 4, color: '#fff', display: 'inline-flex', fontSize: 10, fontWeight: 800, height: 22, justifyContent: 'center', letterSpacing: '0.04em', minWidth: 36, padding: '0 6px' }}>
      {brand === 'Visa' ? 'VISA' : 'MC'}
    </div>
  );
}

export function PaymentMethodsPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [defaultId, setDefaultId] = useState('visa-4829');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', zip: '' });
  const [addError, setAddError] = useState('');
  const [editNote, setEditNote] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const defaultCard = cards.find((c) => c.id === defaultId);
  const otherCards = cards.filter((c) => c.id !== defaultId);

  const handleMakeDefault = (id: string) => setDefaultId(id);

  const handleRemove = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (id === defaultId && cards.length > 1) {
      const next = cards.find((c) => c.id !== id);
      if (next) setDefaultId(next.id);
    }
    setRemovingId(null);
  };

  const handleStartEdit = (card: Card) => {
    setEditingId(card.id);
    setEditNote(card.note);
  };

  const handleSaveEdit = (id: string) => {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, note: editNote } : c));
    setEditingId(null);
  };

  const handleAddCard = () => {
    const digits = newCard.number.replace(/\s/g, '');
    if (digits.length < 13) { setAddError('Enter a valid card number.'); return; }
    if (!newCard.expiry.match(/^\d{2}\/\d{2}$/)) { setAddError('Expiry must be MM/YY.'); return; }
    if (newCard.cvc.length < 3) { setAddError('Enter a valid CVC.'); return; }
    const last4 = digits.slice(-4);
    const brand = digits.startsWith('4') ? 'Visa' : 'Mastercard';
    const id = `card-${Date.now()}`;
    setCards((prev) => [...prev, { id, brand, last4, expiry: newCard.expiry, note: `Billing ZIP ${newCard.zip}` }]);
    setNewCard({ number: '', expiry: '', cvc: '', zip: '' });
    setShowAddForm(false);
    setAddError('');
  };

  const inputStyle = { background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#1C1917', fontSize: 14, outline: 'none', padding: '10px 12px', width: '100%', boxSizing: 'border-box' as const };
  const btnOutline = { background: 'none', border: '1.5px solid #E8E6E1', borderRadius: 8, color: '#6B6963', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px' };
  const btnDark = { background: '#1C1917', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 14px' };

  const addAction = (
    <button onClick={() => { setShowAddForm((s) => !s); setAddError(''); }} style={{ ...btnDark, fontSize: 14, padding: '10px 20px' }}>
      {showAddForm ? 'Cancel' : 'Add New Card'}
    </button>
  );

  return (
    <CustomerAccountShell active="payments" title="Payment Methods" subtitle="Choose how you pay, update expired cards, and set your default checkout method." actions={addAction}>

      {/* Add card form */}
      {showAddForm && (
        <div style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 16, marginBottom: 24, padding: 24 }}>
          <div style={{ color: '#1C1917', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>New Card</div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ color: '#6B6963', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Card Number</div>
              <input style={inputStyle} placeholder="1234 5678 9012 3456" value={newCard.number}
                onChange={(e) => setNewCard((n) => ({ ...n, number: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#6B6963', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expiry</div>
                <input style={inputStyle} placeholder="MM/YY" value={newCard.expiry}
                  onChange={(e) => setNewCard((n) => ({ ...n, expiry: e.target.value }))} />
              </div>
              <div>
                <div style={{ color: '#6B6963', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CVC</div>
                <input style={inputStyle} placeholder="123" value={newCard.cvc}
                  onChange={(e) => setNewCard((n) => ({ ...n, cvc: e.target.value }))} />
              </div>
              <div>
                <div style={{ color: '#6B6963', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ZIP</div>
                <input style={inputStyle} placeholder="94110" value={newCard.zip}
                  onChange={(e) => setNewCard((n) => ({ ...n, zip: e.target.value }))} />
              </div>
            </div>
            {addError && <div style={{ color: '#C0392B', fontSize: 13 }}>{addError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnOutline} onClick={() => { setShowAddForm(false); setAddError(''); }}>Cancel</button>
              <button style={btnDark} onClick={handleAddCard}>Add Card</button>
            </div>
          </div>
        </div>
      )}

      {/* Default card */}
      {defaultCard && (
        <div className="sync-dark-card sync-section-card-lg sync-spread">
          <div className="sync-stack" style={{ gap: 8 }}>
            <div className="sync-label">Default Payment</div>
            <div style={{ alignItems: 'center', display: 'flex', gap: 10, fontSize: 22, fontWeight: 800 }}>
              <CardIcon brand={defaultCard.brand} />
              {defaultCard.brand} ending in {defaultCard.last4}
            </div>
            {editingId === defaultCard.id ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', width: 220 }}
                  value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                <button style={{ ...btnDark, background: '#FF6B2C' }} onClick={() => handleSaveEdit(defaultCard.id)}>Save</button>
                <button style={{ ...btnOutline, borderColor: 'rgba(255,255,255,0.2)', color: '#ccc' }} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="sync-muted">Expires {defaultCard.expiry} · {defaultCard.note}</div>
            )}
          </div>
          <div className="sync-inline-actions">
            {editingId !== defaultCard.id && (
              <button style={{ ...btnOutline, borderColor: 'rgba(255,255,255,0.2)', color: '#ccc' }} onClick={() => handleStartEdit(defaultCard)}>Edit</button>
            )}
            <span style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, color: '#ccc', fontSize: 13, fontWeight: 600, padding: '7px 14px' }}>Default</span>
          </div>
        </div>
      )}

      {/* Other cards */}
      {otherCards.map((card) => (
        <div key={card.id} className="sync-row-card">
          {removingId === card.id ? (
            <div style={{ alignItems: 'center', display: 'flex', flex: 1, gap: 12 }}>
              <div style={{ color: '#1C1917', fontSize: 14 }}>Remove <strong>{card.brand} ···{card.last4}</strong>?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnOutline} onClick={() => setRemovingId(null)}>Keep it</button>
                <button style={{ ...btnDark, background: '#C0392B' }} onClick={() => handleRemove(card.id)}>Remove</button>
              </div>
            </div>
          ) : (
            <>
              <div className="sync-row-copy">
                <div style={{ alignItems: 'center', display: 'flex', gap: 10, fontSize: 18, fontWeight: 800 }}>
                  <CardIcon brand={card.brand} />
                  {card.brand} ending in {card.last4}
                </div>
                {editingId === card.id ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input style={{ ...inputStyle, width: 200 }} value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                    <button style={btnDark} onClick={() => handleSaveEdit(card.id)}>Save</button>
                    <button style={btnOutline} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="sync-muted">Expires {card.expiry} · {card.note}</div>
                )}
              </div>
              {editingId !== card.id && (
                <div className="sync-inline-actions">
                  <button style={btnOutline} onClick={() => handleStartEdit(card)}>Edit</button>
                  <button style={btnOutline} onClick={() => handleMakeDefault(card.id)}>Make Default</button>
                  <button style={{ ...btnOutline, borderColor: '#f5c6c6', color: '#C0392B' }} onClick={() => setRemovingId(card.id)}>Remove</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Billing address + wallets */}
      <div className="sync-grid sync-grid-2">
        <div className="sync-card sync-section-card">
          <div className="sync-label">Billing Address</div>
          <div className="sync-stack" style={{ gap: 4, marginTop: 8 }}>
            <div className="sync-row-title">123 Valencia St. Apt 4</div>
            <div className="sync-muted">San Francisco, CA 94110</div>
          </div>
        </div>
        <div className="sync-card sync-section-card">
          <div className="sync-label">Wallets</div>
          <div className="sync-stack" style={{ gap: 4, marginTop: 8 }}>
            <div className="sync-row-title">Apple Pay enabled</div>
            <div className="sync-muted">Use Face ID at checkout whenever your device supports it.</div>
          </div>
        </div>
      </div>
    </CustomerAccountShell>
  );
}
