"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FOOD_CATEGORIES } from "@/lib/constants";

const DIETARY_FILTERS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "halal", label: "Halal" },
  { key: "gluten_free", label: "Gluten-free" },
] as const;

const CATEGORY_OPTIONS = ["All categories", ...FOOD_CATEGORIES] as const;

export function CollectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `/collect?${qs}` : "/collect", { scroll: false });
    },
    [router, searchParams]
  );

  const toggleDietary = (key: string) => {
    const current = searchParams.get(key);
    updateParams(key, current === "true" ? null : "true");
  };

  const selectedCategory = searchParams.get("category") || "All categories";
  const availableNow = searchParams.get("available_now") === "true";

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {DIETARY_FILTERS.map(({ key, label }) => {
        const isActive = searchParams.get(key) === "true";
        return (
          <button
            key={key}
            onClick={() => toggleDietary(key)}
            className={`rounded-full border px-3.5 py-2.5 text-sm font-medium capitalize transition-shadow transition-transform focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] min-h-[44px] ${
              isActive
                ? "border-p2p-primary bg-p2p-primary text-white"
                : "border-p2p-border bg-p2p-surface text-p2p-text-secondary hover:border-p2p-primary hover:text-p2p-primary"
            }`}
          >
            {label}
          </button>
        );
      })}

      <select
        value={selectedCategory}
        onChange={(e) => {
          const val = e.target.value;
          updateParams("category", val === "All categories" ? null : val);
        }}
        className="rounded-full border border-p2p-border bg-p2p-surface px-3.5 py-2.5 text-sm font-medium text-p2p-text-secondary transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 min-h-[44px]"
      >
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <button
        onClick={() => updateParams("available_now", availableNow ? null : "true")}
        className={`rounded-full border px-3.5 py-2.5 text-sm font-medium transition-shadow transition-transform focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] min-h-[44px] ${
          availableNow
            ? "border-p2p-primary bg-p2p-primary text-white"
            : "border-p2p-border bg-p2p-surface text-p2p-text-secondary hover:border-p2p-primary hover:text-p2p-primary"
        }`}
      >
        Available now
      </button>
    </div>
  );
}
