import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { useAuth } from '../lib/auth';
import { deleteMenuItem as deleteDbMenuItem, getMyMenuItems, setMenuItemAvailability, type DbMenuItem } from '../lib/services/menuItems';
import { getSelectedVendorId } from '../lib/vendorHub';
import { supabase } from '../lib/supabaseClient';

function PlaceholderIcon({ id }: { id: string }) {
  const icons: Record<string, ReactNode> = {
    tacos: <><path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /><path d="M2 12C2 12 5 20 12 20C19 20 22 12 22 12" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /><circle cx="8" cy="12" r="1" fill="#D0CFCB" /><circle cx="12" cy="10" r="1" fill="#D0CFCB" /><circle cx="16" cy="12" r="1" fill="#D0CFCB" /></>,
    burrito: <><circle cx="12" cy="12" r="9" stroke="#D0CFCB" strokeWidth="1.5" /><path d="M7 12H17" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="9" r="1" fill="#D0CFCB" /><circle cx="14" cy="15" r="1" fill="#D0CFCB" /></>,
    churros: <><rect x="5" y="4" width="14" height="16" rx="2" stroke="#D0CFCB" strokeWidth="1.5" /><path d="M8 9H16M8 13H13" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /></>,
    elote: <><ellipse cx="12" cy="12" rx="5" ry="8" stroke="#D0CFCB" strokeWidth="1.5" /><path d="M12 4V2M12 22V20" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /></>,
    quesadilla: <><path d="M4 12C4 12 8 6 12 6C16 6 20 12 20 12C20 12 16 18 12 18C8 18 4 12 4 12Z" stroke="#D0CFCB" strokeWidth="1.5" /></>,
    horchata: <><path d="M8 4H16L15 20H9L8 4Z" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 4H18" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /></>,
  };

  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      {icons[id] || <><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /><path d="M15 2.5C15 2.5 16.5 5 16.5 8C16.5 11 15 13.5 15 13.5" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /><path d="M22 8H16" stroke="#D0CFCB" strokeWidth="1.5" strokeLinecap="round" /></>}
    </svg>
  );
}

