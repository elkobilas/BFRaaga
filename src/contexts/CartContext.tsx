import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface LocalCartItem {
  productId: string;
  quantity: number;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    stock: number;
    condition: string;
    seller_id: string;
    seller: {
      business_name: string;
      slug: string;
    } | null;
    images: {
      url: string;
      is_primary: boolean;
    }[];
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  itemCount: number;
  totalPrice: number;
  addToCart: (productId: string, quantity: number) => Promise<{ error: Error | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isGuest: boolean;
  guestCart: LocalCartItem[];
  addToGuestCart: (productId: string, quantity: number) => void;
  removeFromGuestCart: (productId: string) => void;
  updateGuestQuantity: (productId: string, quantity: number) => void;
  clearGuestCart: () => void;
  syncGuestCartToUser: () => Promise<void>;
}

const LOCAL_CART_KEY = 'bfraaga_guest_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

function getGuestCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(cart: LocalCartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [guestCart, setGuestCart] = useState<LocalCartItem[]>(getGuestCart);
  const isGuest = !isAuthenticated;

  const itemCount = isGuest
    ? guestCart.reduce((sum, item) => sum + item.quantity, 0)
    : items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = isGuest
    ? 0 // guest cart doesn't have product data yet, computed in component
    : items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products(
          id, title, slug, price, currency, stock, condition, seller_id,
          seller:sellers(business_name, slug),
          images:product_images(url, is_primary)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setItems((data as unknown as CartItem[]) || []);
    }
    setIsLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function addToCart(productId: string, quantity: number) {
    if (!isAuthenticated || !user) {
      return { error: new Error('guest') };
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) return { error };
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity });
      if (error) return { error };
    }

    await fetchCart();
    return { error: null };
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    if (!error) await fetchCart();
  }

  async function removeFromCart(itemId: string) {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (!error) await fetchCart();
  }

  async function clearCart() {
    if (!user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (!error) setItems([]);
  }

  function addToGuestCart(productId: string, quantity: number) {
    setGuestCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      let next: LocalCartItem[];
      if (existing) {
        next = prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        next = [...prev, { productId, quantity }];
      }
      saveGuestCart(next);
      return next;
    });
  }

  function removeFromGuestCart(productId: string) {
    setGuestCart(prev => {
      const next = prev.filter(i => i.productId !== productId);
      saveGuestCart(next);
      return next;
    });
  }

  function updateGuestQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromGuestCart(productId);
      return;
    }
    setGuestCart(prev => {
      const next = prev.map(i => i.productId === productId ? { ...i, quantity } : i);
      saveGuestCart(next);
      return next;
    });
  }

  function clearGuestCart() {
    setGuestCart([]);
    localStorage.removeItem(LOCAL_CART_KEY);
  }

  async function syncGuestCartToUser() {
    if (!user || guestCart.length === 0) return;
    const cart = getGuestCart();
    for (const item of cart) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.productId)
        .maybeSingle();
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: item.productId, quantity: item.quantity });
      }
    }
    clearGuestCart();
    await fetchCart();
  }

  return (
    <CartContext.Provider value={{
      items, isLoading, itemCount, totalPrice,
      addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart,
      isGuest, guestCart, addToGuestCart, removeFromGuestCart, updateGuestQuantity, clearGuestCart, syncGuestCartToUser,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
