"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { saveOrder } from "@/lib/db-service";
import { getCustomerProfile, recordCustomerOrder } from "@/lib/customer-store";
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
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

  const deliveryFee = fulfillmentType === "shop_pickup" ? 0 : deliveryRegion === "accra" ? 35 : 60;
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
      const generatedOrderNumber = `TH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderPayload = {
        order_number: generatedOrderNumber,
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
        order_status: "processing" as any,
        payment_status: paymentMethod === "cash_on_pickup" ? ("pending" as any) : ("paid" as any),
        items: cart.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
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
      };

      await saveOrder(orderPayload);
      recordCustomerOrder(orderPayload);

      setOrderComplete(generatedOrderNumber);
      clearCart();
    } catch (err) {
      console.error("Order submit error:", err);
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
              {fulfillmentType === "shop_pickup" ? "Shop Pickup (Aki Enterprise)" : `Courier Delivery to ${formData.city}`}
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
            href={`https://wa.me/233240000000?text=${encodeURIComponent(
              `Hello Aki Enterprise, I just placed order ${orderComplete} for ${formatGHS(totalAmount)}. Here is my phone number: ${formData.phone}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition"
          >
            <Phone className="w-4 h-4" />
            <span>Confirm Order on WhatsApp</span>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Secure Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">
          Complete your order with Ghana Mobile Money (MTN, Telecel, AT) or Card
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Details & Fulfillment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Fulfillment Mode */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              1. Choose Fulfillment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setFulfillmentType("delivery")}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${fulfillmentType === "delivery"
                    ? "border-orange-600 bg-orange-50/30 ring-1 ring-orange-500"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <Truck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Doorstep Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Dispatched to your home, office or hostel.</p>
                  <span className="text-xs font-semibold text-orange-600 mt-2 block">
                    GH₵ 35.00 (Accra) / GH₵ 60.00 (Regions)
                  </span>
                </div>
              </label>

              <label
                onClick={() => setFulfillmentType("shop_pickup")}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${fulfillmentType === "shop_pickup"
                    ? "border-orange-600 bg-orange-50/30 ring-1 ring-orange-500"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <Store className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Shop Pickup (Free)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Collect at Aki Enterprise TechHub counter.</p>
                  <span className="text-xs font-semibold text-emerald-600 mt-2 block">
                    Free / GH₵ 0.00
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Customer Contact & Location */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              2. Customer Contact & Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Ghana Phone Number (MoMo / WhatsApp) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 0244 123 456"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address (Optional - for digital receipt)
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {fulfillmentType === "delivery" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Delivery Region *
                    </label>
                    <select
                      value={deliveryRegion}
                      onChange={(e) => setDeliveryRegion(e.target.value as "accra" | "other")}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    >
                      <option value="accra">Greater Accra / Tema (GH₵ 35)</option>
                      <option value="other">Kumasi, Takoradi & Other Regions (GH₵ 60)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Town / Landmark / Area *
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. East Legon, Spintex, Osu, Adum"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Street Address & Landmarks
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="House number, GPS address or prominent landmark near you"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              3. Payment Channel
            </h3>

            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod("paystack_momo")}
                className={`w-full p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${paymentMethod === "paystack_momo"
                    ? "border-orange-600 bg-orange-50/40 ring-1 ring-orange-500"
                    : "border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-orange-600 flex items-center justify-center">
                    {paymentMethod === "paystack_momo" && (
                      <div className="w-2 h-2 rounded-full bg-orange-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">
                      Mobile Money (MTN MoMo, Telecel Cash, ATMoney)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Instant prompt sent to your phone via Paystack
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">MTN</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800">Telecel</span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("paystack_card")}
                className={`w-full p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${paymentMethod === "paystack_card"
                    ? "border-orange-600 bg-orange-50/40 ring-1 ring-orange-500"
                    : "border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-orange-600 flex items-center justify-center">
                    {paymentMethod === "paystack_card" && (
                      <div className="w-2 h-2 rounded-full bg-orange-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">
                      Debit / Credit Card
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Visa, Mastercard, GHLink supported
                    </span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </label>

              {fulfillmentType === "shop_pickup" && (
                <label
                  onClick={() => setPaymentMethod("cash_on_pickup")}
                  className={`w-full p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${paymentMethod === "cash_on_pickup"
                      ? "border-orange-600 bg-orange-50/40 ring-1 ring-orange-500"
                      : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-orange-600 flex items-center justify-center">
                      {paymentMethod === "cash_on_pickup" && (
                        <div className="w-2 h-2 rounded-full bg-orange-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        Pay at Shop Counter (Cash / POS)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Inspect device before paying at Aki Enterprise TechHub
                      </span>
                    </div>
                  </div>
                  <Store className="w-5 h-5 text-gray-400" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Order Summary ({cart.length} items)
            </h3>

            {/* Item list */}
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1 space-y-2">
              {cart.map((item) => {
                const conditionBadge = getConditionBadge(item.selected_variant.condition);
                return (
                  <div key={item.variant_id} className="pt-2 flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <Image
                        src={item.product.images[0] || "/placeholder.png"}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.selected_variant.storage || ""} {item.selected_variant.color} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatGHS(item.selected_variant.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatGHS(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fulfillment Fee:</span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? "Free (Pickup)" : formatGHS(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-gray-100 text-slate-900">
                <span>Total Amount:</span>
                <span className="text-orange-600 text-lg">{formatGHS(totalAmount)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Processing Order..." : "Place Order & Pay"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tested & Protected by Aki Enterprise Store Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
