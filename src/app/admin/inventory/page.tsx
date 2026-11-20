"use client";

import React, { useState } from "react";
import { PRODUCTS } from "@/lib/mock-data";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import {
  Layers,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  CheckCircle,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [stockList, setStockList] = useState(
    PRODUCTS.flatMap((p) =>
      p.variants.map((v) => ({
        ...v,
        productTitle: p.title,
        brandName: p.brand_name,
      }))
    )
  );

  const [notification, setNotification] = useState<string | null>(null);

  const handleStockAdjust = (variantId: string, delta: number) => {
    setStockList((prev) =>
      prev.map((item) => {
        if (item.id === variantId) {
          const updatedStock = Math.max(0, item.stock_quantity + delta);
          return { ...item, stock_quantity: updatedStock };
        }
        return item;
      })
    );
    setNotification(`Stock updated successfully (${delta > 0 ? `+${delta}` : delta})`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Inventory & Stock Movements</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track SKU balances, record shop restocks, and manage low-stock thresholds
          </p>
        </div>

        {notification && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by SKU, model or condition..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-orange-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs text-gray-400">{stockList.length} Active SKUs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product & Specification</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-center">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {stockList.map((item) => {
                const conditionBadge = getConditionBadge(item.condition);
                const isLowStock = item.stock_quantity <= 5;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-orange-400">
                      {item.sku}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-white line-clamp-1">{item.productTitle}</p>
                      <p className="text-gray-400 text-[11px]">
                        {item.storage ? `${item.storage} • ` : ""}{item.color}
                        {item.battery_health ? ` (Batt: ${item.battery_health})` : ""}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${conditionBadge.className}`}>
                        {conditionBadge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">
                      {formatGHS(item.price)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isLowStock
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {item.stock_quantity} in stock
                        </span>
                        {isLowStock && (
                          <span title="Low stock alert">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStockAdjust(item.id, -1)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white"
                          title="Deduct 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockAdjust(item.id, 1)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white"
                          title="Add 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockAdjust(item.id, 5)}
                          className="px-2 py-1 rounded bg-orange-600/30 hover:bg-orange-600/50 text-orange-400 font-bold text-[10px]"
                          title="Restock batch of 5"
                        >
                          +5 Batch
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
