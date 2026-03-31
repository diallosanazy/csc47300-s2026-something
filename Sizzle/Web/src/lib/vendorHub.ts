const KEY = 'sizzle_selected_vendor_id';

export function getSelectedVendorId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSelectedVendorId(vendorId: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!vendorId) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, vendorId);
  } catch {
    // ignore
  }
}

