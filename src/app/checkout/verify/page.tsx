"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { recordCustomerOrder } from "@/lib/customer-store";
import { formatGHS } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Phone,
  RefreshCw,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const reference = searchParams.get("reference") || "";
  const orderNumberParam = searchParams.get("order") || "";
  const simulated = searchParams.get("simulated") === "true";

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reference) {
      setErrorMessage("No Paystack reference found in verification URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function verifyTransaction() {
      try {
        const res = await fetch(
          `/api/orders/verify?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(
            orderNumberParam
          )}&simulated=${simulated}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.verified) {
          setVerified(true);
          setPaymentInfo(data.payment);

          const finalOrder = data.order || {
            order_number: data.order_number || orderNumberParam,
            paystack_reference: reference,
            payment_status: "paid",
            order_status: "processing",
            total_amount: data.payment?.amount || 0,
            created_at: data.payment?.paid_at || new Date().toISOString(),
          };

          setOrderData(finalOrder);

          // Update customer store in browser
          recordCustomerOrder({
            ...finalOrder,
            payment_status: "paid",
            order_status: "processing",
            paystack_reference: reference,
          });

          // Empty shopping cart after successful payment
          clearCart();
        } else {
          setErrorMessage(data.error || "Payment verification could not be confirmed.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(err.message || "Failed to contact verification service.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [reference, orderNumberParam, simulated, clearCart]);

  const copyOrderNumber = () => {
    const textToCopy = orderData?.order_number || orderNumberParam;
    if (textToCopy && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-[#F26A00] flex items-center justify-center mx-auto mb-4 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Verifying Paystack Payment...
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Connecting with Paystack Ghana to confirm transaction reference:
        </p>
        <code className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-700">
          {reference}
        </code>
      </div>
    );
  }

  if (errorMessage && !verified) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">Verification Notice</h1>
        <p className="text-xs text-gray-600 mb-6">{errorMessage}</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/checkout"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Return to Checkout
          </Link>
          <a
            href="https://wa.me/233551243372"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            Contact WhatsApp Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Badge & Header (Screen only) */}
      <div className="text-center mb-8 no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Paystack Verified Payment</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Payment Successful! Order Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
          Thank you for choosing Aki Enterprise. Your order has been registered and our team is preparing it for dispatch.
        </p>
      </div>

      {/* Order & Payment Summary Card (Printable Official Receipt) */}
      <div id="printable-receipt" className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Printable Official Store Header */}
        <div className="hidden print:block pb-4 mb-2 border-b-2 border-black text-center space-y-1">
          <h2 className="text-2xl font-black text-black">AKI ADUNI VENTURES</h2>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Official Sales &amp; Delivery Receipt</p>
          <p className="text-[11px] text-gray-600">Reg No: BN987061122 • Store: Miaso, Kwahu East, Ghana • Tel: 0551243372</p>
          <p className="text-[10px] text-gray-500">Date: {new Date().toLocaleDateString("en-GB")}</p>
        </div>

        {/* Order Number Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Official Order ID
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-[#F26A00] font-mono">
                {orderData?.order_number || orderNumberParam}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                title="Copy Order ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Copied!
                </span>
              )}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Payment Status
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid in Full</span>
            </span>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">
              Paystack Reference
            </span>
            <code className="font-mono text-gray-800 break-all font-bold">
              {reference}
            </code>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">
              Payment Channel
            </span>
            <span className="font-bold text-slate-900 capitalize">
              {paymentInfo?.channel?.replace(/_/g, " ") || "Mobile Money / Card"} (Paystack Ghana)
            </span>
          </div>

          {orderData?.customer_name && (
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[11px] text-gray-400 font-semibold block">Customer Name</span>
              <span className="font-bold text-slate-900">
                {orderData.customer_name} ({orderData.customer_phone})
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">
              Fulfillment Type
            </span>
            <span className="font-bold text-slate-900 capitalize">
              {orderData?.fulfillment_type === "shop_pickup"
                ? "Free In-Store Pickup (Miaso, Kwahu East)"
                : `Express Delivery to ${orderData?.delivery_city || "Ghana"}`}
            </span>
          </div>
        </div>

        {/* Amount Paid Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F26A00] text-white flex items-center justify-center font-black text-xs">
              GH₵
            </div>
            <div>
              <span className="text-xs font-bold text-gray-700 block">Total Amount Paid</span>
              <span className="text-[11px] text-gray-500">Includes device warranty &amp; delivery</span>
            </div>
          </div>
          <span className="text-xl font-black text-[#F26A00]">
            {formatGHS(paymentInfo?.amount || orderData?.total_amount || 0)}
          </span>
        </div>

        {/* Action Buttons (Screen only) */}
        <div className="space-y-3 pt-2 no-print receipt-screen-actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/orders"
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition"
            >
              <Clock className="w-4 h-4 text-orange-400" />
              <span>View in My Orders</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
          </div>

          <a
            href={`https://wa.me/233551243372?text=${encodeURIComponent(
              `Hello Aki Enterprise, I just completed payment for order ${
                orderData?.order_number || orderNumberParam
              } (Paystack Ref: ${reference}). Please confirm receipt and delivery timeline.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <Phone className="w-4 h-4" />
            <span>Send Order Confirmation to Shop WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full py-2.5 text-xs text-center text-gray-500 hover:text-gray-800 font-semibold flex items-center justify-center gap-1 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-gray-500">Loading Order Verification...</span>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
