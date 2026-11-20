"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatGHS } from "@/lib/utils";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();

  const deliveryFee = cart.length > 0 ? 30 : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Header Bar matching Screen 5 in Design */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-gray-100 text-slate-800 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-black text-slate-900 tracking-tight">My Cart</h1>

        {cart.length > 0 ? (
          <button
            onClick={() => {
              if (confirm("Clear all items from your cart?")) clearCart();
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition"
            title="Clear Cart"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center space-y-3 mt-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-base font-black text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Explore smartphones, power banks, and original accessories to add items to your cart.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F26A00] text-white text-xs font-bold hover:bg-[#d95e00] transition shadow-md"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List matching Screen 5 */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selected_variant.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs flex items-center justify-between gap-3"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0] || "/placeholder.png"}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-xs text-slate-900 truncate">
                      {item.product.title}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {item.selected_variant.storage || item.selected_variant.color}
                    </p>
                    <div className="text-xs font-black text-[#F26A00]">
                      {formatGHS(item.selected_variant.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5 text-xs">
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, item.quantity - 1)
                        }
                        className="p-1 hover:text-[#F26A00] text-gray-600 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, item.quantity + 1)
                        }
                        className="p-1 hover:text-[#F26A00] text-gray-600 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.variant_id)
                      }
                      className="text-gray-400 hover:text-red-500 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary Card matching Screen 5 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatGHS(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">{formatGHS(deliveryFee)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="font-black text-slate-900">Total</span>
                <span className="font-black text-base text-[#F26A00]">
                  {formatGHS(totalAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons matching Screen 5 */}
            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#F26A00] hover:bg-[#d95e00] text-white font-black text-xs text-center shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products"
                className="block text-center py-2 text-xs font-bold text-gray-500 hover:text-slate-900 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
