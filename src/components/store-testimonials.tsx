"use client";

import React, { useState, useEffect } from "react";
import {
  StoreTestimonial,
  getApprovedTestimonials,
  submitStoreTestimonial,
} from "@/lib/feedback-store";
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Plus,
  MapPin,
  X,
  Send,
} from "lucide-react";

export function StoreTestimonials() {
  const [testimonials, setTestimonials] = useState<StoreTestimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("Accra");
  const [rating, setRating] = useState(5);
  const [highlight, setHighlight] = useState("");
  const [content, setContent] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setTestimonials(getApprovedTestimonials());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("feedback_updated", handleUpdate);
    return () => window.removeEventListener("feedback_updated", handleUpdate);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    submitStoreTestimonial({
      customer_name: name.trim(),
      city: city.trim() || "Accra, Ghana",
      rating,
      highlight: highlight.trim() || "Authentic Products & Great Service",
      content: content.trim(),
    });

    setName("");
    setCity("Accra");
    setHighlight("");
    setContent("");
    setRating(5);
    setIsModalOpen(false);
    setToastMessage("Thank you! Your testimonial has been shared.");
    setTimeout(() => setToastMessage(null), 4000);
    loadData();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              What Customers Across Ghana Say
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Customer reviews from verified buyers who purchased smartphones, power banks, and accessories.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-black text-white font-bold text-xs shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FF8A24]" />
          <span>Share Your Shopping Experience</span>
        </button>
      </div>

      {/* Testimonials 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between hover:border-orange-200 hover:shadow-xl transition-all duration-300 relative group"
          >
            {/* Top Row: Stars & Quote Icon */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-[#F26A00]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= test.rating
                          ? "fill-[#F26A00] text-[#F26A00]"
                          : "text-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-orange-200 group-hover:text-[#F26A00] transition" />
              </div>

              {/* Highlight */}
              <h3 className="text-sm font-black text-slate-900 tracking-tight mb-2 line-clamp-1">
                "{test.highlight}"
              </h3>

              {/* Content */}
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                {test.content}
              </p>
            </div>

            {/* Author Lockup */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{test.customer_name}</span>
                  {test.verified_buyer && (
                    <span title="Verified Customer">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#F26A00]" />
                  <span>{test.city}</span>
                </div>
              </div>

              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Share Your Aki Enterprise Experience
                </h3>
                <p className="text-xs text-gray-500">
                  Aki Enterprise • Customer Satisfaction Review
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  How would you rate your store experience? *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${s <= rating
                            ? "fill-[#F26A00] text-[#F26A00]"
                            : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-900 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kofi Asante"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Legon, Accra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Experience Highlight (Short Summary) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honest battery health and instant delivery!"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Full Testimonial */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Story &amp; Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the device you bought, in-store or online service, battery health accuracy, and delivery..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
