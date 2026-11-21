"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { saveOrder } from "@/lib/db-service";
import { getCustomerProfile, recordCustomerOrder, saveCustomerProfile } from "@/lib/customer-store";
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  MapPin,
  ChevronLeft,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "shop_pickup">("delivery");
  const [deliveryRegion, setDeliveryRegion] = useState<"accra" | "other">("accra");
  const [paymentMethod, setPaymentMethod] = useState<"paystack_momo" | "paystack_card" | "cash_on_pickup">("paystack_momo");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Accra",
    notes: "",
  });

  React.useEffect(() => {
    const saved = getCustomerProfile();
    if (saved && (saved.full_name || saved.phone)) {
      setFormData({
        fullName: saved.full_name || "",
        phone: saved.phone || "",
        email: saved.email || "",
        address: saved.delivery_address || "",
        city: saved.city || "Accra",
        notes: saved.notes || "",
      });
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const deliveryFee = fulfillmentType === "shop_pickup" ? 0 : 30;
  const totalAmount = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert("Please provide your full name and phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          delivery_address: formData.address,
          city: formData.city,
          delivery_notes: formData.notes,
        },
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        items: cart.map((item) => ({
          product_id: item.product.id,
          variant_id: item.selected_variant.id,
          product_title: item.product.title,
          variant_sku: item.selected_variant.sku,
          condition: item.selected_variant.condition,
          storage: item.selected_variant.storage,
          ram: item.selected_variant.ram,
          color: item.selected_variant.color,
          unit_price: item.selected_variant.price,
          quantity: item.quantity,
          total_price: item.selected_variant.price * item.quantity,
          image_url: item.product.images[0] || "",
        })),
        origin: window.location.origin,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process order.");
      }

      // Save customer profile for future checkouts
      saveCustomerProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        delivery_address: formData.address,
        city: formData.city,
        notes: formData.notes,
      });

      // Record in customer local history
      if (data.order) {
        recordCustomerOrder(data.order);
      }

      // If Paystack returned authorization URL, redirect to Paystack Checkout
      if (data.paystack?.authorization_url) {
        window.location.href = data.paystack.authorization_url;
        return;
      }

      // Cash on pickup or direct completion
      setOrderComplete(data.order_number);
      clearCart();
    } catch (err: any) {
      console.error("Order submit error:", err);
      alert(err.message || "Something went wrong while processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Order Received Successfully!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for choosing Aki Enterprise. Your order has been registered and is being prepared.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-3 mb-6">
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Order Number:</span>
            <span className="font-mono font-bold text-orange-600">{orderComplete}</span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Customer:</span>
            <span className="font-semibold text-gray-900">{formData.fullName} ({formData.phone})</span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Fulfillment:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {fulfillmentType === "shop_pickup" ? "Shop Pickup (Aki Enterprise - Miaso, Kwahu East)" : `Courier Delivery to ${formData.city}`}
            </span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Payment:</span>
            <span className="font-semibold text-emerald-700 uppercase">
              {paymentMethod.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2">
            <span>Total Amount:</span>
            <span className="text-orange-600 font-extrabold">{formatGHS(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://wa.me/233551243372?text=${encodeURIComponent(
              `Hello Aki Enterprise, I just placed order ${orderComplete} for ${formatGHS(totalAmount)}. Here is my phone number: ${formData.phone}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition"
          >
            <Phone className="w-4 h-4" />
            <span>Confirm Order on WhatsApp (0551243372)</span>
          </a>

          <Link
            href="/"
            className="block py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mb-6">Add phones or accessories to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
      {/* Mobile Top Header (Exact Match to Screen 6) */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
          <span className="text-base font-black text-slate-900">Checkout</span>
        </Link>
        <span className="text-xs text-gray-400 font-mono">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* 3-Step Numbered Progress Bar (Screen 6 Exact Match) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs mb-6">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Step 1: Delivery */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#F26A00] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30">
              1
            </div>
            <span className="text-[11px] font-extrabold text-[#F26A00]">Delivery</span>
          </div>

          <div className="flex-1 h-0.5 bg-orange-200 mx-2 -mt-4" />

          {/* Step 2: Payment */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F26A00] border border-orange-300 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span className="text-[11px] font-semibold text-gray-700">Payment</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4" />

          {/* Step 3: Confirm */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-medium text-gray-400">Confirm</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Delivery Address Section (Screen 6 Card) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
              Delivery Address
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs font-bold text-[#F26A00] hover:text-orange-700 transition"
            >
              {isEditingAddress ? "Done" : "Change"}
            </button>
          </div>

          {/* Address Display Box */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/40 border border-orange-100">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 text-[#F26A00] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#F26A00]" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900">
                {formData.fullName || "Kwame Mensah"}{" "}
                <span className="text-gray-400 font-normal">
                  ({formData.phone || "024 123 4567"})
                </span>
              </p>
              <p className="text-gray-600 mt-0.5">
                {formData.address || "123 Oxford Street, Osu"}, {formData.city || "Accra"}, Ghana
              </p>
            </div>
          </div>

          {/* Inline Edit Form when "Change" is clicked or empty */}
          {isEditingAddress && (
            <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Kwame Mensah"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Phone Number (MoMo) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="024 123 4567"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">City / Town *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Accra, Kumasi, Tema"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Oxford Street, near Shell"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Method (Screen 6 Radio Choices) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
            Delivery Method
          </h3>

          <div className="space-y-2.5">
            {/* Home Delivery */}
            <div
              onClick={() => setFulfillmentType("delivery")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                fulfillmentType === "delivery"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    fulfillmentType === "delivery"
                      ? "border-[#F26A00] bg-white"
                      : "border-gray-300"
                  }`}
                >
                  {fulfillmentType === "delivery" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Home Delivery</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Fast doorstep dispatch</p>
                </div>
              </div>
              <span className="font-extrabold text-xs text-slate-900">GH₵ 30</span>
            </div>

            {/* Pickup at Store */}
            <div
              onClick={() => setFulfillmentType("shop_pickup")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                fulfillmentType === "shop_pickup"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    fulfillmentType === "shop_pickup"
                      ? "border-[#F26A00] bg-white"
                      : "border-gray-300"
                  }`}
                >
                  {fulfillmentType === "shop_pickup" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Pickup at Store</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Collect at Aki Enterprise counter</p>
                </div>
              </div>
              <span className="font-extrabold text-xs text-emerald-600">Free</span>
            </div>
          </div>
        </div>

        {/* Payment Method (Screen 6 Radio Choices) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
            Payment Method
          </h3>

          <div className="space-y-2.5">
            {/* MTN Mobile Money */}
            <div
              onClick={() => setPaymentMethod("paystack_momo")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentMethod === "paystack_momo"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentMethod === "paystack_momo"
                      ? "border-[#F26A00] bg-white"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "paystack_momo" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#FFCC00] text-black font-black text-[10px] flex items-center justify-center shadow-2xs">
                    MTN
                  </div>
                  <span className="font-bold text-xs text-gray-900">MTN Mobile Money</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Instant Prompt
              </span>
            </div>

            {/* Telecel Cash */}
            <div
              onClick={() => setPaymentMethod("paystack_momo")}
              className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 cursor-pointer transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#E60000] text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                    tc
                  </div>
                  <span className="font-bold text-xs text-gray-900">Telecel Cash</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">Available</span>
            </div>

            {/* Card Payment */}
            <div
              onClick={() => setPaymentMethod("paystack_card")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentMethod === "paystack_card"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentMethod === "paystack_card"
                      ? "border-[#F26A00] bg-white"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "paystack_card" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-gray-900">Card Payment</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">Visa / Master</span>
            </div>
          </div>
        </div>

        {/* Order Summary Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
            Order Review
          </h3>

          <div className="divide-y divide-gray-100 space-y-2">
            {cart.map((item) => (
              <div key={item.variant_id} className="pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800 truncate max-w-[220px]">
                  {item.quantity}× {item.product.title}
                </span>
                <span className="font-bold text-slate-900">
                  {formatGHS(item.selected_variant.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{formatGHS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-800">
                {deliveryFee === 0 ? "Free" : formatGHS(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-[#F26A00] font-black text-base">{formatGHS(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Google Merchant Center Compliant Policy Notice */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#F26A00]" />
            <span>Guaranteed Authenticity &amp; 14-Day Return Protection</span>
          </div>
          <p className="leading-relaxed">
            By placing an order, you agree to our{" "}
            <Link href="/policies/terms" target="_blank" className="text-[#F26A00] underline font-semibold">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/policies/returns" target="_blank" className="text-[#F26A00] underline font-semibold">
              14-Day Return &amp; Refund Policy
            </Link>
            . Orders above GH₵ 500 qualify for free nationwide delivery.
          </p>
        </div>

        {/* Desktop Place Order Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="hidden md:flex w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 items-center justify-center gap-2 transition active:scale-98"
        >
          <span>
            {isSubmitting
              ? "Connecting to Paystack..."
              : paymentMethod === "cash_on_pickup"
              ? `Confirm Shop Pickup Order (${formatGHS(totalAmount)})`
              : `Pay with Paystack (${formatGHS(totalAmount)})`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Mobile Fixed Bottom Action Bar (Screen 6 Exact Match) */}
        <div className="md:hidden fixed bottom-14 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30 shadow-2xl">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-black text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <span>
              {isSubmitting
                ? "Connecting..."
                : paymentMethod === "cash_on_pickup"
                ? `Confirm Pickup • ${formatGHS(totalAmount)}`
                : `Pay with Paystack • ${formatGHS(totalAmount)}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
