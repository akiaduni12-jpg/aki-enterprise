"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ProductReview,
  StoreTestimonial,
  getStoredProductReviews,
  updateProductReviewStatus,
  deleteProductReview,
  getStoredTestimonials,
  updateTestimonialStatus,
  toggleTestimonialFeatured,
  deleteTestimonial,
} from "@/lib/feedback-store";
import {
  MessageSquare,
  Quote,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Eye,
  Filter,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"products" | "testimonials">("products");
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [testimonials, setTestimonials] = useState<StoreTestimonial[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setProductReviews(getStoredProductReviews());
    setTestimonials(getStoredTestimonials());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("feedback_updated", handleUpdate);
    return () => window.removeEventListener("feedback_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Product Review Actions
  const handleApproveReview = (id: string) => {
    updateProductReviewStatus(id, "approved");
    showToast("Product review approved & live on store.");
    loadData();
  };

  const handleRejectReview = (id: string) => {
    updateProductReviewStatus(id, "rejected");
    showToast("Product review hidden.");
    loadData();
  };

  const handleDeleteReview = (id: string) => {
    if (confirm("Permanently delete this product review?")) {
      deleteProductReview(id);
      showToast("Review deleted.");
      loadData();
    }
  };

  // Store Testimonial Actions
  const handleApproveTestimonial = (id: string) => {
    updateTestimonialStatus(id, "approved");
    showToast("Testimonial approved.");
    loadData();
  };

  const handleToggleFeatured = (id: string) => {
    toggleTestimonialFeatured(id);
    showToast("Homepage featured status updated.");
    loadData();
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm("Permanently delete this store testimonial?")) {
      deleteTestimonial(id);
      showToast("Testimonial deleted.");
      loadData();
    }
  };

  const filteredProductReviews = productReviews.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const filteredTestimonials = testimonials.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] border border-orange-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FF8A24]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600/20 text-[#FF8A24] border border-orange-600/30">
              Customer Feedback Moderation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Reviews &amp; Store Testimonials
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Moderate incoming customer ratings, verify real purchasers, and feature highlights on the public storefront.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "products"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Product Reviews ({productReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("testimonials")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "testimonials"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>Store Testimonials ({testimonials.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. PRODUCT REVIEWS TAB */}
      {/* ==================================================================== */}
      {activeTab === "products" && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Showing {filteredProductReviews.length} Device Reviews
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved &amp; Live</option>
              <option value="pending">Pending Moderation</option>
              <option value="rejected">Rejected / Hidden</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating &amp; Headline</th>
                  <th className="py-3 px-4">Commentary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-normal">
                {filteredProductReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      <Link
                        href={`/product/${rev.product_slug}`}
                        target="_blank"
                        className="font-bold text-white hover:text-[#FF8A24] flex items-center gap-1.5 line-clamp-1"
                      >
                        <span>{rev.product_title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-gray-500" />
                      </Link>
                      <span className="text-[10px] text-gray-500 font-mono">/{rev.product_slug}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{rev.customer_name}</span>
                        {rev.verified_purchase && (
                          <span title="Verified Purchase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-[#FF8A24] mb-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? "fill-[#FF8A24] text-[#FF8A24]" : "text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-200 line-clamp-1 text-xs">
                        {rev.title}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-gray-400 line-clamp-2 leading-relaxed text-xs">
                        {rev.comment}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          rev.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : rev.status === "pending"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== "approved" && (
                          <button
                            onClick={() => handleApproveReview(rev.id)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Approve Review"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {rev.status !== "rejected" && (
                          <button
                            onClick={() => handleRejectReview(rev.id)}
                            className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            title="Reject / Hide Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. STORE TESTIMONIALS TAB */}
      {/* ==================================================================== */}
      {activeTab === "testimonials" && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Showing {filteredTestimonials.length} Store Testimonials
            </span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer &amp; Location</th>
                  <th className="py-3 px-4">Rating &amp; Highlight</th>
                  <th className="py-3 px-4">Story</th>
                  <th className="py-3 px-4">Homepage Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-normal">
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{t.customer_name}</span>
                        {t.verified_buyer && (
                          <span title="Verified Customer">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <MapPin className="w-3 h-3 text-[#FF8A24]" />
                        <span>{t.city}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-[#FF8A24] mb-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= t.rating ? "fill-[#FF8A24] text-[#FF8A24]" : "text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-white text-xs">{t.highlight}</span>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-gray-400 line-clamp-2 leading-relaxed text-xs">
                        {t.content}
                      </p>
                    </td>

                    {/* Featured on Homepage */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(t.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 ${
                          t.featured
                            ? "bg-orange-500/20 text-[#FF8A24] border border-orange-500/30"
                            : "bg-slate-900 text-gray-500 border border-slate-700"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        <span>{t.featured ? "Featured on Home" : "Not Featured"}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          t.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status !== "approved" && (
                          <button
                            onClick={() => handleApproveTestimonial(t.id)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Approve Testimonial"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
