"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontCart } from "@/lib/shopify";
import { CartDrawer } from "@/components/cart/cart-drawer";

type CartContextValue = {
  cart: StorefrontCart | null;
  error: string | null;
  isLoading: boolean;
  isMutating: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function parseCartResponse(response: Response) {
  const payload = (await response.json()) as {
    cart?: StorefrontCart | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Shopify cart request failed.");
  }

  return payload.cart ?? null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StorefrontCart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", { credentials: "same-origin" });
        const nextCart = await parseCartResponse(response);

        if (!isMounted) {
          return;
        }

        setCart(nextCart);
        setError(null);
      } catch (nextError) {
        if (!isMounted) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : "Unable to load the Shopify cart.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  async function runCartMutation(
    request: () => Promise<StorefrontCart | null>,
    options?: { openAfter?: boolean },
  ) {
    setIsMutating(true);

    try {
      const nextCart = await request();
      setCart(nextCart);
      setError(null);

      if (options?.openAfter) {
        setIsOpen(true);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Shopify cart update failed.");
      throw nextError;
    } finally {
      setIsMutating(false);
    }
  }

  async function addItem(merchandiseId: string, quantity = 1) {
    await runCartMutation(
      async () => {
        const response = await fetch("/api/cart", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ merchandiseId, quantity }),
        });

        return parseCartResponse(response);
      },
      { openAfter: true },
    );
  }

  async function updateItemQuantity(lineId: string, quantity: number) {
    await runCartMutation(async () => {
      const response = await fetch("/api/cart/lines", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineId, quantity }),
      });

      return parseCartResponse(response);
    });
  }

  async function removeItem(lineId: string) {
    await runCartMutation(async () => {
      const response = await fetch("/api/cart/lines", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineId }),
      });

      return parseCartResponse(response);
    });
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        error,
        isLoading,
        isMutating,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItemQuantity,
        removeItem,
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
