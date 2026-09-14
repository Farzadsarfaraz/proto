"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative inline-flex", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="What is this?"
        aria-expanded={open}
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-accent",
          open && "bg-accent-soft text-accent-strong"
        )}
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-72 rounded-[var(--radius-md)] border border-border-hairline bg-surface-1 p-3.5 text-[12.5px] leading-relaxed text-text-secondary shadow-[var(--shadow-lg)] animate-fade-in"
        >
          {text}
        </div>
      )}
    </div>
  );
}
