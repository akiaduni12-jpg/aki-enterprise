"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  PackageCheck,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Business & Stock" | "Delivery & Timelines" | "Payments & Security" | "Warranty & Returns";
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "Business & Stock",
    question: "What is the legal business name behind Aki Enterprise?",
    answer:
      "Our registered business name is AKI ADUNI VENTURES (Registration No: BN987061122), officially registered in the Republic of Ghana under the Registration of Business Names Act, 1962 (Act 151). Our physical retail store and central fulfillment hub is located in Miaso, Kwahu East, Eastern Region, Ghana.",
  },
  {
    category: "Business & Stock",
    question: "Are products physically held in stock, or is this a dropshipping model?",
    answer:
      "All products displayed on our website are 100% physically held in stock in our own retail store and warehouse in Miaso, Kwahu East, Ghana. We do NOT operate a dropshipping model. Every smartphone, charger, power bank, and accessory is physically inspected, tested, cataloged, and dispatched directly from our own premises by our in-house staff.",
  },
  {
    category: "Business & Stock",
    question: "Can I visit your physical shop to inspect devices or pick up my order?",
    answer:
      "Yes, absolutely. Customers are welcome to visit our physical store in Miaso, Kwahu East, Eastern Region, Ghana. You can physically test gadgets, check battery health, and make payments in person via Mobile Money, Card, or Cash. In-store pickup is completely free and available Monday through Saturday from 8:00 AM to 7:00 PM.",
  },
  {
    category: "Delivery & Timelines",
    question: "What is your estimated delivery timeline across Ghana?",
    answer:
      "We provide prompt express delivery across all regions in Ghana:\n• Kwahu District & Eastern Region: Same day to 24 hours.\n• Greater Accra & Kumasi Metropolitan: 24 to 48 hours via express parcel service.\n• Other Regions (Northern, Western, Central, Volta, etc.): 2 to 3 business days.\n• Store Pickup at Miaso: Immediate upon order confirmation.",
  },
  {
    category: "Delivery & Timelines",
    question: "How much does delivery cost, and do you offer free shipping?",
    answer:
      "Standard nationwide courier delivery is GH₵ 30. However, all orders of GH₵ 500 or more qualify for 100% FREE Express Delivery anywhere in Ghana. In-store pickup at our Miaso shop is always free.",
  },
  {
    category: "Delivery & Timelines",
    question: "How do I track my order once dispatched?",
    answer:
      "Every order receives a dedicated tracking code (e.g., #AKI-...). You can enter your Order ID on our Track Order page (/orders or /track) or contact our dispatch team directly on WhatsApp (+233 55 124 3372) for live updates.",
  },
  {
    category: "Payments & Security",
    question: "What payment methods are accepted on your website?",
    answer:
      "We accept instant, regulated payments powered by Paystack:\n• MTN Mobile Money (MoMo)\n• Telecel Cash\n• ATMoney\n• Visa and Mastercard debit/credit cards\n• Cash or POS payment for in-store shop pickup in Miaso.",
  },
  {
    category: "Payments & Security",
    question: "Is it safe to pay online with Mobile Money or Card on your store?",
    answer:
      "Yes, 100% secure. All payment processing is routed through Paystack, a licensed and PCI-DSS certified payment service provider. We never see, collect, or store your Mobile Money PINs or card details.",
  },
  {
    category: "Warranty & Returns",
    question: "What warranty coverage do you provide on phones and electronics?",
    answer:
      "Every product includes an official AKI ADUNI VENTURES Shop Warranty:\n• Brand New Devices & Chargers: 12 Months warranty.\n• Certified UK-Used Grade A Phones: 6 Months comprehensive hardware and software warranty with guaranteed 85%+ battery health.\n• Cables, Adapters & Earbuds: 3 to 6 Months replacement guarantee.",
  },
  {
    category: "Warranty & Returns",
    question: "Can I cancel my order if I change my mind?",
    answer:
      "Yes. You can cancel your order at any time before it has been dispatched by contacting Customer Care (+233 55 124 3372) with your Order ID. There is a 0% cancellation fee. For prepaid orders, your full refund is initiated immediately and reflects back in your Mobile Money or bank account within 24 to 48 business hours via Paystack.",
  },
  {
    category: "Warranty & Returns",
    question: "What is your Return and Refund Policy?",
    answer:
      "We offer a 14-day return window from the day of delivery or pickup. If an item arrives defective or damaged, AKI ADUNI VENTURES covers 100% of return shipping and offers an immediate replacement or full refund. Unopened items with intact factory seals may also be returned within 14 days with 0% restocking fee.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Business & Stock", "Delivery & Timelines", "Payments & Security", "Warranty & Returns"];

  const filteredFaqs =
    selectedCategory === "All" ? FAQ_DATA : FAQ_DATA.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      {/* Header Banner */}
      <div className="bg-[#171717] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 text-[#FF8A24] text-xs font-bold border border-orange-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center &amp; Regulatory Disclosures</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about AKI ADUNI VENTURES (Trading as Aki Enterprise), our verified in-stock physical inventory, delivery timelines across Ghana, and Paystack payment security.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Compliance Key Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs text-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center mx-auto">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">100% In-Stock</h4>
            <p className="text-[10px] text-gray-500 leading-snug">Physical inventory in Miaso, not dropshipping</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs text-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">24 - 48h Delivery</h4>
            <p className="text-[10px] text-gray-500 leading-snug">Accra, Kumasi &amp; Eastern Region transit</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs text-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center mx-auto">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Paystack Secured</h4>
            <p className="text-[10px] text-gray-500 leading-snug">MTN MoMo, Telecel Cash &amp; Cards</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs text-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F26A00] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Shop Warranty</h4>
            <p className="text-[10px] text-gray-500 leading-snug">12-month brand new / 6-month UK-used</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#F26A00] text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#F26A00] shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#F26A00]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-50 leading-relaxed whitespace-pre-line bg-gray-50/20">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legal & Regulatory Support Card */}
        <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F26A00]">
              Official Business Registration Notice
            </span>
            <h3 className="text-base font-black text-slate-900">
              Need personalized assistance or store verification?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>AKI ADUNI VENTURES</strong> maintains dedicated customer service lines for retail purchases, business inquiries, and warranty claims in Ghana.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Store</span>
            </Link>
            <a
              href="https://wa.me/233551243372"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition"
            >
              <span>WhatsApp Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
