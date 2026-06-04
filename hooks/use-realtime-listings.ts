// SETUP REQUIRED: Enable Realtime on the listings table in Supabase dashboard
// Go to: Database → Replication → supabase_realtime publication → Add table → listings

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeListingsReturn {
  listings: Listing[];
  lastEventAt: number | null;
}

function filterExpired(items: Listing[]): Listing[] {
  const now = Date.now();
  return items.filter((l) => new Date(l.expires_at).getTime() > now);
}

export function useRealtimeListings(
  initialListings: Listing[],
): UseRealtimeListingsReturn {
  const [listings, setListings] = useState<Listing[]>(() =>
    filterExpired(initialListings),
  );
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const markEvent = useCallback(() => {
    setLastEventAt(Date.now());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing server-fetched data on navigation
    setListings(filterExpired(initialListings));
  }, [initialListings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setListings((prev) => {
        const filtered = filterExpired(prev);
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("listings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const newListing = payload.new as Listing;
          if (
            newListing.status === "available" ||
            newListing.status === "held"
          ) {
            setListings((prev) => [newListing, ...prev]);
            markEvent();
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "listings" },
        (payload) => {
          const updated = payload.new as Listing;
          setListings((prev) => {
            if (updated.status !== "available" && updated.status !== "held") {
              return prev.filter((l) => l.id !== updated.id);
            }
            return prev.map((l) => (l.id === updated.id ? updated : l));
          });
          markEvent();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "listings" },
        (payload) => {
          const deleted = payload.old as { id: string };
          setListings((prev) => prev.filter((l) => l.id !== deleted.id));
          markEvent();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [markEvent]);

  return { listings, lastEventAt };
}
