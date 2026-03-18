"use client";

import { useEffect, useState } from "react";
import { getRestaurants, Restaurant } from "@/services/superAdminService";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Power,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function RestaurantManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRestaurants();
      setRestaurants(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Restaurants</h1>
          <p className="text-neutral-500 font-medium">Manage all your restaurant partners and their access.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 active:scale-95 px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add New Restaurant
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-3xl border border-neutral-800/50">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, owner, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl border border-neutral-800/50 text-xs font-black text-neutral-400 hover:text-white transition-all flex-grow md:flex-grow-0">
            <Filter className="w-4 h-4" />
            Active Status
          </button>
          <button className="flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl border border-neutral-800/50 text-xs font-black text-neutral-400 hover:text-white transition-all flex-grow md:flex-grow-0">
            Export List
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 glass rounded-[2rem] border border-neutral-800/50 animate-pulse" />
          ))
        ) : filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((res) => (
            <div key={res.id} className="glass p-8 rounded-[2rem] border border-neutral-800/50 hover:border-orange-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center font-black text-2xl text-white border-2 border-neutral-800 shadow-xl group-hover:bg-orange-500 group-hover:border-orange-400 transition-all duration-500">
                    {res.name.split(' ').map(w => w[0]).join('').substr(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-orange-500 transition-colors mb-1">{res.name}</h3>
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full w-fit">
                      <div className={`w-1.5 h-1.5 rounded-full ${res.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-600'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${res.status === 'active' ? 'text-green-500' : 'text-neutral-500'}`}>
                        {res.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-800 rounded-xl transition-all h-fit">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-neutral-400">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{res.email}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">{res.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 col-span-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{res.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Plan Assigned</span>
                  <span className="text-sm font-black text-white">{res.planId === 'p2' ? 'Pro SaaS' : 'Basic SaaS'}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all">
                    <Power className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-black text-xs hover:bg-orange-500 hover:border-orange-400 transition-all">
                    Control Panel <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-neutral-800">
            <p className="text-neutral-600 font-bold mb-4">No restaurants found matching your criteria.</p>
            <button className="text-orange-500 font-black uppercase tracking-widest text-xs">Clear Search</button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-10 border-t border-neutral-800/50">
        <p className="text-xs text-neutral-500 font-medium">Showing <span className="text-white font-bold">{filteredRestaurants.length}</span> restaurants</p>
        <div className="flex gap-2">
          <button className="p-3 glass border border-neutral-800/50 rounded-xl text-neutral-500 hover:text-white disabled:opacity-30" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-3 glass border border-neutral-800/50 rounded-xl text-neutral-500 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
