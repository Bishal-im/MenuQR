"use client";

import { Plus, Search, Shield, User, Mail, Phone, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const staffData = [
  { id: 1, name: "Suman Kumar", role: "Admin", email: "suman@momohouse.com", phone: "9801234567", status: "Active" },
  { id: 2, name: "Rita Thapa", role: "Kitchen Manager", email: "rita@momohouse.com", phone: "9807654321", status: "Active" },
  { id: 3, name: "Hari Prasad", role: "Waiter", email: "hari@momohouse.com", phone: "9812345678", status: "Offline" },
];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-sm text-muted">Manage your team and their access levels</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Staff Member
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-background/30 px-6">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Contact</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {staffData.map((staff) => (
              <tr key={staff.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center border border-border">
                         <User className="h-4 w-4 text-muted" />
                      </div>
                      <span className="text-sm font-bold">{staff.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-muted">{staff.role}</td>
                <td className="px-6 py-4">
                   <p className="text-xs flex items-center gap-2"><Mail className="h-3 w-3" /> {staff.email}</p>
                   <p className="text-[10px] text-muted flex items-center gap-2 mt-1"><Phone className="h-3 w-3" /> {staff.phone}</p>
                </td>
                <td className="px-6 py-4">
                   <span className={cn(
                     "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                     staff.status === "Active" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                   )}>
                      {staff.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted hover:text-foreground hover:bg-white/10 rounded-lg">
                         <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
