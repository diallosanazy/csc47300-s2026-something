import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];
export type DbMenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
export type DbMenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

/** All menu items for a vendor (customer view) */
export async function getMenuItemsByVendor(vendorId: string): Promise<DbMenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** All menu items for the authenticated vendor owner */
export async function getMyMenuItems(vendorId: string): Promise<DbMenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Single menu item by ID */
export async function getMenuItemById(id: string): Promise<DbMenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** Create a new menu item */
export async function createMenuItem(item: DbMenuItemInsert): Promise<DbMenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing menu item */
export async function updateMenuItem(id: string, updates: DbMenuItemUpdate): Promise<DbMenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Toggle sold-out status */
export async function setMenuItemAvailability(id: string, isAvailable: boolean): Promise<DbMenuItem> {
  return updateMenuItem(id, { is_available: isAvailable });
}

/** Delete a menu item */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/** Upload a menu item image and return its public URL */
export async function uploadMenuItemImage(vendorId: string, itemId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${vendorId}/${itemId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}
