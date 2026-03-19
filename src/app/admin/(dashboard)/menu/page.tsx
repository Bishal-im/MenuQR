"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, MoreVertical, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { getMenuData, deleteMenuItem } from "@/services/adminService";

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getMenuData();
    setCategories(["All", ...data.categories.map((c: any) => c.name)]);
    setMenuItems(data.menuItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    const res = await deleteMenuItem(deleteModal.id);
    if (res.success) {
      setDeleteModal({ ...deleteModal, isOpen: false });
      await fetchData();
    } else {
      alert("Failed to delete item: " + res.error);
    }
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted font-medium">Loading menu...</p>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => 
    activeCategory === "All" || item.category === activeCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-sans">Menu Management</h2>
          <p className="text-sm text-muted">Create, edit and manage your restaurant menu</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add New Item
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                activeCategory === cat 
                  ? "bg-primary border-primary text-black" 
                  : "bg-card border-border text-muted hover:border-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search dish name..." 
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <p className="text-muted">No dishes found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl border border-border bg-card p-4 hover:border-primary/20 transition-all overflow-hidden"
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary flex items-center justify-center border border-border">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted opacity-20" />
                  )}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 transition group-hover:opacity-100",
                    item.status === "Out of Stock" && "opacity-100 bg-red-950/40"
                  )}>
                     <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                        <Edit2 className="h-4 w-4" />
                     </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.category}</p>
                     {item.status === "Out of Stock" ? (
                       <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">SOLD OUT</span>
                     ) : (
                       <span className="text-[10px] font-bold text-emerald-500">AVAILABLE</span>
                     )}
                  </div>
                  <h3 className="mt-1 font-bold truncate leading-tight">{item.name}</h3>
                  <p className="text-xs text-muted mb-3 italic">{item.isVeg ? "Veg" : "Non-Veg"}</p>
                  <div className="flex items-center justify-between mt-auto">
                     <p className="text-lg font-bold">Rs. {item.price}</p>
                     <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-foreground">
                          {item.status === "In Stock" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.name })}
                          className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.name}
        description="Are you sure you want to delete this menu item? It will be removed from your digital menu immediately."
        isLoading={isDeleting}
      />
    </div>
  );
}
