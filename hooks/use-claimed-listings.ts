"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LOCAL_STORAGE_KEY } from "@/lib/constants";

interface UseClaimedListingsReturn {
  claimedIds: string[];
  addClaim: (id: string) => void;
  hasClaimed: (id: string) => boolean;
}

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

let cachedRaw: string | null = undefined as unknown as null;
let cachedSnapshot: string[] = [];

function getSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = raw ? (JSON.parse(raw) as string[]) : [];
    return cachedSnapshot;
  } catch {
    return cachedSnapshot;
  }
}

const SERVER_SNAPSHOT: string[] = [];
function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

export function useClaimedListings(): UseClaimedListingsReturn {
  const claimedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addClaim = useCallback((id: string) => {
    const current = getSnapshot();
    if (current.includes(id)) return;
    const updated = [...current, id];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  const hasClaimed = useCallback(
    (id: string) => claimedIds.includes(id),
    [claimedIds]
  );

  return { claimedIds, addClaim, hasClaimed };
}
