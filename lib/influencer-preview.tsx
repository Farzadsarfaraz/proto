"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Influencer } from "./types";
import { InfluencerProfileModal } from "@/components/customer/influencer-profile-modal";

interface PreviewActions {
  onShortlist?: () => void;
  onPass?: () => void;
}

interface InfluencerPreviewContextValue {
  influencer: Influencer | null;
  open: (influencer: Influencer, actions?: PreviewActions) => void;
  close: () => void;
}

const InfluencerPreviewContext = createContext<InfluencerPreviewContextValue | null>(null);

// A single, app-wide modal instance — anything that wants to preview an
// influencer (command palette, set selection, the swipe deck) calls `open`
// on this shared context instead of owning its own modal state. Two
// independent `<InfluencerProfileModal>` instances can otherwise end up
// mounted at once (e.g. one left open on the page, another opened from the
// command palette) and visually stack on top of each other.
export function InfluencerPreviewProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ influencer: Influencer; actions: PreviewActions } | null>(null);

  const open = useCallback((influencer: Influencer, actions: PreviewActions = {}) => {
    setState({ influencer, actions });
  }, []);
  const close = useCallback(() => setState(null), []);

  return (
    <InfluencerPreviewContext.Provider value={{ influencer: state?.influencer ?? null, open, close }}>
      {children}
      <InfluencerProfileModal
        influencer={state?.influencer ?? null}
        onClose={close}
        onShortlist={state?.actions.onShortlist}
        onPass={state?.actions.onPass}
      />
    </InfluencerPreviewContext.Provider>
  );
}

export function useInfluencerPreview() {
  const ctx = useContext(InfluencerPreviewContext);
  if (!ctx) throw new Error("useInfluencerPreview must be used within InfluencerPreviewProvider");
  return ctx;
}
