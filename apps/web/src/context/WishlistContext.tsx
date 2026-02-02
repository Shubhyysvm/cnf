"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  image?: string;
  variant?: string;
  variantId?: string;
}

export interface Wishlist {
  items: WishlistItem[];
  itemCount: number;
}

interface WishlistContextType {
  wishlist: Wishlist;
  isLoading: boolean;
  addToWishlist: (productId: string, variantId?: string) => Promise<void>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<void>;
  checkWishlist: (productId: string, variantId?: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getSessionId(): string {
  if (typeof window === "undefined") return "anonymous";
  
  let sessionId = localStorage.getItem("wishlist-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("wishlist-session-id", sessionId);
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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist>({
    items: [],
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${API_BASE}/wishlist`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist({
          items: data.items || [],
          itemCount: data.itemCount || data.items?.length || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const addToWishlist = async (productId: string, variantId?: string) => {
    setIsLoading(true);
    try {
      const body: { productId: string; variantId?: string } = {
        productId,
      };
      if (variantId) body.variantId = variantId;

      const response = await fetch(`${API_BASE}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const newItem = await response.json();
        setWishlist((prev) => ({
          items: [...prev.items, newItem],
          itemCount: prev.itemCount + 1,
        }));
        toast.success("Added to Wishlist ❤️", {
          duration: 2000,
          position: "bottom-right",
        });
      } else if (response.status === 400) {
        toast.error("Already in Wishlist", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Failed to add to wishlist");
      console.error("Add to wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string, variantId?: string) => {
    setIsLoading(true);
    try {
      const url = variantId
        ? `${API_BASE}/wishlist/${productId}/${variantId}`
        : `${API_BASE}/wishlist/${productId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        setWishlist((prev) => ({
          items: prev.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                (!variantId || item.variantId === variantId)
              )
          ),
          itemCount: Math.max(0, prev.itemCount - 1),
        }));
        toast.success("Removed from Wishlist", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist");
      console.error("Remove from wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlist = async (productId: string, variantId?: string) => {
    try {
      const url = variantId
        ? `${API_BASE}/wishlist/check/${productId}/${variantId}`
        : `${API_BASE}/wishlist/check/${productId}`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists || data.isWishlisted || false;
      }
      return false;
    } catch (error) {
      console.error("Check wishlist error:", error);
      return false;
    }
  };

  const clearWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/wishlist`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        setWishlist({ items: [], itemCount: 0 });
        toast.success("Wishlist cleared", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Failed to clear wishlist");
      console.error("Clear wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        checkWishlist,
        clearWishlist,
        isWishlistOpen,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
