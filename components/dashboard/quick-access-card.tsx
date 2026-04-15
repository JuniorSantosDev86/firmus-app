import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type QuickAccessCardProps = {
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
  testId?: string;
};

export function QuickAccessCard({
  title,
  description,
  metricLabel,
  metricValue,
  href,
  actionLabel,
  icon: Icon,
  testId,
}: QuickAccessCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[20px] border border-[#D9E3EE] bg-white p-5 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.42)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">{title}</h2>
          <p className="text-sm leading-relaxed text-[#64748B]">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#99F6E4] to-[#DBEAFE] text-[#087C7B]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#D9E3EE] bg-gradient-to-r from-[#F2FAFD] via-[#F8FBFF] to-[#F2F8FF] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{metricLabel}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#0F172A]">{metricValue}</p>
      </div>

      <Link
        href={href}
        data-testid={testId}
        className={cn(
          "mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0F766E] px-4 text-sm font-semibold text-white transition-colors",
          "hover:bg-[#0D5F59]"
        )}
      >
        {actionLabel}
      </Link>
    </article>
  );
}
