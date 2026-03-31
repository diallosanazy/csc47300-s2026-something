import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type Review = Database['public']['Tables']['reviews']['Row'];

export interface ReviewWithProfile extends Review {
  profile: { full_name: string | null; avatar_url: string | null } | null;
}

/** Fetch all reviews for a vendor */
export async function getVendorReviews(vendorId: string): Promise<ReviewWithProfile[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ReviewWithProfile[];
}

/** Fetch the current user's review for a vendor (null if none) */
export async function getMyReview(vendorId: string): Promise<Review | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Create or update the current user's review for a vendor */
export async function upsertReview(
  vendorId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      { user_id: user.id, vendor_id: vendorId, rating, comment: comment ?? null },
      { onConflict: 'user_id,vendor_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete the current user's review */
export async function deleteMyReview(vendorId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('vendor_id', vendorId)
    .eq('user_id', user.id);
  if (error) throw error;
}
