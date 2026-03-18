"use client";

import { Category } from "@/services/customerService";
import { useEffect, useRef } from "react";

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryBar({ categories, activeCategory, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeElement = document.getElementById(`cat-${activeCategory}`);
    if (activeElement && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const scrollLeft = activeElement.offsetLeft - scrollContainer.offsetWidth / 2 + activeElement.offsetWidth / 2;
      scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div 
      ref={scrollRef}
      className="flex gap-2 p-4 overflow-x-auto no-scrollbar scroll-smooth sticky top-0 z-10 glass -mx-4 px-4 border-b border-neutral-800/50"
    >
      <button
        id="cat-all"
        onClick={() => onSelect("all")}
        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
          activeCategory === "all"
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
            : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
        }`}
      >
        All Items
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          id={`cat-${cat.id}`}
          onClick={() => onSelect(cat.id)}
          className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
            activeCategory === cat.id
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
              : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
