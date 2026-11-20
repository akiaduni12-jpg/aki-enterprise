"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, subtotal, itemCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-lg">Your Aki Enterprise Cart ({itemCount})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Explore our iPhones, power banks, and electronics to add items.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const conditionBadge = getConditionBadge(item.selected_variant.condition);
              return (
                <div
                  key={item.variant_id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xs transition"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.png"}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {item.product.title}
                    </h4>

                    {/* Variant tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-600">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${conditionBadge.className}`}>
                        {conditionBadge.label}
                      </span>
                      {item.selected_variant.storage && (
                        <span className="bg-gray-200/80 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          {item.selected_variant.storage}
                        </span>
                      )}
                      {item.selected_variant.color && (
                        <span className="text-gray-500 text-[11px]">
                          • {item.selected_variant.color}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-orange-600 text-sm">
                        {formatGHS(item.selected_variant.price)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 hover:text-orange-600 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          disabled={item.quantity >= item.selected_variant.stock_quantity}
                          className="p-1 hover:text-orange-600 disabled:opacity-40 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white space-y-3">
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-xl text-slate-900">{formatGHS(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500">
              Delivery fees and shop pickup details calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 text-white font-semibold shadow-md hover:bg-orange-700 active:scale-[0.99] transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
