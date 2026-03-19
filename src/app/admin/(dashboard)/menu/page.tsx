"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { 
  getCategories, 
  getMenuItems, 
  addCategory, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  deleteCategory,
  Category,
  MenuItem
} from "@/services/adminMenuService";
import { useAuth } from "@/context/AuthContext";

export default function MenuManagementPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        getCategories(restaurantId!),
        getMenuItems(restaurantId!)
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      await addCategory(name, restaurantId!);
      await loadData();
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      setMenuItems(menuItems.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch (error) {
      console.error("Failed to toggle availability", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(id);
        setMenuItems(menuItems.filter(i => i.id !== id));
      } catch (error) {
        console.error("Failed to delete item", error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? All items in this category will become uncategorized.")) {
      try {
        await deleteCategory(id);
        await loadData();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Menu Management</h2>
          <p className="text-sm text-neutral-500 font-medium">Create and manage your restaurant menu items</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Category
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-black hover:bg-orange-600 transition shadow-lg shadow-primary/20"
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group relative rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-primary/30 transition-all overflow-hidden glass"
            >
              <div className="flex gap-5">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800 group-hover:border-primary/20 transition-colors">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-neutral-800" />
                  )}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 transition group-hover:opacity-100",
                    !item.isAvailable && "opacity-100 bg-red-950/40"
                  )}>
                     <button 
                        onClick={() => {
                          setEditingItem(item);
                          setIsItemModalOpen(true);
                        }}
                        className="rounded-full bg-primary p-2.5 text-black hover:bg-orange-400 transition transform scale-90 group-hover:scale-100"
                      >
                        <Edit2 className="h-4 w-4" />
                     </button>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {categories.find(c => c.id === item.category)?.name || "Uncategorized"}
                     </p>
                     {!item.isAvailable && (
                       <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">OUT OF STOCK</span>
                     )}
                  </div>
                  <h3 className="mt-1.5 font-black text-white text-lg truncate group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed font-medium">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4">
                     <p className="text-xl font-black text-white">Rs. {item.price}</p>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleAvailability(item)}
                          className={cn(
                            "rounded-xl p-2.5 transition-colors",
                            item.isAvailable ? "text-neutral-500 hover:bg-white/5 hover:text-white" : "text-emerald-500 bg-emerald-500/10"
                          )}
                          title={item.isAvailable ? "Mark as Out of Stock" : "Mark as In Stock"}
                        >
                          {item.isAvailable ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-xl p-2.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onSave={handleAddCategory} 
      />
      <MenuItemModal 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)} 
        onSave={loadData}
        initialData={editingItem}
        categories={categories}
        restaurantId={restaurantId!}
      />
    </div>
  );
}

// Sub-components (Modals)
function CategoryModal({ isOpen, onClose, onSave }: any) {
  const [name, setName] = useState("");
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
            onClick={() => {
              if (name) onSave(name);
              setName("");
            }} 
            className="flex-1 bg-primary py-4 rounded-2xl font-black text-black hover:bg-orange-600 transition-all shadow-xl shadow-primary/20"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItemModal({ isOpen, onClose, onSave, initialData, categories, restaurantId }: any) {
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
        category: initialData.category,
        isVeg: initialData.isVeg,
        image: initialData.image,
        isAvailable: initialData.isAvailable
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
    try {
      if (initialData) {
        await updateMenuItem(initialData.id, formData);
      } else {
        await addMenuItem(formData, restaurantId);
      }
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
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
              className="flex-1 bg-primary py-4 rounded-2xl font-black text-black hover:bg-orange-600 transition-all shadow-xl shadow-primary/20"
            >
              {initialData ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

