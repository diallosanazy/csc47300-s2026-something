import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type Favorite = Database['public']['Tables']['favorites']['Row'];

/** Fetch all vendors the current user has favorited */
export async function getMyFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('*, vendor:vendors(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Array<Favorite & { vendor: Database['public']['Tables']['vendors']['Row'] }>;
}

/** Check if the current user has favorited a given vendor */
export async function isFavorited(vendorId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

/** Add a vendor to favorites */
export async function addFavorite(vendorId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, vendor_id: vendorId });
  if (error) throw error;
}

/** Remove a vendor from favorites */
export async function removeFavorite(vendorId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId);
  if (error) throw error;
}

/** Toggle favorite status — returns the new state */
export async function toggleFavorite(vendorId: string): Promise<boolean> {
  const favorited = await isFavorited(vendorId);
  if (favorited) {
    await removeFavorite(vendorId);
    return false;
  } else {
    await addFavorite(vendorId);
    return true;
  }
}
