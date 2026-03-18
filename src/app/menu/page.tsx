"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getMenu, MenuItem as MenuItemType, Category } from "@/services/customerService";
import MenuItem from "@/components/customer/MenuItem";
import CategoryBar from "@/components/customer/CategoryBar";
import CartStickyButton from "@/components/customer/CartStickyButton";
import ItemModal from "@/components/customer/ItemModal";
import { Search, UtensilsCrossed, Star, Sparkles } from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const { setSession } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

  useEffect(() => {
    const tableId = searchParams.get("tableId");
    const restaurantId = searchParams.get("restaurantId");

    if (tableId && restaurantId) {
      setSession(tableId, restaurantId);
    }

    const loadMenu = async () => {
      setLoading(true);
      try {
        const data = await getMenu(restaurantId || "default_rid");
        setRestaurantName(data.restaurantName);
        setCategories(data.categories);
        setMenuItems(data.menu);
        setFilteredItems(data.menu);
      } catch (e) {
        console.error("Failed to load menu", e);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [searchParams]);

  useEffect(() => {
    let filtered = menuItems;
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [activeCategory, searchQuery, menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Loading Menu...</h2>
        <p className="text-neutral-500 mt-2">Preparing fresh flavors for you</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-32">
      {/* Header Section */}
      <header className="p-6 pt-12 bg-gradient-to-b from-orange-500/20 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-orange-500" />
              {restaurantName}
            </h1>
            <p className="text-neutral-500 text-sm font-medium flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              4.9 • Table 12
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none rounded-2xl py-4 pl-12 pr-4 text-white transition-all placeholder:text-neutral-600"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5">
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Sections */}
        <div className="mt-8 space-y-10">
          {/* Popular Items - Only when showing 'all' */}
          {activeCategory === "all" && !searchQuery && (
            <section>
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                Popular Choice
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.filter(i => i.isPopular).map(item => (
                  <MenuItem 
                    key={item.id} 
                    item={item} 
                    onShowDetails={setSelectedItem}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Categorized Items */}
          <section>
            <h2 className="text-xl font-black text-white mb-6 capitalize">
              {activeCategory === "all" ? "All Items" : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <MenuItem 
                    key={item.id} 
                    item={item} 
                    onShowDetails={setSelectedItem}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-neutral-600 italic">No items found matching your search</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <CartStickyButton />
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}

const Flame = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
