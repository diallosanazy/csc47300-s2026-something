import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { VendorDashboardShell } from './VendorDashboardShell';

function SettingsNavLink({ to, label, active }: { to?: string; label: string; active?: boolean }) {
  const className = `vendor-settings-link${active ? ' active' : ''}`;
  if (!to) return <span className={className} style={{ opacity: 0.45, cursor: 'default' }}>{label}</span>;
  return <Link className={`link-reset ${className}`} to={to}>{label}</Link>;
}

export function VendorSettingsShell({
  section,
  actions,
  children,
}: {
  section: 'profile' | 'hours' | 'payment';
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <VendorDashboardShell active="settings" title="Settings" actions={actions}>
      <div className="vendor-settings-body">
        <nav className="vendor-settings-nav">
          <SettingsNavLink to="/settings" label="Vendor Profile" active={section === 'profile'} />
          <SettingsNavLink to="/business-hours" label="Business Hours" active={section === 'hours'} />
          <SettingsNavLink to="/payouts" label="Payment" active={section === 'payment'} />
          <SettingsNavLink label="Notifications" />
          <SettingsNavLink label="Integrations" />
        </nav>
        <section className="sync-stack">{children}</section>
      </div>
    </VendorDashboardShell>
  );
}
