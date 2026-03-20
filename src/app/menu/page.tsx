"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getMenu, MenuItem as MenuItemType, Category, callWaiterByTable, getOrder, clearWaiterAccepted } from "@/services/customerService";
import MenuItem from "@/components/customer/MenuItem";
import CategoryBar from "@/components/customer/CategoryBar";
import CartStickyButton from "@/components/customer/CartStickyButton";
import ItemModal from "@/components/customer/ItemModal";
import { Search, UtensilsCrossed, Star, Sparkles, Bell, Check, Loader2, Phone } from "lucide-react";

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
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterNotified, setWaiterNotified] = useState(false);
  const [activeServiceOrderId, setActiveServiceOrderId] = useState<string | null>(null);
  const [waiterAccepted, setWaiterAccepted] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const tableId = searchParams.get("tableId");
    const restaurantId = searchParams.get("restaurantId");

    if (tableId && restaurantId) {
      setSession(tableId, restaurantId);
    }

    // Load active service call from localStorage
    const savedCall = localStorage.getItem("menuqr_active_service_call");
    if (savedCall) {
      setActiveServiceOrderId(savedCall);
      setWaiterNotified(true);
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

  // Polling for waiter acceptance
  useEffect(() => {
    if (!activeServiceOrderId) return;

    const pollStatus = async () => {
      try {
        const data = await getOrder(activeServiceOrderId);
        setWaiterNotified(!!data.callWaiter);
        setWaiterAccepted(!!data.waiterAccepted);
        
        if (data.waiterAccepted) {
          // If accepted, we can stop the local "notified" spinner/state
          // but we keep the activeServiceOrderId until they dismiss the modal
        }
      } catch (e) {
        console.error("Polling failed", e);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [activeServiceOrderId]);

  const handleCallWaiter = async () => {
    const tableId = searchParams.get("tableId") || "12";
    const restaurantId = searchParams.get("restaurantId") || "default_rid";
    
    setIsCallingWaiter(true);
    try {
      const res = await callWaiterByTable(tableId, restaurantId);
      if (res.success) {
        setWaiterNotified(true);
        setActiveServiceOrderId(res.orderId);
        localStorage.setItem("menuqr_active_service_call", res.orderId);
      }
    } catch (e) {
      console.error("Failed to call waiter", e);
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const handleDismissAcknowledgment = async () => {
    if (activeServiceOrderId) {
      await clearWaiterAccepted(activeServiceOrderId);
    }
    setWaiterAccepted(false);
    setActiveServiceOrderId(null);
    localStorage.removeItem("menuqr_active_service_call");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Loading Menu...</h2>
        <p className="text-neutral-500 mt-2">Preparing fresh flavors for you</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-32">
      {/* Header Section */}
      <header className="p-6 pt-12 bg-gradient-to-b from-primary/20 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
              {restaurantName}
            </h1>
            <p className="text-neutral-500 text-sm font-medium flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              4.9 • Table {searchParams.get("tableId") || "N/A"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Search Bar & Call Waiter */}
        <div className="flex gap-2 mb-2 items-center">
          <div className={`relative transition-all duration-500 ease-in-out ${isSearchFocused ? "flex-grow" : "w-[60px]"}`}>
            <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 text-neutral-500 w-6 h-6 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder={isSearchFocused ? "Search for dishes..." : ""}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-2xl py-[18px] transition-all duration-500 placeholder:text-neutral-600 ${
                isSearchFocused ? "pl-14 pr-4 opacity-100" : "pl-14 pr-0 cursor-pointer opacity-80 hover:opacity-100"
              }`}
            />
          </div>
          <button 
            onClick={handleCallWaiter}
            disabled={isCallingWaiter || waiterNotified || waiterAccepted}
            className={`flex items-center justify-center gap-2 group transition-all duration-500 ease-in-out h-[60px] bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl active:scale-95 whitespace-nowrap overflow-hidden ${
              waiterNotified ? "border-green-500/50 text-green-500 px-6" : "hover:border-primary/50 text-neutral-400 hover:text-primary"
            } ${isSearchFocused ? "w-[60px] px-0 flex-shrink-0" : "flex-grow px-6"}`}
          >
            {isCallingWaiter ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : waiterNotified ? (
              <>
                <Check className="w-5 h-5 flex-shrink-0" />
                {!isSearchFocused && <span className="text-xs font-black uppercase tracking-widest text-green-500">Notified</span>}
              </>
            ) : (
              <>
                <Bell className={`w-5 h-5 flex-shrink-0 ${isSearchFocused ? "" : ""}`} />
                {!isSearchFocused && (
                  <span className="text-xs font-black uppercase tracking-widest">Call Waiter</span>
                )}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Waiter Acknowledgment Popup */}
      {waiterAccepted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                <div className="w-10 h-10 text-primary flex items-center justify-center">
                  <Phone className="w-8 h-8" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 leading-tight tracking-tighter uppercase italic">Waiter is Coming!</h2>
              <p className="text-neutral-400 text-sm font-medium mb-8">
                Your request has been accepted. A waiter will be at your table shortly.
              </p>

              <button
                onClick={handleDismissAcknowledgment}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Okay, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

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
                <Flame className="w-6 h-6 text-primary" />
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
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
