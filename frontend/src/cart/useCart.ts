import { useState, useMemo } from 'react';

export interface CartLineItem {
  productId: string;
  quantity: number;
  price: number;
}

export function useCart() {
  const [lineItems, setLineItems] = useState<CartLineItem[]>([]);

  const cartSubtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [lineItems]
  );

  const cartProductIds = useMemo(
    () => lineItems.map((item) => item.productId),
    [lineItems]
  );

  function addToCart(productId: string, quantity: number, price: number) {
    setLineItems((prev) => {
      const i = prev.findIndex((item) => item.productId === productId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i]!,
          quantity: next[i]!.quantity + quantity,
        };
        return next;
      }
      return [...prev, { productId, quantity, price }];
    });
  }

  function removeFromCart(productId: string) {
    setLineItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  return {
    lineItems,
    cartSubtotal,
    cartProductIds,
    addToCart,
    removeFromCart,
  };
}
