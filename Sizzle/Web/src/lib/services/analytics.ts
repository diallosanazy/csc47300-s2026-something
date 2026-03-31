import { supabase } from '../supabaseClient';

export type Period = 'today' | 'week' | 'month' | 'all';

function periodStart(period: Period): string | null {
  const now = new Date();
  switch (period) {
    case 'today': {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case 'month': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case 'all':
      return null;
  }
}

export interface VendorAnalytics {
  totalRevenueCents: number;
  orderCount: number;
  avgOrderCents: number;
  uniqueCustomers: number;
  topItems: Array<{ name: string; quantity: number; revenueCents: number }>;
}

/** Aggregate order stats for the vendor dashboard analytics page */
export async function getVendorAnalytics(
  vendorId: string,
  period: Period = 'week'
): Promise<VendorAnalytics> {
  const start = periodStart(period);

  let ordersQuery = supabase
    .from('orders')
    .select('id, user_id, total_cents, order_items(name_snapshot, price_cents_snapshot, quantity)')
    .eq('vendor_id', vendorId)
    .in('status', ['accepted', 'preparing', 'ready', 'picked_up']);

  if (start) {
    ordersQuery = ordersQuery.gte('placed_at', start);
  }

  const { data: orders, error } = await ordersQuery;
  if (error) throw error;

  const totalRevenueCents = orders.reduce((sum, o) => sum + o.total_cents, 0);
  const orderCount = orders.length;
  const avgOrderCents = orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.user_id)).size;

  // Aggregate top items
  const itemMap = new Map<string, { quantity: number; revenueCents: number }>();
  for (const order of orders) {
    for (const item of (order.order_items as Array<{ name_snapshot: string; price_cents_snapshot: number; quantity: number }>)) {
      const existing = itemMap.get(item.name_snapshot) ?? { quantity: 0, revenueCents: 0 };
      itemMap.set(item.name_snapshot, {
        quantity: existing.quantity + item.quantity,
        revenueCents: existing.revenueCents + item.price_cents_snapshot * item.quantity,
      });
    }
  }

  const topItems = Array.from(itemMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return { totalRevenueCents, orderCount, avgOrderCents, uniqueCustomers, topItems };
}

/** Daily revenue series for charting (last N days) */
export async function getDailyRevenue(
  vendorId: string,
  days = 7
): Promise<Array<{ date: string; revenueCents: number; orders: number }>> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('placed_at, total_cents')
    .eq('vendor_id', vendorId)
    .in('status', ['accepted', 'preparing', 'ready', 'picked_up'])
    .gte('placed_at', start.toISOString());
  if (error) throw error;

  // Build a map day → { revenue, count }
  const dayMap = new Map<string, { revenueCents: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dayMap.set(d.toISOString().slice(0, 10), { revenueCents: 0, orders: 0 });
  }

  for (const row of data) {
    const key = row.placed_at.slice(0, 10);
    const existing = dayMap.get(key);
    if (existing) {
      existing.revenueCents += row.total_cents;
      existing.orders += 1;
    }
  }

  return Array.from(dayMap.entries()).map(([date, stats]) => ({ date, ...stats }));
}
