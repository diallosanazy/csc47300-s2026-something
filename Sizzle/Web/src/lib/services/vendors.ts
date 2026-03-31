import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

/** Fetch all live vendors (customer-facing discovery) */
export async function getLiveVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_live', true)
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch a single vendor by ID */
export async function getVendorById(id: string): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** Search live vendors by name or cuisine */
export async function searchVendors(query: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_live', true)
    .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`)
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
}

/** Fetch the vendor owned by the current user */
export async function getMyVendor(): Promise<Vendor | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Create a new vendor (vendor onboarding) */
export async function createVendor(vendor: Omit<VendorInsert, 'owner_id'>): Promise<Vendor> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vendors')
    .insert({ ...vendor, owner_id: user.id, is_live: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update vendor profile / settings */
export async function updateVendor(id: string, updates: VendorUpdate): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Toggle the vendor's live status */
export async function setVendorLive(id: string, isLive: boolean): Promise<Vendor> {
  return updateVendor(id, { is_live: isLive });
}

/** Toggle busy mode — pauses new order acceptance */
export async function setVendorBusy(id: string, isBusy: boolean): Promise<Vendor> {
  return updateVendor(id, { is_busy: isBusy });
}

/** Upload a vendor/banner image and return its public URL */
export async function uploadVendorImage(vendorId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${vendorId}/vendor.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}