export function MenuPage() {
  const navigate = useNavigate();
  const { vendor } = useAuth();
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DbMenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(() => getSelectedVendorId() ?? vendor?.id ?? null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const refreshItems = useCallback(async () => {
    const id = getSelectedVendorId() ?? vendor?.id ?? null;
    setVendorId(id);
    if (!id) return;
    setLoading(true);
    try {
      // Menu is readable for any vendor; writes will be blocked by RLS if not owner.
      const { data, error } = await supabase.from('menu_items').select('*').eq('vendor_id', id).order('created_at', { ascending: true });
      if (error) throw error;
      setItems(((data ?? []) as DbMenuItem[]));
    } finally {
      setLoading(false);
    }
  }, [vendor]);

  useEffect(() => {
    refreshItems().catch(() => {});
  }, [refreshItems]);

  // Live update menu when items change for selected vendor
  useEffect(() => {
    if (!vendorId) return;
    const channel = supabase
      .channel(`menu_items:${vendorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `vendor_id=eq.${vendorId}` }, () => {
        refreshItems().catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [vendorId, refreshItems]);

  const toggleAvailability = async (item: DbMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextAvailable = !(item.is_available ?? true);
    await setMenuItemAvailability(item.id, nextAvailable);
    await refreshItems();
    showToast(nextAvailable ? `${item.name} marked available` : `${item.name} marked sold out`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDbMenuItem(deleteTarget.id);
    await refreshItems();
    setDeleteTarget(null);
    showToast(`${deleteTarget.name} deleted`);
  };

  const rows = useMemo(
    () => Array.from({ length: Math.ceil(items.length / 3) }).map((_, index) => items.slice(index * 3, index * 3 + 3)),
    [items]
  );

  return (
    <VendorDashboardShell
      active="menu"
      title="Menu"
      actions={
        <Link className="link-reset btn btn-primary" to="/add-item">
          Add Item
        </Link>
      }
    >
      <div className="cbe952a50" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="c6cb854e6" style={{ padding: 0 }}>
          <Link to="/add-item" className="link-reset c96c08c87">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="c154a3b24">Add Item</div>
          </Link>
        </div>
        {!vendorId ? (
          <div style={{ color: '#9C9890', fontSize: 14, padding: '18px 0' }}>
            Select a vendor on the dashboard first.
          </div>
        ) : loading ? (
          <div style={{ color: '#9C9890', fontSize: 14, padding: '18px 0' }}>
            Loading menu…
          </div>
        ) : items.length === 0 ? (
          <div style={{ color: '#9C9890', fontSize: 14, padding: '18px 0' }}>
            No menu items yet. Click “Add Item” to create your first item.
          </div>
        ) : null}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="ce522eec8">
            {row.map((item) => {
              const isAvailable = item.is_available ?? true;
              const price = (item.price_cents ?? 0) / 100;
              return (
                <div key={item.id} className="c5f5ae532" data-id={item.id} style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/item-detail?id=${item.id}`)}>
                  {item.image_url ? (
                    <div className="c2ba51230" style={{ padding: 0 }}>
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className="c2ba51230">
                      <PlaceholderIcon id={item.id} />
                    </div>
                  )}
                  <div className="c137834b1">
                    <div className="c5fd6f910">
                      <div className="c9407cbad">{item.name}</div>
                      <div className="ca1611c28">${price.toFixed(2)}</div>
                    </div>
                    <div className="cd88fea1f">{item.description || ''}</div>
                    <div className="cb419a80a" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="c72dd1a62" style={{ alignItems: 'center' }}>
                        <div className={isAvailable ? 'c8755b902' : 'ce51fb085'} />
                        <div className={isAvailable ? 'ca28922ed' : 'c7b90673d'}>{isAvailable ? 'Available' : 'Sold out'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Availability toggle */}
                        <button
                          onClick={(e) => { toggleAvailability(item, e).catch(() => {}); }}
                          title={isAvailable ? 'Mark sold out' : 'Mark available'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                        >
                          <div style={{ background: isAvailable ? '#FF6B2C' : '#E8E6E1', borderRadius: 999, height: 18, padding: 1.5, transition: 'background 0.2s', width: 32 }}>
                            <div style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', height: 15, transform: isAvailable ? 'translateX(14px)' : 'translateX(0)', transition: 'transform 0.2s', width: 15 }} />
                          </div>
                        </button>
                        {/* Edit button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/add-item?edit=${item.id}`); }}
                          title="Edit item"
                          style={{ alignItems: 'center', background: '#F8F6F1', border: '1px solid #E8E6E1', borderRadius: 6, cursor: 'pointer', display: 'flex', height: 26, justifyContent: 'center', padding: 0, width: 26 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V20C2 20.53 2.21 21.04 2.59 21.41C2.96 21.79 3.47 22 4 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V13" stroke="#6B6963" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5C18.89 2.11 19.42 1.89 19.97 1.89C20.52 1.89 21.05 2.11 21.44 2.5C21.83 2.89 22.05 3.42 22.05 3.97C22.05 4.52 21.83 5.05 21.44 5.44L12 14.88L8 15.88L9 11.88L18.5 2.5Z" stroke="#6B6963" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          title="Delete item"
                          style={{ alignItems: 'center', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer', display: 'flex', height: 26, justifyContent: 'center', padding: 0, width: 26 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" /><path d="M8 6V4C8 3.47 8.21 2.96 8.59 2.59C8.96 2.21 9.47 2 10 2H14C14.53 2 15.04 2.21 15.41 2.59C15.79 2.96 16 3.47 16 4V6M19 6V20C19 20.53 18.79 21.04 18.41 21.41C18.04 21.79 17.53 22 17 22H7C6.47 22 5.96 21.79 5.59 21.41C5.21 21.04 5 20.53 5 20V6H19Z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="c7b90673d"> </div>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: 3 - row.length }).map((_, fillerIndex) => <div key={fillerIndex} style={{ flex: 1 }} />)}
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ alignItems: 'center', background: 'rgba(0,0,0,0.4)', display: 'flex', inset: 0, justifyContent: 'center', position: 'fixed', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, padding: 24, width: '90%' }}>
            <div style={{ color: '#1C1917', fontSize: 18, fontWeight: 700 }}>Delete Item</div>
            <div style={{ color: '#6B6963', fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ background: '#fff', border: '1.5px solid #E8E6E1', borderRadius: 10, color: '#6B6963', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ background: '#DC2626', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 20px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ alignItems: 'center', background: '#1C1917', borderRadius: 10, bottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: '#fff', display: 'flex', fontSize: 14, fontWeight: 500, gap: 8, left: '50%', padding: '12px 20px', position: 'fixed', transform: 'translateX(-50%)', zIndex: 1001 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D9F6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {toast}
        </div>
      )}
    </VendorDashboardShell>
  );
}
