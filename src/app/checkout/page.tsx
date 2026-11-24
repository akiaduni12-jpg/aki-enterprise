"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatGHS } from "@/lib/utils";
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
  Info,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type PaymentProvider = "mtn" | "telecel" | "airtel" | "card" | "cash_on_pickup";

const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_FEE = 30;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "shop_pickup">("delivery");
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("mtn");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Accra",
    notes: "",
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formErrors, setFormErrors] = useState<{ fullName?: string; phone?: string }>({});

  useEffect(() => {
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
      setIsEditingAddress(false);
    } else {
      // If customer has never entered details, keep form open by default
      setIsEditingAddress(true);
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  // Free delivery calculation
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD || fulfillmentType === "shop_pickup";
  const deliveryFee = isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;

  // Map payment provider to backend payment method
  const getBackendPaymentMethod = (): "paystack_momo" | "paystack_card" | "cash_on_pickup" => {
    if (paymentProvider === "card") return "paystack_card";
    if (paymentProvider === "cash_on_pickup") return "cash_on_pickup";
    return "paystack_momo";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [e.target.name]: undefined });
    }
  };

  const handleFulfillmentChange = (type: "delivery" | "shop_pickup") => {
    setFulfillmentType(type);
    if (type === "delivery" && paymentProvider === "cash_on_pickup") {
      setPaymentProvider("mtn");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { fullName?: string; phone?: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      errors.phone = "Please enter a valid Ghana phone number.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsEditingAddress(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentMethod = getBackendPaymentMethod();

      const orderPayload = {
        customer: {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          delivery_address: fulfillmentType === "delivery" ? formData.address.trim() : "Shop Pickup Counter",
          city: fulfillmentType === "delivery" ? formData.city.trim() : "Miaso, Kwahu East",
          delivery_notes: formData.notes.trim() || undefined,
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

      // Save customer profile for fast future checkouts
      saveCustomerProfile({
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        delivery_address: formData.address.trim(),
        city: formData.city.trim(),
        notes: formData.notes.trim(),
      });

      // Record in customer local history
      if (data.order) {
        recordCustomerOrder(data.order);
      }

      // If Paystack returned authorization URL, clear cart and redirect to Paystack Checkout
      if (data.paystack?.authorization_url) {
        clearCart();
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

  // ============================================================================
  // SUCCESS SCREEN: ORDER RECEIVED
  // ============================================================================
  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Order Registered Successfully!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for shopping with Aki Enterprise. Your order is registered in our system and ready for fulfillment.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-3 mb-6">
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Order Number:</span>
            <span className="font-mono font-bold text-orange-600">{orderComplete}</span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Customer:</span>
            <span className="font-semibold text-gray-900">
              {formData.fullName} ({formData.phone})
            </span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Fulfillment:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {fulfillmentType === "shop_pickup"
                ? "Shop Pickup (Aki Enterprise - Miaso, Kwahu East)"
                : `Courier Delivery to ${formData.city}`}
            </span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-500">Payment:</span>
            <span className="font-semibold text-emerald-700 uppercase">
              {paymentProvider === "cash_on_pickup" ? "Cash / MoMo on Pickup" : "Paystack Electronic"}
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
              `Hello Aki Enterprise, I just placed order ${orderComplete} for ${formatGHS(totalAmount)}. My phone number is: ${formData.phone}`
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

  // ============================================================================
  // EMPTY CART SCREEN
  // ============================================================================
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mb-6">
          Add phones or accessories to your cart before proceeding to checkout.
        </p>
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
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
          <span className="text-base font-black text-slate-900">Checkout</span>
        </Link>
        <span className="text-xs text-gray-500 font-mono">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs mb-6">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Step 1: Details */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#F26A00] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30">
              1
            </div>
            <span className="text-[11px] font-extrabold text-[#F26A00]">Details</span>
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

          {/* Step 3: Complete */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-[11px] font-medium text-gray-400">Complete</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* ==================================================================== */}
        {/* 1. FULFILLMENT METHOD */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
              Fulfillment Method
            </h3>
            {subtotal >= FREE_DELIVERY_THRESHOLD && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span>Free Nationwide Delivery!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Home / Doorstep Delivery */}
            <div
              onClick={() => handleFulfillmentChange("delivery")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                fulfillmentType === "delivery"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    fulfillmentType === "delivery" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {fulfillmentType === "delivery" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#F26A00]" />
                    <span>Courier Delivery</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Nationwide doorstep dispatch</p>
                </div>
              </div>
              <span className="font-extrabold text-xs text-slate-900">
                {isFreeDelivery ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  formatGHS(STANDARD_DELIVERY_FEE)
                )}
              </span>
            </div>

            {/* Shop Pickup */}
            <div
              onClick={() => handleFulfillmentChange("shop_pickup")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                fulfillmentType === "shop_pickup"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    fulfillmentType === "shop_pickup" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {fulfillmentType === "shop_pickup" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Pickup at Store</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Collect at Aki Enterprise shop</p>
                </div>
              </div>
              <span className="font-extrabold text-xs text-emerald-600">FREE</span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. CUSTOMER & DELIVERY / PICKUP DETAILS */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
              {fulfillmentType === "shop_pickup"
                ? "Customer Information & Pickup Point"
                : "Customer & Delivery Address"}
            </h3>
            {formData.fullName && formData.phone && (
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-bold text-[#F26A00] hover:text-orange-700 transition"
              >
                {isEditingAddress ? "Done" : "Change"}
              </button>
            )}
          </div>

          {/* Shop Pickup Point Card */}
          {fulfillmentType === "shop_pickup" && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900">Aki Enterprise Store Counter</p>
                <p className="text-gray-600">
                  Location: <span className="font-medium text-slate-800">Miaso, Kwahu East, Eastern Region, Ghana</span>
                </p>
                <p className="text-gray-500 text-[11px]">
                  Store Contact: <span className="font-mono text-emerald-700 font-bold">0551243372</span> • Open Mon-Sat (8am - 7pm)
                </p>
              </div>
            </div>
          )}

          {/* Address Display Box (When saved & collapsed) */}
          {!isEditingAddress && formData.fullName && formData.phone ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/40 border border-orange-100">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 text-[#F26A00] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#F26A00]" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-900">
                  {formData.fullName}{" "}
                  <span className="text-gray-500 font-mono font-normal">({formData.phone})</span>
                </p>
                {formData.email && (
                  <p className="text-gray-500 text-[11px]">{formData.email}</p>
                )}
                {fulfillmentType === "delivery" && (
                  <p className="text-gray-600 mt-0.5">
                    {formData.address ? `${formData.address}, ` : ""}
                    {formData.city || "Accra"}, Ghana
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Customer Input Fields (Always open if empty or editing) */}
          {(isEditingAddress || !formData.fullName || !formData.phone) && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Kwame Mensah"
                    className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-lg focus:outline-hidden focus:border-orange-500 ${
                      formErrors.fullName ? "border-red-400 bg-red-50/20" : "border-gray-200"
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Phone Number (MoMo / WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 055 124 3372 or 024..."
                    className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-lg focus:outline-hidden focus:border-orange-500 font-mono ${
                      formErrors.phone ? "border-red-400 bg-red-50/20" : "border-gray-200"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Optional Email Field - Customers are NOT forced */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between mb-1">
                  <span>Email Address</span>
                  <span className="text-[10px] text-gray-400 font-normal">Optional (leave blank if none)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com (optional receipt)"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Delivery specific fields */}
              {fulfillmentType === "delivery" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Accra, Kumasi, Koforidua, Kwahu..."
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Street Address or Landmark
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Near Total Station, House #14"
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Optional Delivery / Pickup Notes */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Special Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Call before arrival, leave with security"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. PAYMENT METHOD (ALL GHANA NETWORKS) */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
              Payment Method
            </h3>
            <span className="text-[10px] text-gray-500">Secured by Paystack Ghana</span>
          </div>

          <div className="space-y-2.5">
            {/* MTN Mobile Money */}
            <div
              onClick={() => setPaymentProvider("mtn")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentProvider === "mtn"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentProvider === "mtn" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {paymentProvider === "mtn" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-yellow-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/payments/mtn.jpg"
                      alt="MTN Mobile Money"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">MTN Mobile Money</span>
                    <span className="text-[10px] text-gray-500">Prompt directly on your phone</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Instant Prompt
              </span>
            </div>

            {/* Telecel Cash */}
            <div
              onClick={() => setPaymentProvider("telecel")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentProvider === "telecel"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentProvider === "telecel" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {paymentProvider === "telecel" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-red-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/payments/telecel.jpg"
                      alt="Telecel Cash"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Telecel Cash</span>
                    <span className="text-[10px] text-gray-500">Fast MoMo checkout</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Available</span>
            </div>

            {/* ATMoney (AirtelTigo) */}
            <div
              onClick={() => setPaymentProvider("airtel")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentProvider === "airtel"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentProvider === "airtel" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {paymentProvider === "airtel" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-blue-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/payments/airtel.jpg"
                      alt="ATMoney AirtelTigo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">ATMoney (AirtelTigo)</span>
                    <span className="text-[10px] text-gray-500">Secure wallet payment</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Available</span>
            </div>

            {/* Bank Card / Visa / Mastercard */}
            <div
              onClick={() => setPaymentProvider("card")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentProvider === "card"
                  ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    paymentProvider === "card" ? "border-[#F26A00] bg-white" : "border-gray-300"
                  }`}
                >
                  {paymentProvider === "card" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/payments/card.jpg"
                      alt="Visa Mastercard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Bank Card (Visa / Mastercard)</span>
                    <span className="text-[10px] text-gray-500">3D-Secure local &amp; international cards</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">Debit / Credit</span>
            </div>

            {/* Cash on Pickup (Only visible when Shop Pickup is chosen) */}
            {fulfillmentType === "shop_pickup" && (
              <div
                onClick={() => setPaymentProvider("cash_on_pickup")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  paymentProvider === "cash_on_pickup"
                    ? "border-[#F26A00] bg-orange-50/30 ring-1 ring-[#F26A00]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      paymentProvider === "cash_on_pickup" ? "border-[#F26A00] bg-white" : "border-gray-300"
                    }`}
                  >
                    {paymentProvider === "cash_on_pickup" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F26A00]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      GH₵
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Pay on Collection at Shop</span>
                      <span className="text-[10px] text-gray-500">Cash or MoMo at Aki Enterprise counter</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Pay at Counter
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. ORDER SUMMARY REVIEW */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">
            Order Review
          </h3>

          <div className="divide-y divide-gray-100 space-y-2">
            {cart.map((item) => (
              <div key={item.variant_id} className="pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800 truncate max-w-[240px]">
                  {item.quantity}&times; {item.product.title} ({item.selected_variant.storage || item.selected_variant.color})
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatGHS(item.selected_variant.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800 font-mono">{formatGHS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-800 font-mono">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatGHS(deliveryFee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-gray-100">
              <span>Total Payable</span>
              <span className="text-[#F26A00] font-black text-base font-mono">
                {formatGHS(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. POLICIES & GUARANTEE */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#F26A00]" />
            <span>Guaranteed Authenticity &amp; 14-Day Return Protection</span>
          </div>
          <p className="leading-relaxed">
            By placing an order, you agree to AKI ADUNI VENTURES&apos; (Trading as Aki Enterprise){" "}
            <Link href="/policies/terms" target="_blank" className="text-[#F26A00] underline font-semibold">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/policies/cancellation" target="_blank" className="text-[#F26A00] underline font-semibold">
              Cancellation Policy
            </Link>
            , and{" "}
            <Link href="/policies/returns" target="_blank" className="text-[#F26A00] underline font-semibold">
              Return &amp; Refund Policy
            </Link>
            . Orders from GH₵ 500 qualify for free nationwide delivery.
          </p>
        </div>

        {/* Desktop Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="hidden md:flex w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
        >
          <span>
            {isSubmitting
              ? "Connecting..."
              : paymentProvider === "cash_on_pickup"
              ? `Confirm Shop Pickup (${formatGHS(totalAmount)})`
              : `Proceed to Payment (${formatGHS(totalAmount)})`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className="md:hidden fixed bottom-14 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30 shadow-2xl">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-black text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? "Connecting..."
                : paymentProvider === "cash_on_pickup"
                ? `Confirm Pickup • ${formatGHS(totalAmount)}`
                : `Pay Now • ${formatGHS(totalAmount)}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
