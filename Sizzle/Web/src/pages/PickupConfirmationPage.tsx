import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { getOrderById, updateOrderStatus } from '../lib/services/orders';

export function PickupConfirmationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lastOrder } = useCart();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  const orderIdParam = params.get('id');
  const [loading, setLoading] = useState(!!orderIdParam);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderById>> | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!orderIdParam) {
        setOrder(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getOrderById(orderIdParam);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderIdParam]);

  const vendorName = order?.vendor?.name || lastOrder?.vendorName || "Marco's Street Tacos";
  const orderIdDisplay = useMemo(() => {
    const raw = order?.id || lastOrder?.orderId || 'SZ-4821';
    return String(raw);
  }, [order?.id, lastOrder?.orderId]);

  const pickupCode = useMemo(() => {
    // If UUID, show short code; if SZ-####, show numeric portion
    if (orderIdDisplay.startsWith('SZ-')) return orderIdDisplay.replace('SZ-', '');
    return orderIdDisplay.slice(0, 6).toUpperCase();
  }, [orderIdDisplay]);

  const confirmPickup = async () => {
    const orderId = order?.id ? String(order.id) : null;
    setConfirmError(null);
    setConfirming(true);
    try {
      if (orderId) {
        await updateOrderStatus(orderId, 'picked_up');
      }
      navigate(`/pickup-complete?id=${encodeURIComponent(orderId ?? orderIdDisplay)}`);
    } catch (e: any) {
      setConfirmError(e?.message || 'Could not confirm pickup. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="cpu_wrap">
      <div className="cpu_nav">
        <Brand className="cpu_logo" titleClassName="cpu_wordmark" />
        <div className="cpu_avatar">{initial}</div>
      </div>
      <div className="cpu_main">
        <div className="cpu_check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="cpu_title">Order Ready!</div>
        <div className="cpu_subtitle">{loading ? 'Loading order…' : `Your order at ${vendorName} is ready for pickup`}</div>
        <div className="cpu_code_card">
          <div className="cpu_code_label">SHOW THIS CODE TO THE VENDOR</div>
          <div className="cpu_code_num">{pickupCode}</div>
          <div className="cpu_barcode">
            <div className="cpu_bar cpu_b1" /><div className="cpu_bar cpu_b2" /><div className="cpu_bar cpu_b3" /><div className="cpu_bar cpu_b4" /><div className="cpu_bar cpu_b5" /><div className="cpu_bar cpu_b6" /><div className="cpu_bar cpu_b7" /><div className="cpu_bar cpu_b8" /><div className="cpu_bar cpu_b9" /><div className="cpu_bar cpu_b10" /><div className="cpu_bar cpu_b11" /><div className="cpu_bar cpu_b12" /><div className="cpu_bar cpu_b13" />
          </div>
          <div className="cpu_code_order">Order #{orderIdDisplay.slice(0, 8)} · {vendorName}</div>
        </div>
        <div className="cpu_actions">
          <button
            type="button"
            className="link-reset cpu_btn_primary"
            onClick={confirmPickup}
            disabled={loading || confirming || !order?.id}
            style={{ opacity: (loading || confirming || !order?.id) ? 0.6 : 1, cursor: (loading || confirming || !order?.id) ? 'not-allowed' : 'pointer' }}
          >
            <div className="cpu_btn_text_w">{confirming ? 'Confirming…' : 'Confirm Pickup'}</div>
          </button>
          <Link className="link-reset cpu_btn_secondary" to="/search">
            <div className="cpu_btn_text_d">Browse More</div>
          </Link>
          {confirmError && (
            <div style={{ color: '#B42318', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
              {confirmError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
