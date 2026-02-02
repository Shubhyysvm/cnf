"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, variant?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getSessionId(): string {
  if (typeof window === "undefined") return "anonymous";
  
  let sessionId = localStorage.getItem("cart-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("cart-session-id", sessionId);
  }
  return sessionId;
}

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload.userId || null;
  } catch (err) {
    return null;
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "x-session-id": getSessionId() };
  const userId = getUserId();
  if (userId) {
    headers["x-user-id"] = userId;
  }
  return headers;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1, variant?: string) => {
    setIsLoading(true);
    try {
      const body: { productId: string; quantity: number; variant?: string } = {
        productId,
        quantity,
      };
      if (variant) {
        body.variant = variant;
      }

      const response = await fetch(`${API_BASE}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setIsCartOpen(true);
        toast.success("Added to cart!", {
          duration: 2000,
          position: "bottom-right",
          style: {
            background: "#2E7D32",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#2E7D32",
          },
        });
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Could not add to cart", {
        duration: 2000,
        position: "bottom-right",
        style: {
          background: "#d32f2f",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "500",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        toast.success("Quantity updated", {
          duration: 1500,
          position: "bottom-right",
          style: {
            background: "#2E7D32",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#2E7D32",
          },
        });
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Could not update quantity", {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        toast.success("Item removed", {
          duration: 2000,
          position: "bottom-right",
          style: {
            background: "#2E7D32",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "500",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#2E7D32",
          },
        });
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Could not remove item", {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/cart`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      toast.success("Cart cleared", {
        duration: 2000,
        position: "bottom-right",
        style: {
          background: "#2E7D32",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#2E7D32",
        },
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Could not clear cart", {
        duration: 2000,
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
