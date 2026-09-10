import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
        <h1 className="text-[22px] font-semibold tracking-tight text-text-primary sm:text-[26px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] text-text-secondary">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
