"use client";

import { useEffect, useState } from "react";
import { getPlans, Plan } from "@/services/superAdminService";
import { 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Table, 
  BookOpen, 
  PieChart, 
  Palette,
  ArrowRight
} from "lucide-react";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ""
  });

  const handleDelete = () => {
    // Mock deletion
    console.log("Deleting plan:", deleteModal.id);
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPlans();
      setPlans(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">Pricing Plans</h1>
          <p className="text-neutral-500 text-lg font-medium">Define and manage subscription packages for the platform.</p>
        </div>
        <button className="flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 active:scale-95 px-8 py-4 rounded-[2rem] font-black text-sm shadow-2xl shadow-primary/30 transition-all group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Create New Plan
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-[500px] glass rounded-[3rem] border border-neutral-800/50 animate-pulse" />)
        ) : plans.map((plan) => (
          <div key={plan.id} className="glass p-10 rounded-[3rem] border border-neutral-800/50 hover:border-primary/30 transition-all group flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 group-hover:text-primary transition-colors uppercase">{plan.name}</h3>
                <p className="text-neutral-500 font-medium">Platform License Plan</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black text-white">₹{plan.price}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Per {plan.billingCycle}</p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6 mb-12 flex-grow">
              <p className="text-[10px] text-primary font-black uppercase tracking-widest border-b border-primary/10 pb-2">Includes Features</p>
              {plan.features.map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/item:bg-primary transition-all">
                    <Check className="w-3.5 h-3.5 text-primary group-hover/item:text-white" />
                  </div>
                  <span className="text-neutral-400 font-medium text-sm group-hover/item:text-white transition-colors">{feature}</span>
                </div>
              ))}
            </div>

            {/* Limits Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl group-hover:border-neutral-700 transition-all">
                <Table className="w-6 h-6 text-neutral-500 mb-3" />
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Max Tables</p>
                <p className="text-xl font-black text-white">{plan.maxTables}+</p>
              </div>
              <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl group-hover:border-neutral-700 transition-all">
                <BookOpen className="w-6 h-6 text-neutral-500 mb-3" />
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Menu Items</p>
                <p className="text-xl font-black text-white">{plan.maxMenuItems}+</p>
              </div>
              <div className={`p-6 rounded-3xl border transition-all ${plan.hasAnalytics ? 'bg-primary/5 border-primary/20' : 'bg-neutral-950 border-neutral-800 opacity-50'}`}>
                <PieChart className={`w-6 h-6 mb-3 ${plan.hasAnalytics ? 'text-primary' : 'text-neutral-600'}`} />
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Analytics</p>
                <p className="text-sm font-black text-white">{plan.hasAnalytics ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className={`p-6 rounded-3xl border transition-all ${plan.hasBranding ? 'bg-primary/5 border-primary/20' : 'bg-neutral-950 border-neutral-800 opacity-50'}`}>
                <Palette className={`w-6 h-6 mb-3 ${plan.hasBranding ? 'text-primary' : 'text-neutral-600'}`} />
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Branding</p>
                <p className="text-sm font-black text-white">{plan.hasBranding ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button className="flex-grow flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white px-6 py-4 rounded-2xl font-black text-sm transition-all active:scale-95">
                <Edit3 className="w-4 h-4" /> Edit Plan
              </button>
              <button 
                onClick={() => setDeleteModal({ isOpen: true, id: plan.id, name: plan.name })}
                className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Highlight for Pro */}
            {plan.id === 'p2' && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-8 py-2 rotate-45 translate-x-3 translate-y-2 shadow-xl">
                  Most Popular
                </div>
              </div>
            )}
            
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.name}
        description="Are you sure you want to delete this subscription plan? Existing restaurants using this plan might be affected."
      />

      {/* Pro Help */}
      <div className="glass p-12 rounded-[3.5rem] border border-primary/10 bg-gradient-to-tr from-primary/10 via-transparent to-transparent flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Need a custom enterprise plan?</h2>
          <p className="text-neutral-500 font-medium">Contact our architects to build a solution for large restaurant chains.</p>
        </div>
        <button className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:bg-neutral-200 transition-all group-hover:translate-x-1">
          Talk to Experts <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
