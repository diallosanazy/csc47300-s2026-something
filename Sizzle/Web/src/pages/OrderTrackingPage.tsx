import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../lib/auth';
import { getOrderById, subscribeToOrder, type OrderStatus } from '../lib/services/orders';
import { supabase } from '../lib/supabaseClient';

function useCountdown(initialSeconds: number, running: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, seconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OrderTrackingPage() {
  const [params] = useSearchParams();
  const { profile, user } = useAuth();
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const orderId = params.get('id');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderById>> | null>(null);

  const statusStep = useMemo(() => {
    const s = order?.status as OrderStatus | undefined;
    if (!s) return 0;
    if (s === 'placed' || s === 'accepted') return 1;
    if (s === 'preparing') return 2;
    if (s === 'ready') return 3;
    if (s === 'picked_up') return 4;
    return 1;
  }, [order?.status]);

  const timerRunning = statusStep < 3;
  const timer = useCountdown(522, timerRunning); // 8:42

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!orderId) {
        setOrder(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const channel = subscribeToOrder(orderId, (next) => {
      // Keep existing joins (items/vendor) and just update order fields
      setOrder((prev) => (prev ? { ...prev, ...next } : prev));
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!orderId || (!loading && !order)) {
    return (
      <div className="cot_wrap">
        <div className="cot_nav">
          <Brand className="cot_logo" titleClassName="cot_wordmark" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
          <div style={{ color: '#9C9890', fontSize: 15 }}>
            {loading ? 'Loading…' : 'No active order.'}{' '}
            <Link className="link-reset" style={{ color: '#FF6B2C', textDecoration: 'underline' }} to="/search">Browse vendors</Link>
          </div>
        </div>
      </div>
    );
  }

  const vendorName = order?.vendor?.name || 'Vendor';
  const vendorFirstName = vendorName.split(' ')[0];
  const itemCount = order?.order_items?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0;
  const subtotal = (order?.subtotal_cents ?? 0) / 100;
  const serviceFee = (order?.service_fee_cents ?? 0) / 100;
  const tax = (order?.tax_cents ?? 0) / 100;
  const total = (order?.total_cents ?? 0) / 100;
  const statusMessage =
    statusStep <= 1 ? `${vendorFirstName} received your order`
      : statusStep === 2 ? `${vendorFirstName} is preparing your order`
        : statusStep === 3 ? `Your order is ready for pickup`
          : `Picked up`;

  return (
    <div className="cot_wrap">
      <div className="cot_nav">
        <Brand className="cot_logo" titleClassName="cot_wordmark" />
        <div className="cot_avatar">{initial}</div>
      </div>
      <div className="cot_body">
        <div className="cot_left">
          <div className="cot_live_row">
            <div className="cot_live_dot" />
            <div className="cot_live_txt">LIVE TRACKING</div>
          </div>
          <div className="cot_order_id">Order #{String(order?.id).slice(0, 8)}</div>
          <div className="cot_order_meta">{vendorName} · {itemCount} item{itemCount !== 1 ? 's' : ''} · ${total.toFixed(2)}</div>
          <div className="cot_status_card">
            <div className="cot_steps">
              <div className={statusStep >= 1 ? 'cot_step_done' : 'cot_step_pending'}>
                <div className={`cot_step_circle ${statusStep >= 1 ? 'cot_circle_done' : 'cot_circle_pending'}`}>
                  {statusStep >= 1 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
                </div>
                <div className={statusStep >= 1 ? 'cot_step_label_done' : 'cot_step_label_pending'}>Confirmed</div>
              </div>
              <div className={`cot_line ${statusStep >= 2 ? 'cot_line_done' : 'cot_line_pending'}`} />
              <div className={statusStep === 2 ? 'cot_step_active' : statusStep > 2 ? 'cot_step_done' : 'cot_step_pending'}>
                <div className={`cot_step_circle ${statusStep > 2 ? 'cot_circle_done' : statusStep === 2 ? 'cot_circle_active' : 'cot_circle_pending'}`} />
                <div className={statusStep === 2 ? 'cot_step_label_active' : statusStep > 2 ? 'cot_step_label_done' : 'cot_step_label_pending'}>Preparing</div>
              </div>
              <div className={`cot_line ${statusStep >= 3 ? 'cot_line_done' : 'cot_line_pending'}`} />
              <div className={statusStep === 3 ? 'cot_step_active' : statusStep > 3 ? 'cot_step_done' : 'cot_step_pending'}>
                <div className={`cot_step_circle ${statusStep > 3 ? 'cot_circle_done' : statusStep === 3 ? 'cot_circle_active' : 'cot_circle_pending'}`} />
                <div className={statusStep === 3 ? 'cot_step_label_active' : statusStep > 3 ? 'cot_step_label_done' : 'cot_step_label_pending'}>Ready</div>
              </div>
              <div className={`cot_line ${statusStep >= 4 ? 'cot_line_done' : 'cot_line_pending'}`} />
              <div className={statusStep >= 4 ? 'cot_step_done' : 'cot_step_pending'}>
                <div className={`cot_step_circle ${statusStep >= 4 ? 'cot_circle_done' : 'cot_circle_pending'}`} />
                <div className={statusStep >= 4 ? 'cot_step_label_done' : 'cot_step_label_pending'}>Picked Up</div>
              </div>
            </div>
            <div className="cot_status_msg">
              <div className="cot_msg_text">{statusMessage}</div>
              <div className="cot_msg_sub">Estimated ready in 8–12 minutes</div>
            </div>
          </div>
          <div className="cot_map">
            <div className="cot_map_grid">
              <div className="cot_map_pin">{vendorName}</div>
              <div className="cot_user_dot" />
              <div className="cot_distance_tag">0.3 mi away</div>
            </div>
          </div>
        </div>
        <div className="cot_right">
          <div className="cot_summary_title">Your Order</div>
          {(order?.order_items ?? []).map((item) => (
            <div key={item.id} className="cot_item_row">
              <div className="cot_item_left">
                <div className="cot_item_name">{item.quantity}x {item.name_snapshot}</div>
              </div>
              <div className="cot_item_price">${(((item.price_cents_snapshot ?? 0) / 100) * (item.quantity ?? 0)).toFixed(2)}</div>
            </div>
          ))}
          <div className="cot_divider" />
          <div className="cot_subtotal_row"><div className="cot_sub_label">Subtotal</div><div className="cot_sub_val">${subtotal.toFixed(2)}</div></div>
          <div className="cot_subtotal_row"><div className="cot_sub_label">Service fee</div><div className="cot_sub_val">${serviceFee.toFixed(2)}</div></div>
          <div className="cot_subtotal_row"><div className="cot_sub_label">Tax</div><div className="cot_sub_val">${tax.toFixed(2)}</div></div>
          <div className="cot_total_row"><div className="cot_total_label">Total</div><div className="cot_total_val">${total.toFixed(2)}</div></div>
          <div className="cot_timer_card">
            {statusStep >= 3 ? (
              <>
                <div className="cot_timer_label">Ready for pickup</div>
                <div className="cot_timer_num">Now</div>
                <div className="cot_timer_unit"> </div>
              </>
            ) : (
              <>
                <div className="cot_timer_label">Estimated ready in</div>
                <div className="cot_timer_num">{timer}</div>
                <div className="cot_timer_unit">minutes</div>
              </>
            )}
          </div>
          <Link className="link-reset cot_cta" to={`/pickup-confirmation?id=${encodeURIComponent(String(order?.id ?? ''))}`}>I've Arrived</Link>
        </div>
      </div>
    </div>
  );
}
