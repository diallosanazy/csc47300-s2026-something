import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useCart } from '../lib/cart';

const SERVICE_FEE = 1.5;
const TAX_RATE = 0.0875;

export function CartPage() {
  const { cart, removeItem, updateQuantity, subtotal, placeOrder } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState<'asap' | 'later'>('asap');

  const tax = subtotal * TAX_RATE;
  const total = subtotal + SERVICE_FEE + tax;

  const vendorHref = cart.vendorId ? `/vendor?id=${cart.vendorId}` : '/search';

  if (cart.items.length === 0) {
    return (
      <div className="c8ad40ac4">
        <div className="cef3342eb">
          <Brand />
          <Link className="link-reset c042c85a1" to="/search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="c91e3dc28">Browse vendors</div>
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6V20C3 20.53 3.211 21.039 3.586 21.414C3.961 21.789 4.47 22 5 22H19C19.53 22 20.039 21.789 20.414 21.414C20.789 21.039 21 20.53 21 20V6L18 2H6Z" stroke="#C5C5C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6H21" stroke="#C5C5C0" strokeWidth="1.5" />
          </svg>
          <div style={{ color: '#1C1917', fontSize: 18, fontWeight: 600 }}>Your cart is empty</div>
          <div style={{ color: '#9C9890', fontSize: 14 }}>Add items from a vendor to get started</div>
          <Link className="link-reset" to="/search" style={{ marginTop: 8, background: '#FF6B2C', color: '#fff', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600 }}>
            Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="c8ad40ac4">
      <div className="cef3342eb">
        <Brand />
        <div />
        <div style={{ width: 420, display: 'flex', justifyContent: 'flex-start' }}>
          <Link className="link-reset c042c85a1" to={vendorHref}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="c91e3dc28">Back to {cart.vendorName}</div>
          </Link>
        </div>
      </div>
      <div className="c5a228f84">
        <div className="c1b7bc8e1">
          <div className="cf07ff514">Your Order</div>
          {cart.items.map((item) => (
            <div key={item.id} className="cfc534fcd">
              <div className="cee54018c">
                <div className="ce38123aa">
                  <button
                    className="c3c534919"
                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12H19" stroke="#9C9890" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                  <div className="c5e820c3a">
                    <div className="c1d7926b3">{item.quantity}</div>
                  </div>
                  <button
                    className="c3c534919"
                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>
                <div className="c3bc4f4c9">
                  <div className="cf20af41d">{item.name}</div>
                  <div className="c101d052c">${item.price.toFixed(2)} each</div>
                </div>
              </div>
              <div className="cee54018c">
                <div className="c9407cbad">${(item.price * item.quantity).toFixed(2)}</div>
                <button
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}
                  onClick={() => removeItem(item.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#B5B5B0" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
          ))}
          <div className="c7fececfd">
            <div className="ccf301d68">Special Instructions</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the vendor..."
              className="cdff4e31a"
              style={{ background: '#F8F6F1', border: '1.5px solid #E8E6E1', borderRadius: 10, color: '#1C1917', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, minHeight: 60, outline: 'none', padding: '10px 14px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="c7fececfd">
            <div className="ccf301d68">Pickup Time</div>
            <div className="c44742438">
              <button
                type="button"
                className={pickupTime === 'asap' ? 'cdc294147' : 'ca15a131c'}
                onClick={() => setPickupTime('asap')}
                style={{ cursor: 'pointer' }}
              >
                <div className={pickupTime === 'asap' ? 'c154a3b24' : 'c91e3dc28'}>ASAP (10-15 min)</div>
              </button>
              <button
                type="button"
                className={pickupTime === 'later' ? 'cdc294147' : 'ca15a131c'}
                onClick={() => setPickupTime('later')}
                style={{ cursor: 'pointer' }}
              >
                <div className={pickupTime === 'later' ? 'c154a3b24' : 'c91e3dc28'}>Schedule Later</div>
              </button>
            </div>
          </div>
        </div>
        <div className="c7a1eb7b3">
          <div className="c1fb3d53c">
            <div className="c4c3509a2">Order Summary</div>
            {cart.items.map((item, index) => (
              <div key={item.id} className={index === 0 ? 'c3943d6d5' : 'c774b0b93'}>
                <div className="c00c2d284">{item.quantity}x {item.name}</div>
                <div className="c91e3dc28">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="c64b4015d">
              <div className="c4f642d18">Subtotal</div>
              <div className="c91e3dc28">${subtotal.toFixed(2)}</div>
            </div>
            <div className="cb1774a42">
              <div className="c4f642d18">Service fee</div>
              <div className="c91e3dc28">${SERVICE_FEE.toFixed(2)}</div>
            </div>
            <div className="cc02dd3dc">
              <div className="c4f642d18">Tax</div>
              <div className="c91e3dc28">${tax.toFixed(2)}</div>
            </div>
            <div className="c63f80820">
              <div className="c9407cbad">Total</div>
              <div className="c27a5aa26">${total.toFixed(2)}</div>
            </div>
          </div>
          <div className="c42b9b839">
            <div className="cc45b4167">
              <div className="cedfc72fd">
                <div className="c64da3398">
                  <div className="c0b247e0d">VISA</div>
                </div>
                <div className="c91e3dc28">****4829</div>
              </div>
              <Link className="link-reset cc4223e94" to="/payment-methods">Change</Link>
            </div>
            <button
              className="link-reset c9a5df6ef"
              style={{ cursor: 'pointer', border: 'none', width: '100%' }}
              onClick={async () => { await placeOrder(); navigate('/confirmation'); }}
            >
              <div className="cfb855104">Place Order · ${total.toFixed(2)}</div>
            </button>
            <div className="ce80e09fc">By placing this order you agree to our Terms of Service</div>
          </div>
        </div>
      </div>
    </div>
  );
}
