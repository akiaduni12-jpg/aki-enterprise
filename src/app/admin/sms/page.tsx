"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Clock,
  ShieldCheck,
  Zap,
  Sliders,
  Users,
  Copy,
  ExternalLink,
} from "lucide-react";

interface SMSLog {
  id: string;
  to: string;
  message: string;
  type: string;
  status: string;
  response?: string;
  timestamp: string;
}

export default function AdminSMSPage() {
  const [balance, setBalance] = useState<string | number>("Checking...");
  const [senderId, setSenderId] = useState("AKI SHOP");
  const [senderIdStatus, setSenderIdStatus] = useState("pending_approval");
  const [recentLogs, setRecentLogs] = useState<SMSLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  // Quick SMS Sender State
  const [recipient, setRecipient] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Settings Toggles
  const [notifyCustomerOrder, setNotifyCustomerOrder] = useState(true);
  const [notifyCustomerStatus, setNotifyCustomerStatus] = useState(true);
  const [notifyAdminAlert, setNotifyAdminAlert] = useState(true);
  const [autoSavePhonebook, setAutoSavePhonebook] = useState(true);

  const fetchSMSStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sms");
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance || "Active");
        if (data.senderId) setSenderId(data.senderId);
        if (data.senderIdStatus) setSenderIdStatus(data.senderIdStatus);
        if (Array.isArray(data.recentLogs)) setRecentLogs(data.recentLogs);
      }
    } catch (err) {
      console.error("SMS status fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSMSStatus();
  }, []);

  const handleRefreshBalance = async () => {
    setIsCheckingBalance(true);
    await fetchSMSStatus();
    setIsCheckingBalance(false);
  };

  const handleSendQuickSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !messageText.trim()) return;

    setIsSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient.trim(),
          message: messageText.trim(),
          senderId,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setFeedback({
          type: "success",
          text: `SMS dispatched successfully to ${recipient}! Response: ${json.message || "OK"}`,
        });
        setMessageText("");
        setRecipient("");
        fetchSMSStatus();
      } else {
        setFeedback({
          type: "error",
          text: `Gateway notice: ${json.error || json.message || "Could not deliver SMS."}`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Network error while calling SMS gateway.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const applyTemplate = (tpl: string) => {
    setMessageText(tpl);
  };

  const charCount = messageText.length;
  const smsUnits = Math.max(1, Math.ceil(charCount / 160));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Arkesel Ghana SMS Gateway
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">SMS Notifications &amp; Alerts</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage automated customer order SMS notifications, check Arkesel credits, and dispatch instant store text alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshBalance}
            disabled={isCheckingBalance}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-orange-400 ${isCheckingBalance ? "animate-spin" : ""}`}
            />
            <span>Check Balance</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Gateway Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Arkesel SMS Balance</span>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{String(balance)}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Units available for dispatch</span>
        </div>

        {/* Sender ID Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Registered Sender ID</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-1 font-mono">{senderId}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-amber-300">
              Pending Network Approval
            </span>
          </div>
        </div>

        {/* Store Owner Phone */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Admin Alert Line</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white mt-1 font-mono">0551243372</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Receives instant order alerts</span>
        </div>

        {/* Phonebook Status */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-medium">Contact Phonebook</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">Aki Customers</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Auto-synced from orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick SMS Composer & Templates (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-500" />
                <span>Quick SMS Dispatcher</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">Direct Arkesel Gateway</span>
            </div>

            {/* Quick Preset Templates */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: "Pickup Ready",
                    text: "Hello! Your Aki Enterprise order is READY FOR PICKUP at our Miaso shop (Kwahu East). Hotline: 0551243372.",
                  },
                  {
                    name: "Out for Delivery",
                    text: "Hello! Your Aki Enterprise order is OUT FOR DELIVERY with our courier. Please keep phone reachable: 0551243372.",
                  },
                  {
                    name: "New Promo Deal",
                    text: "Special Weekend Offer at Aki Enterprise! Premium iPhones & Samsung devices now in stock at Miaso. Call: 0551243372.",
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyTemplate(tpl.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-300 text-[11px] font-semibold border border-slate-800 transition cursor-pointer"
                  >
                    + {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendQuickSMS} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Recipient Ghana Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0551243372 or 0244891102"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder-gray-500 focus:outline-hidden focus:border-orange-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-300 font-semibold">Message Text *</label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {charCount}/160 chars ({smsUnits} SMS)
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your SMS message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-hidden focus:border-orange-500 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-gray-400">
                  Sender: <strong className="text-gray-200">{senderId}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Sending..." : "Send SMS Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Automated Trigger Rules & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-500" />
                <span>Automated SMS Triggers</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Active</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Customer Order Confirmation</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">
                    Automatically sends instant order received SMS with order number and total to customer.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCustomerOrder}
                  onChange={(e) => setNotifyCustomerOrder(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-600 rounded"
                />
              </div>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Admin Order Alert (0551243372)</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">
                    Sends real-time SMS to store owner whenever a customer places a new order.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAdminAlert}
                  onChange={(e) => setNotifyAdminAlert(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-600 rounded"
                />
              </div>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Order Fulfillment Updates</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">
                    Sends SMS when order status changes to Ready for Pickup or Out for Delivery.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCustomerStatus}
                  onChange={(e) => setNotifyCustomerStatus(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-600 rounded"
                />
              </div>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Auto-Save to Arkesel Phonebook</span>
                  <span className="text-gray-400 text-[11px] block mt-0.5">
                    Automatically adds purchasing customers to &quot;Aki Customers&quot; list on Arkesel.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSavePhonebook}
                  onChange={(e) => setAutoSavePhonebook(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-orange-600 rounded"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <span className="font-bold block">Sender ID Network Notice:</span>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Sender ID <strong className="text-white">&quot;AKI SHOP&quot;</strong> is currently submitted for approval on Arkesel. Messages sent during approval will deliver with Arkesel default channel. Once approved by Ghana telcos (MTN, Telecel, AT), it will automatically deliver with &quot;AKI SHOP&quot;.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Audit Log Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>Recent SMS Activity Log</span>
          </h3>
          <span className="text-xs text-gray-400">{recentLogs.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Message Content</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No SMS messages dispatched yet.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{log.to}</td>
                    <td className="py-3 px-4 text-gray-300 max-w-md truncate">{log.message}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-gray-300">
                        {log.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === "sent" || log.status === "delivered"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : log.status === "pending_sender_id"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {log.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
