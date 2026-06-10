"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TagMultiSelectProps {
  /** Full list of preset options. */
  options: readonly string[];
  /** The few shown before "Show all" is expanded. */
  commonOptions: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  accent?: "amber" | "primary";
  addPlaceholder?: string;
}

const ACCENT = {
  amber: {
    on: "border-p2p-amber bg-p2p-amber-light text-p2p-amber",
    hover: "hover:border-p2p-amber/40",
  },
  primary: {
    on: "border-p2p-primary bg-p2p-primary-light text-p2p-primary",
    hover: "hover:border-p2p-primary/40",
  },
} as const;

export function TagMultiSelect({
  options,
  commonOptions,
  value,
  onChange,
  accent = "primary",
  addPlaceholder = "Add other (comma-separated)",
}: TagMultiSelectProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const accentCls = ACCENT[accent];

  function toggle(option: string) {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    );
  }

  function commitDraft() {
    const tokens = draft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      setDraft("");
      return;
    }
    const next = [...value];
    for (const t of tokens) {
      if (!next.some((v) => v.toLowerCase() === t.toLowerCase())) next.push(t);
    }
    onChange(next);
    setDraft("");
  }

  // Collapsed view still shows any selected preset so a chosen "Soy" stays visible.
  const presetsToShow = expanded
    ? options
    : options.filter((o) => commonOptions.includes(o) || value.includes(o));
  const customValues = value.filter((v) => !options.includes(v));

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap gap-2">
        {presetsToShow.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={selected}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors transition-transform",
                "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]",
                selected
                  ? accentCls.on
                  : cn(
                      "border-p2p-border bg-p2p-surface text-p2p-text-secondary",
                      accentCls.hover,
                    ),
              )}
            >
              {option}
            </button>
          );
        })}

        {customValues.map((custom) => (
          <button
            key={custom}
            type="button"
            onClick={() => onChange(value.filter((v) => v !== custom))}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-transform active:scale-[0.98]",
              accentCls.on,
            )}
          >
            {custom}
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ))}

        {!expanded && options.length > commonOptions.length && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-p2p-primary transition-colors hover:bg-p2p-primary-light focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Show all
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <Input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          }
        }}
        placeholder={addPlaceholder}
        className="mt-2 bg-p2p-surface"
      />
    </div>
  );
}
