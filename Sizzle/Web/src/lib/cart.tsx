import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  vendorId: string | null;
  vendorName: string;
  items: CartItem[];
}

export interface PlacedOrder {
  orderId: string;
  vendorName: string;
  vendorId: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  placedAt: string; // ISO date string
}

const EMPTY_CART: CartState = { vendorId: null, vendorName: '', items: [] };
const SERVICE_FEE = 1.5;
const TAX_RATE = 0.0875;

interface CartContextValue {
  cart: CartState;
  lastOrder: PlacedOrder | null;
  orderHistory: PlacedOrder[];
  addItem: (vendorId: string, vendorName: string, item: { name: string; price: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: () => Promise<PlacedOrder>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<PlacedOrder[]>([]);

  const addItem = (vendorId: string, vendorName: string, item: { name: string; price: number }) => {
    const itemId = `${vendorId}_${item.name}`;
    setCart((prev) => {
      if (prev.vendorId && prev.vendorId !== vendorId) {
        return {
          vendorId,
          vendorName,
          items: [{ id: itemId, name: item.name, price: item.price, quantity: 1 }],
        };
      }
      const existing = prev.items.find((i) => i.id === itemId);
      if (existing) {
        return {
          ...prev,
          vendorId,
          vendorName,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...prev,
        vendorId,
        vendorName,
        items: [...prev.items, { id: itemId, name: item.name, price: item.price, quantity: 1 }],
      };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.id !== id);
      return items.length === 0 ? EMPTY_CART : { ...prev, items };
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  };

  const clearCart = () => setCart(EMPTY_CART);

  const placeOrder = async (): Promise<PlacedOrder> => {
    const sub = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = sub * TAX_RATE;
    const total = sub + SERVICE_FEE + tax;

    const order: PlacedOrder = {
      orderId: `SZ-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: cart.vendorName,
      vendorId: cart.vendorId ?? '',
      items: cart.items,
      subtotal: sub,
      serviceFee: SERVICE_FEE,
      tax,
      total,
      placedAt: new Date().toISOString(),
    };

    // Try to persist to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && cart.vendorId) {
        const { data: dbOrder } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            vendor_id: cart.vendorId,
            status: 'placed',
            subtotal_cents: Math.round(sub * 100),
            tax_cents: Math.round(tax * 100),
            service_fee_cents: Math.round(SERVICE_FEE * 100),
            total_cents: Math.round(total * 100),
            notes: null,
          })
          .select('id')
          .single();

        if (dbOrder) {
          order.orderId = dbOrder.id;

          // Insert order items
          await supabase.from('order_items').insert(
            cart.items.map((item) => ({
              order_id: dbOrder.id,
              name_snapshot: item.name,
              price_cents_snapshot: Math.round(item.price * 100),
              quantity: item.quantity,
            }))
          );
        }
      }
    } catch {
      // Fall back to local-only order
    }

    setLastOrder(order);
    setOrderHistory((prev) => [order, ...prev]);
    setCart(EMPTY_CART);
    return order;
  };

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, lastOrder, orderHistory, addItem, removeItem, updateQuantity, clearCart, placeOrder, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
