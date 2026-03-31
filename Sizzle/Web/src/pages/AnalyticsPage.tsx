import { useEffect, useState } from 'react';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { useAuth } from '../lib/auth';
import { getVendorAnalytics } from '../lib/services/analytics';

type Period = 'Today' | 'This Week' | 'This Month' | 'All Time';

const DATA: Record<Period, { revenue: string; orders: number; avg: string; customers: number; revenueChange: string; ordersChange: string; avgChange: string; customersChange: string; dateRange: string; days: number[]; items: { name: string; total: string; pct: number }[] }> = {
  'Today': {
    revenue: '$1,284', orders: 47, avg: '$27.32', customers: 38,
    revenueChange: '+18%', ordersChange: '+12%', avgChange: '+$4', customersChange: '+5%',
    dateRange: 'Mar 9, 2026',
    days: [60, 40, 70, 55, 80, 90, 100],
    items: [
      { name: 'Tacos Al Pastor', total: '$342', pct: 100 },
      { name: 'Burrito Bowl', total: '$286', pct: 84 },
      { name: 'Churros', total: '$154', pct: 45 },
      { name: 'Elote', total: '$114', pct: 33 },
    ],
  },
  'This Week': {
    revenue: '$7,842', orders: 289, avg: '$27.13', customers: 214,
    revenueChange: '+12%', ordersChange: '+8%', avgChange: '+$3', customersChange: '+2%',
    dateRange: 'Mar 3 – Mar 9',
    days: [65, 55, 72, 60, 85, 95, 100],
    items: [
      { name: 'Tacos Al Pastor', total: '$2,394', pct: 100 },
      { name: 'Burrito Bowl', total: '$1,936', pct: 81 },
      { name: 'Churros', total: '$1,148', pct: 48 },
      { name: 'Elote', total: '$894', pct: 37 },
      { name: 'Quesadilla', total: '$780', pct: 33 },
      { name: 'Horchata', total: '$690', pct: 29 },
    ],
  },
  'This Month': {
    revenue: '$31,420', orders: 1142, avg: '$27.51', customers: 820,
    revenueChange: '+9%', ordersChange: '+6%', avgChange: '+$2', customersChange: '+4%',
    dateRange: 'March 2026',
    days: [70, 60, 80, 65, 90, 88, 100],
    items: [
      { name: 'Tacos Al Pastor', total: '$9,640', pct: 100 },
      { name: 'Burrito Bowl', total: '$7,820', pct: 81 },
      { name: 'Churros', total: '$4,600', pct: 48 },
      { name: 'Elote', total: '$3,560', pct: 37 },
      { name: 'Quesadilla', total: '$3,100', pct: 32 },
      { name: 'Horchata', total: '$2,700', pct: 28 },
    ],
  },
  'All Time': {
    revenue: '$148,600', orders: 5420, avg: '$27.42', customers: 3200,
    revenueChange: '', ordersChange: '', avgChange: '', customersChange: '',
    dateRange: 'Jan 2024 – Mar 2026',
    days: [50, 55, 65, 70, 80, 90, 100],
    items: [
      { name: 'Tacos Al Pastor', total: '$45,800', pct: 100 },
      { name: 'Burrito Bowl', total: '$37,200', pct: 81 },
      { name: 'Churros', total: '$22,100', pct: 48 },
      { name: 'Elote', total: '$17,400', pct: 38 },
      { name: 'Quesadilla', total: '$14,600', pct: 32 },
      { name: 'Horchata', total: '$11,500', pct: 25 },
    ],
  },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_CLASSES = ['cb0e74988', 'c82e3853b', 'c9eebd9f0', 'cf0f9e13b', 'c1e3f3b10', 'c6075e115', 'c76b43d06'];

export function AnalyticsPage() {
  const { vendor } = useAuth();
  const [period, setPeriod] = useState<Period>('This Week');
  const d = DATA[period];

  // Load real analytics from DB when vendor is available
  useEffect(() => {
    if (!vendor) return;
    const periodMap: Record<Period, 'today' | 'week' | 'month' | 'all'> = {
      Today: 'today', 'This Week': 'week', 'This Month': 'month', 'All Time': 'all',
    };
    getVendorAnalytics(vendor.id, periodMap[period]).then((analytics) => {
      const rev = analytics.totalRevenueCents / 100;
      if (analytics && rev > 0) {
        DATA[period] = {
          ...DATA[period],
          revenue: `$${rev.toLocaleString()}`,
          orders: analytics.orderCount,
          avg: `$${analytics.orderCount > 0 ? (rev / analytics.orderCount).toFixed(2) : '0.00'}`,
          customers: analytics.uniqueCustomers,
          items: analytics.topItems.map((it, i) => ({
            name: it.name,
            total: `$${(it.revenueCents / 100).toLocaleString()}`,
            pct: i === 0 ? 100 : Math.round((it.revenueCents / analytics.topItems[0].revenueCents) * 100),
          })),
        };
      }
    }).catch(() => {});
  }, [vendor, period]);

  return (
    <VendorDashboardShell active="analytics" title="Analytics">
      <div className="c6cb854e6">
        <div className="c22a549f8">
          {(['Today', 'This Week', 'This Month', 'All Time'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className={p === period ? 'cb17fe462' : 'c85337102'}>
                <div className={p === period ? 'cdcd2b2f2' : 'ce2c651e4'}>{p}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="c711575ea">
        <div className="c7ac95698">
          <div className="cc30e2d67">Revenue</div>
          <div className="c6364f81b">
            <div className="c00507de5">{d.revenue}</div>
            {d.revenueChange && <div className="c28749f1f">{d.revenueChange}</div>}
          </div>
        </div>
        <div className="c7ac95698">
          <div className="cc30e2d67">Orders</div>
          <div className="c6364f81b">
            <div className="c00507de5">{d.orders}</div>
            {d.ordersChange && <div className="c28749f1f">{d.ordersChange}</div>}
          </div>
        </div>
        <div className="c7ac95698">
          <div className="cc30e2d67">Avg. Order</div>
          <div className="c6364f81b">
            <div className="c00507de5">{d.avg}</div>
            {d.avgChange && <div className="c28749f1f">{d.avgChange}</div>}
          </div>
        </div>
        <div className="c7ac95698">
          <div className="cc30e2d67">Customers</div>
          <div className="c6364f81b">
            <div className="c00507de5">{d.customers}</div>
            {d.customersChange && <div className="c106aa6c7">{d.customersChange}</div>}
          </div>
        </div>
      </div>

      <div className="c0b385a3c">
        <div className="ce37de05b">
          <div className="c54f339ae">
            <div className="c9407cbad">Revenue by Day</div>
            <div className="ce2c651e4">{d.dateRange}</div>
          </div>
          <div className="c9dac2f82">
            {DAY_LABELS.map((label, i) => (
              <div key={label} className="cf539b4b5">
                <div className={BAR_CLASSES[i]} style={{ height: `${d.days[i]}%` }} />
                <div className="c7b90673d">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="cf54c0725">
          <div className="c9922c0d7">Sales by Item</div>
          <div className="c065fcef8">
            {d.items.map(({ name, total, pct }) => (
              <div key={name} className="ce47f6ecd">
                <div className="c5fd6f910">
                  <div className="c91e3dc28">{name}</div>
                  <div className="c1d7926b3">{total}</div>
                </div>
                <div className="c1a75d3d1">
                  <div style={{ width: `${pct}%`, height: '100%', background: '#FF6B2C', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorDashboardShell>
  );
}
