import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  vendor: { name: string } | null;
}

const SERVICE_FEE_CENTS = 150;
const TAX_RATE = 0.0875;

export interface PlaceOrderInput {
  vendorId: string;
  items: Array<{
    menuItemId: string | null;
    name: string;
    priceCents: number;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

/** Place a new order — creates order + line items in a single transaction */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const subtotalCents = input.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents + SERVICE_FEE_CENTS;

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      vendor_id: input.vendorId,
      status: 'placed',
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      service_fee_cents: SERVICE_FEE_CENTS,
      total_cents: totalCents,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  // Insert line items
  const lineItems = input.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menuItemId,
    name_snapshot: i.name,
    price_cents_snapshot: i.priceCents,
    quantity: i.quantity,
    notes: i.notes ?? null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(lineItems);
  if (itemsError) throw itemsError;

  return order;
}

/** Fetch a single order with its items and vendor name */
export async function getOrderById(orderId: string): Promise<OrderWithItems> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), vendor:vendors(name)')
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data as OrderWithItems;
}

/** Fetch order history for the current customer */
export async function getMyOrders(): Promise<OrderWithItems[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), vendor:vendors(name)')
    .eq('user_id', user.id)
    .neq('status', 'draft')
    .order('placed_at', { ascending: false });
  if (error) throw error;
  return data as OrderWithItems[];
}

/** Fetch incoming orders for the vendor dashboard */
export async function getVendorOrders(
  vendorId: string,
  filter: 'active' | 'completed' | 'all' = 'all'
): Promise<OrderWithItems[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*), vendor:vendors(name)')
    .eq('vendor_id', vendorId)
    .order('placed_at', { ascending: false });

  if (filter === 'active') {
    query = query.in('status', ['placed', 'accepted', 'preparing', 'ready']);
  } else if (filter === 'completed') {
    query = query.in('status', ['picked_up', 'rejected', 'cancelled']);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as OrderWithItems[];
}

/** Update the status of an order (vendor only) */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Subscribe to real-time order status changes for a given order */
export function subscribeToOrder(
  orderId: string,
  callback: (order: Order) => void
) {
  return supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      (payload) => callback(payload.new as Order)
    )
    .subscribe();
}

/** Subscribe to new incoming orders for a vendor */
export function subscribeToVendorOrders(
  vendorId: string,
  callback: (order: Order) => void
) {
  return supabase
    .channel(`vendor_orders:${vendorId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendorId}` },
      (payload) => callback(payload.new as Order)
    )
    .subscribe();
}
