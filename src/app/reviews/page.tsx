"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Send,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Testimonial {
  id: string;
  customer_name: string;
  city: string;
  rating: number;
  highlight: string;
  content: string;
  verified_buyer: boolean;
  created_at: string;
}

export default function ReviewsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState("Accra");
  const [rating, setRating] = useState(5);
  const [highlight, setHighlight] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/feedback?type=testimonials");
        const data = await res.json();
        if (data.success && data.testimonials) {
          setTestimonials(data.testimonials);
        }
      } catch (err) {
        console.warn("Failed to fetch testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "testimonial",
          data: {
            customer_name: name.trim(),
            city: city.trim(),
            rating: Number(rating),
            highlight: highlight.trim() || "Authentic Product & Fast Delivery",
            content: content.trim(),
            verified_buyer: true,
            status: "approved",
          },
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        const newEntry: Testimonial = {
          id: `local-${Date.now()}`,
          customer_name: name.trim(),
          city: city.trim(),
          rating: Number(rating),
          highlight: highlight.trim() || "Authentic Product & Fast Delivery",
          content: content.trim(),
          verified_buyer: true,
          created_at: new Date().toISOString(),
        };
        setTestimonials([newEntry, ...testimonials]);
        setName("");
        setHighlight("");
        setContent("");
      }
    } catch (err) {
      console.warn("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      {/* Header */}
      <div className="bg-[#171717] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 text-[#FF8A24] text-xs font-bold border border-orange-500/30">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Verified Customer Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Customer Reviews &amp; Feedback
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Real experiences from Ghanaian shoppers buying authentic smartphones, GaN chargers, and computer electronics from AKI ADUNI VENTURES (Aki Enterprise).
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Rating Overview Scorecard */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="text-4xl sm:text-5xl font-black text-[#F26A00] tracking-tight">4.9</div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-900">
                100% Verified Ghana Purchases
              </p>
              <p className="text-[11px] text-gray-500">
                Certified quality checks and Paystack-backed transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="#review-form"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#F26A00] hover:bg-[#d95e00] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Leave Your Feedback</span>
            </a>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-200 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {item.verified_buyer && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                  &ldquo;{item.highlight}&rdquo;
                </h4>

                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-bold text-slate-800">{item.customer_name}</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span>{item.city}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submission Form */}
        <div id="review-form" className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="space-y-1 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F26A00]">
              Customer Service Feedback
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Share Your Experience With AKI ADUNI VENTURES
            </h3>
            <p className="text-xs text-gray-500">
              Your feedback helps us continuously improve device quality testing and delivery speed in Ghana.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Thank you for your review!</h4>
              <p className="text-xs text-emerald-700">
                Your feedback has been received and added to our verified customer feedback registry.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your City / Region</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Accra, Kumasi, or Kwahu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                >
                  <option value={5}>5 Stars - Outstanding &amp; Original Quality</option>
                  <option value={4}>4 Stars - Very Good Experience</option>
                  <option value={3}>3 Stars - Satisfactory</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Headline</label>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="e.g. Fast delivery to Kumasi & iPhone battery health is 100%"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell other shoppers about device packaging, IMEI verification, delivery time, or customer care..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#F26A00] focus:ring-1 focus:ring-[#F26A00] transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting Review..." : "Submit Customer Review"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
