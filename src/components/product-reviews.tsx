"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/ecommerce";
import {
  ProductReview,
  getProductReviewsBySlug,
  submitProductReview,
} from "@/lib/feedback-store";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Plus,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export function ProductReviews({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittedToast, setSubmittedToast] = useState(false);

  const loadReviews = () => {
    const list = getProductReviewsBySlug(product.slug);
    setReviews(list);
  };

  useEffect(() => {
    loadReviews();
    const handleUpdate = () => loadReviews();
    window.addEventListener("feedback_updated", handleUpdate);
    return () => window.removeEventListener("feedback_updated", handleUpdate);
  }, [product.slug]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    submitProductReview({
      product_id: product.id,
      product_slug: product.slug,
      product_title: product.title,
      customer_name: name.trim(),
      rating,
      title: title.trim() || "Verified Customer Purchase",
      comment: comment.trim(),
    });

    setName("");
    setTitle("");
    setComment("");
    setRating(5);
    setIsModalOpen(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
    loadReviews();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-8 shadow-xs">
      {/* Toast Notification */}
      {submittedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="font-bold block">Review Submitted!</span>
            <span className="text-gray-400">Thank you for sharing your feedback with Aki Enterprise.</span>
          </div>
        </div>
      )}

      {/* Header and Summary Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#F26A00]" />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Customer Reviews &amp; Ratings
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real feedback from verified customers who purchased this device.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md shadow-orange-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Rating Snapshot Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-6 rounded-2xl border border-gray-100 items-center">
        {/* Left Score */}
        <div className="md:col-span-4 text-center md:border-r border-gray-200 md:pr-6 space-y-1">
          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center justify-center gap-1 text-[#F26A00]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-[#F26A00] text-[#F26A00]"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium block">
            Based on {reviews.length} customer ratings
          </span>
        </div>

        {/* Right Stars Breakdown */}
        <div className="md:col-span-8 space-y-1.5 text-xs text-gray-600">
          {[5, 4, 3, 2, 1].map((lvl) => {
            const count = reviews.filter((r) => r.rating === lvl).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : lvl === 5 ? 100 : 0;
            return (
              <div key={lvl} className="flex items-center gap-3">
                <span className="w-12 text-gray-500 text-[11px] font-semibold">{lvl} stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-[11px] text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-700">No reviews yet for this product</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Be the first customer to share your thoughts on the battery health, delivery speed, and performance.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
            >
              Leave First Review
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 space-y-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-5 first:pt-0 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F26A00] flex items-center justify-center font-bold text-xs">
                      {rev.customer_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.customer_name}</span>
                        {rev.verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 text-[#F26A00]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "fill-[#F26A00] text-[#F26A00]"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Write a Product Review
                </h3>
                <p className="text-xs text-gray-500">{product.title}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Your Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? "fill-[#F26A00] text-[#F26A00]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-900 ml-2">
                    {rating === 5
                      ? "5 Stars - Excellent"
                      : rating === 4
                      ? "4 Stars - Very Good"
                      : rating === 3
                      ? "3 Stars - Average"
                      : `${rating} Stars`}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Name / Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery health is 100% and fast delivery!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Commentary */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Detailed Review *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about the packaging, camera, battery performance, in-store pickup or delivery experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
