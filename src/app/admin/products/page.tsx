import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/lib/mock-data";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import { Plus, Search, Edit3, Trash2, Eye } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Product Catalog & Variants</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage devices, specifications, warranty terms, and multi-variant pricing
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Product Entry</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by title, brand or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-orange-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs text-gray-400">{PRODUCTS.length} Total Devices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Category / Brand</th>
                <th className="py-3 px-4">Active Variants</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {PRODUCTS.map((prod) => {
                const totalStock = prod.variants.reduce((acc, v) => acc + v.stock_quantity, 0);
                return (
                  <tr key={prod.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <Image
                            src={prod.images[0] || "/placeholder.png"}
                            alt={prod.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{prod.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono">/{prod.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-gray-300">{prod.brand_name}</span>
                      <span className="text-gray-500 block text-[10px]">{prod.category_name}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {prod.variants.map((v) => {
                          const badge = getConditionBadge(v.condition);
                          return (
                            <span
                              key={v.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-gray-300"
                            >
                              {v.storage || v.color} ({badge.label})
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {formatGHS(prod.base_price)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          totalStock > 5
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1 text-gray-400 hover:text-white"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-1 text-gray-400 hover:text-orange-400" title="Edit Product">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
