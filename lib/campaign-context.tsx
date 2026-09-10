"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CAMPAIGNS } from "./mock-data";
import type { Campaign } from "./types";

interface CampaignContextValue {
  campaigns: Campaign[];
  campaign: Campaign;
  setCampaignId: (id: string) => void;
  addCampaign: (campaign: Campaign) => void;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [campaignId, setCampaignId] = useState(CAMPAIGNS[0].id);

  const value = useMemo<CampaignContextValue>(() => {
    const campaign = campaigns.find((c) => c.id === campaignId) ?? campaigns[0];
    return {
      campaigns,
      campaign,
      setCampaignId,
      addCampaign: (next) => {
        setCampaigns((prev) => [next, ...prev]);
        setCampaignId(next.id);
      },
    };
  }, [campaigns, campaignId]);

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaign must be used within CampaignProvider");
  return ctx;
}
