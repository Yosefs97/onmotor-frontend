// components/CartContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.inventory);
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: newQty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.title,
          price: product.price,
          image: product.image,
          qty: Math.min(qty, product.inventory),
          inventory: product.inventory,
          sku: product.sku,
        },
      ];
    });
  };

  const updateQuantity = (id, qty) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === id
          ? { ...i, qty: Math.max(1, Math.min(qty, i.inventory)) }
          : i
      )
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.productId !== id));

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
