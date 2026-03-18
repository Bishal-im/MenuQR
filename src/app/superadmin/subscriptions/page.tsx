"use client";

import { useEffect, useState } from "react";
import { getSubscriptions } from "@/services/superAdminService";
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  History,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";

export default function SubscriptionsManagement() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSubscriptions();
      setSubs(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Subscriptions</h1>
          <p className="text-neutral-500 font-medium">Monitor active licenses, expirations, and renewal statuses.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-neutral-800 transition-all">
          <History className="w-4 h-4" /> Renewal History
        </button>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass rounded-[2rem] border border-neutral-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/50 bg-neutral-900/50">
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Restaurant</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Start Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Expiry</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payment</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-10 h-20 bg-neutral-900/20" />
                    </tr>
                  ))
                ) : subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-900/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-white text-xs border border-neutral-700 group-hover:bg-orange-500 transition-all">
                          GD
                        </div>
                        <span className="text-sm font-black text-white">The Grand Dhaba</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">PRO SaaS</span>
                    </td>
                    <td className="px-8 py-6 text-xs text-neutral-400 font-medium">{sub.startDate}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs text-white font-bold">{sub.expiryDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-black text-green-500 uppercase tracking-widest">{sub.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-md uppercase tracking-tight">Paid</span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="glass p-8 rounded-[2.5rem] border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-transparent flex items-start gap-6">
          <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white mb-2">Upcoming Expirations</h3>
            <p className="text-neutral-500 text-sm font-medium mb-6">12 restaurants are expiring in the next 7 days. Action required.</p>
            <button className="flex items-center gap-2 text-xs font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors">
              Send Reminder Batch <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-neutral-800/50 flex items-start gap-6">
          <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <Clock className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white mb-2">Subscription Health</h3>
            <p className="text-neutral-500 text-sm font-medium mb-6">92% of your restaurants have active subscriptions with auto-renewal.</p>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 w-[92%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
