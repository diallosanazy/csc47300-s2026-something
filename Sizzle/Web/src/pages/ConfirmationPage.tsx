import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';

export function ConfirmationPage() {
  const { lastOrder } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  // Fallback if someone lands here directly without placing an order
  if (!lastOrder) {
    return (
      <div className="c8ad40ac4">
        <div className="cef3342eb">
          <Brand />
        </div>
        <div className="c26319fa2">
          <div style={{ color: '#9C9890', fontSize: 15, textAlign: 'center', padding: '80px 20px' }}>
            No order found. <Link className="link-reset" style={{ color: '#FF6B2C', textDecoration: 'underline' }} to="/search">Browse vendors</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="c8ad40ac4">
      <div className="cef3342eb">
        <Brand />
        <Link className="link-reset c8ac7e02f" to="/user-account">
          <div className="c154a3b24">{initial}</div>
        </Link>
      </div>
      <div className="c26319fa2">
        <div className="c14db2eb2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="cdd6fa583">Order Confirmed!</div>
        <div className="caa4fd216">Your order from {lastOrder.vendorName} is being prepared</div>
        <div className="c06a7d494">
          <div className="ca319fcba">
            <div className="c3bc4f4c9">
              <div className="c6ba5ffdb">Order Number</div>
              <div className="c5042c187">#{lastOrder.orderId}</div>
            </div>
            <div className="ca8318696">
              <div className="c28749f1f">Preparing</div>
            </div>
          </div>
          {lastOrder.items.map((item, index) => (
            <div key={item.id} className={index === 0 ? 'c22ac83f0' : 'c2614485d'}>
              <div className="c00c2d284">{item.quantity}x {item.name}</div>
              <div className="c91e3dc28">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="c9d6bea0a">
            <div className="ca1f6e49c">Total</div>
            <div className="c067bebb6">${lastOrder.total.toFixed(2)}</div>
          </div>
        </div>
        <div className="c96da2c0c">
          <div className="ca8e78ae4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#1C1917" strokeWidth="1.5" />
              <path d="M12 6V12L16 14" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="cf20af41d">Estimated pickup: 10–15 minutes</div>
          </div>
          <div className="cd18e7293">
            <div className="ca0b15551"><div className="c0c30553b" /><div className="cc90fbb67" /><div className="cf69eb01b">Confirmed</div></div>
            <div className="ca0b15551"><div className="c118613d8" /><div className="c01c48b19" /><div className="c2c5c44e4">Preparing</div></div>
            <div className="ca0b15551"><div className="cdd19a4a2" /><div className="c0265cbee" /><div className="c4eadbd8f">Ready</div></div>
            <div className="ca0b15551"><div className="cdd19a4a2" /><div className="c0265cbee" /><div className="c4eadbd8f">Picked Up</div></div>
          </div>
        </div>
        <div className="ca12cfc96">
          <Link className="link-reset c628bf992" to={`/order-tracking?id=${encodeURIComponent(lastOrder.orderId)}`}>
            <div className="c154a3b24">Track Order</div>
          </Link>
          <Link className="link-reset c4b20acae" to="/search">
            <div className="c91e3dc28">Browse More Vendors</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
