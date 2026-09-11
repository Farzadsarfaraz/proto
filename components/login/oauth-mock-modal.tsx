"use client";

import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";

export interface OAuthProvider {
  id: string;
  label: string;
  icon: LucideIcon | ((props: { className?: string }) => React.ReactElement);
  accent: string;
}

interface OAuthMockModalProps {
  provider: OAuthProvider | null;
  profileName: string;
  profileEmail: string;
  loading: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

// Mimics the *real* provider sign-in screen closely enough to feel familiar,
// but is unmistakably a demo — it never leaves this app, no credentials are
// collected, and every provider variant says so at the bottom. Deliberately
// styled with fixed light colors instead of the app's theme tokens: a real
// OAuth redirect lands on the provider's own site, which doesn't adapt to
// the origin app's dark/light mode either.
export function OAuthMockModal({ provider, profileName, profileEmail, loading, onCancel, onContinue }: OAuthMockModalProps) {
  if (!provider) return null;
  const Icon = provider.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="oauth-mock-title"
        className="w-full max-w-[420px] overflow-hidden rounded-[8px] bg-white text-[#202124] shadow-2xl"
      >
        <div className="h-[3px]" style={{ background: provider.accent }} />

        <div className="relative px-8 pb-2 pt-8">
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
          >
            <X className="size-4" />
          </button>
          <div className="flex flex-col items-center gap-3">
            <Icon className="size-10" />
            <h2 id="oauth-mock-title" className="text-center text-[21px] font-normal text-[#202124]">
              Sign in with {provider.label}
            </h2>
            <p className="text-center text-[14px] text-[#5f6368]">to continue to Octagone</p>
          </div>
        </div>

        <div className="px-8 pb-2 pt-4">
          <button
            onClick={onContinue}
            disabled={loading}
            className="flex w-full items-center gap-3 rounded-[8px] border border-[#dadce0] px-4 py-3 text-left transition-colors hover:bg-[#f8f9fa] disabled:pointer-events-none disabled:opacity-60"
          >
            <Avatar name={profileName} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-[#202124]">{profileName}</span>
              <span className="block truncate text-[12px] text-[#5f6368]">{profileEmail}</span>
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#e8eaed] px-8 py-4">
          <button onClick={onCancel} className="text-[14px] font-medium text-[#1a73e8] hover:underline">
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={loading}
            style={{ background: provider.accent }}
            className="flex h-9 items-center gap-2 rounded-[6px] px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Continue
          </button>
        </div>

        <div className="border-t border-[#e8eaed] px-8 py-3 text-center text-[11px] leading-relaxed text-[#80868b]">
          Demo screen — not affiliated with {provider.label}. No real account is used.
        </div>
      </div>
    </div>,
    document.body
  );
}
