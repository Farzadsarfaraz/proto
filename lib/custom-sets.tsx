"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CustomSet, Influencer } from "./types";

const STORAGE_KEY = "octagone.customSets";

interface CustomSetsContextValue {
  customSets: CustomSet[];
  addCustomSet: (influencers: Influencer[], name?: string) => CustomSet;
  removeCustomSet: (id: string) => void;
}

const CustomSetsContext = createContext<CustomSetsContextValue | null>(null);

export function CustomSetsProvider({ children }: { children: React.ReactNode }) {
  const [customSets, setCustomSets] = useState<CustomSet[]>([]);
  // Mirrors the tinder-progress persistence pattern: the hydration effect's
  // setState hasn't landed on a re-render yet when this effect first runs,
  // so skip that first run rather than persisting stale (empty) state over
  // whatever was actually stored.
  const skipNextPersist = useRef(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCustomSets(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customSets));
  }, [customSets]);

  const addCustomSet = useCallback((influencers: Influencer[], name?: string) => {
    const set: CustomSet = {
      id: `custom-${Date.now()}`,
      name: name?.trim() || `My Shortlist — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
      createdAt: new Date().toISOString(),
      influencerIds: influencers.map((inf) => inf.id),
    };
    setCustomSets((prev) => [set, ...prev]);
    return set;
  }, []);

  const removeCustomSet = useCallback((id: string) => {
    setCustomSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <CustomSetsContext.Provider value={{ customSets, addCustomSet, removeCustomSet }}>{children}</CustomSetsContext.Provider>
  );
}

export function useCustomSets() {
  const ctx = useContext(CustomSetsContext);
  if (!ctx) throw new Error("useCustomSets must be used within CustomSetsProvider");
  return ctx;
}
