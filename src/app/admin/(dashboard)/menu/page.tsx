"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, MoreVertical, Image as ImageIcon, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { useSearchParams } from "next/navigation";
import { 
  getMenuData, 
  deleteMenuItem, 
  addCategory, 
  deleteCategory,
  addMenuItem,
  updateMenuItem
} from "@/services/adminService";

function MenuContent() {
  const searchParams = useSearchParams();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getMenuData();
    setCategories(data.categories);
    setMenuItems(data.menuItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditingItem(null);
      setIsItemModalOpen(true);
    }
  }, [searchParams]);

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

  const handleAddCategory = async (name: string) => {
    const res = await addCategory(name);
    if (res.success) {
      setIsCategoryModalOpen(false);
      await fetchData();
    } else {
      alert("Failed to add category: " + res.error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await deleteCategory(id);
    if (res.success) {
      await fetchData();
      if (activeCategory === id) setActiveCategory("all");
    } else {
      alert(res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading your menu...</p>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-1">Menu Management</h2>
          <p className="text-xs md:text-sm text-neutral-500 font-medium">Create and manage your restaurant menu items</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 md:py-2.5 text-xs md:text-sm font-bold text-white hover:bg-neutral-800 transition shadow-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Category
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 md:py-2.5 text-xs md:text-sm font-bold text-black hover:bg-orange-600 transition shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border uppercase tracking-widest",
              activeCategory === "all" 
                ? "bg-primary border-primary text-black shadow-lg shadow-primary/10" 
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border uppercase tracking-widest pr-8",
                  activeCategory === cat.id 
                    ? "bg-primary border-primary text-black shadow-lg shadow-primary/10" 
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                )}
              >
                {cat.name}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search dish name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 pl-12 pr-4 text-sm font-medium text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 md:w-72 transition-all"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
           <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:border-primary/20 transition-all overflow-hidden"
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary flex items-center justify-center border border-neutral-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-neutral-700 opacity-20" />
                  )}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 transition group-hover:opacity-100",
                    item.status === "Out of Stock" && "opacity-100 bg-red-950/40"
                  )}>
                     <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsItemModalOpen(true);
                      }}
                      className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                     >
                        <Edit2 className="h-4 w-4" />
                     </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.category}</p>
                     {item.status === "Out of Stock" ? (
                       <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">SOLD OUT</span>
                     ) : (
                       <span className="text-[10px] font-black text-emerald-500">AVAILABLE</span>
                     )}
                  </div>
                  <h3 className="mt-1 font-black truncate leading-tight text-white">{item.name}</h3>
                  <p className="text-xs text-neutral-500 mb-3 italic">{item.isVeg ? "Veg" : "Non-Veg"}</p>
                  <div className="flex items-center justify-between mt-auto">
                     <p className="text-lg font-black text-white">Rs. {item.price}</p>
                     <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2 text-neutral-500 hover:bg-white/5 hover:text-white transition-colors">
                          {item.status === "In Stock" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: item.name })}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
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

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onSave={handleAddCategory} 
      />

      <MenuItemModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={fetchData}
        initialData={editingItem}
        categories={categories}
      />
    </div>
  );
}

export default function MenuManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Loading menu...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}

// Sub-components (Modals)
function CategoryModal({ isOpen, onClose, onSave }: any) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-6">Add New Category</h3>
        <input 
          type="text" 
          placeholder="Category Name (e.g. Appetizers)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none mb-8 font-bold"
          autoFocus
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black text-neutral-500 hover:text-white transition-colors">Cancel</button>
          <button 
            disabled={loading || !name}
            onClick={async () => {
              setLoading(true);
              await onSave(name);
              setLoading(false);
              setName("");
            }} 
            className="flex-1 bg-primary py-4 rounded-2xl font-black text-black hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItemModal({ isOpen, onClose, onSave, initialData, categories }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    isVeg: false,
    image: "",
    isAvailable: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        category: initialData.categoryId || "",
        isVeg: initialData.isVeg,
        image: initialData.image || "",
        isAvailable: initialData.status === "In Stock"
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: categories[0]?.id || "",
        isVeg: false,
        image: "",
        isAvailable: true
      });
    }
  }, [initialData, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateMenuItem(initialData.id, formData);
      } else {
        await addMenuItem(formData);
      }
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error saving item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl my-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-white">{initialData ? "Edit Item" : "Add New Item"}</h3>
            <button type="button" onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Item Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none font-bold placeholder:text-neutral-800"
                  placeholder="e.g. Chicken Momo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Price (Rs.)</label>
                <input 
                  required
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none font-bold appearance-none cursor-pointer"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-[116px] bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none font-medium text-sm placeholder:text-neutral-800 resize-none"
                  placeholder="Tell your customers more about this dish..."
                />
              </div>

              <div className="flex items-center gap-6 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isVeg"
                    checked={formData.isVeg}
                    onChange={e => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isVeg" className="text-sm font-bold text-white cursor-pointer select-none">Vegetarian Item</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Image URL</label>
                <input 
                  type="text" 
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-primary outline-none font-medium text-sm placeholder:text-neutral-800"
                  placeholder="https://example.com/item.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary py-4 rounded-2xl font-black text-black hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (initialData ? "Update Item" : "Create Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

