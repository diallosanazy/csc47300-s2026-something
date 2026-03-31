import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type VendorHour = Database['public']['Tables']['vendor_hours']['Row'];

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Fetch all hour rows for a vendor (0 = Sunday … 6 = Saturday) */
export async function getVendorHours(vendorId: string): Promise<VendorHour[]> {
  const { data, error } = await supabase
    .from('vendor_hours')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('day_of_week', { ascending: true });
  if (error) throw error;
  return data;
}

export interface HourInput {
  dayOfWeek: number;
  openTime: string | null;  // "HH:MM"
  closeTime: string | null; // "HH:MM"
  isClosed: boolean;
}

/** Upsert the full week schedule for a vendor */
export async function saveVendorHours(vendorId: string, hours: HourInput[]): Promise<VendorHour[]> {
  const rows = hours.map((h) => ({
    vendor_id: vendorId,
    day_of_week: h.dayOfWeek,
    open_time: h.openTime,
    close_time: h.closeTime,
    is_closed: h.isClosed,
  }));

  const { data, error } = await supabase
    .from('vendor_hours')
    .upsert(rows, { onConflict: 'vendor_id,day_of_week' })
    .select();
  if (error) throw error;
  return data;
}

/** Check if a vendor is currently open based on stored hours */
export function isVendorOpenNow(hours: VendorHour[]): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek);
  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) {
    return false;
  }

  const [openH, openM] = todayHours.open_time.split(':').map(Number);
  const [closeH, closeM] = todayHours.close_time.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}
