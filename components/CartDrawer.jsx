// /components/CartDrawer.jsx
"use client";
import { useState, useEffect } from "react";

export default function CartDrawer({ open, onClose }) {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  const fetchCart = async () => {
    const res = await fetch("/api/shopify/cart/get");
    const json = await res.json();
    setCart(json.cart);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-80 h-full p-4 shadow-lg flex flex-col">
        <button onClick={onClose} className="text-right text-red-600 font-bold">
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4">העגלה שלי</h2>

        {!cart || cart.lines.edges.length === 0 ? (
          <div>העגלה ריקה</div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {cart.lines.edges.map(({ node }) => (
              <div key={node.id} className="flex items-center gap-2 border-b pb-2">
                <img
                  src={node.merchandise.product.featuredImage?.url}
                  alt={node.merchandise.product.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div>{node.merchandise.product.title}</div>
                  <div className="text-sm opacity-70">{node.quantity} יח׳</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart && (
          <div className="mt-4 border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>סה״כ:</span>
              <span>
                {cart.estimatedCost.totalAmount.amount}{" "}
                {cart.estimatedCost.totalAmount.currencyCode}
              </span>
            </div>
            <a
              href={cart.checkoutUrl}
              target="_blank"
              className="block bg-green-600 text-white text-center py-2 mt-2 rounded-md"
            >
              לתשלום
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
