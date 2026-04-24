import Link from "next/link";

import type { MVPReadinessItem as ReadinessItem } from "@/lib/domain";

const STATUS_LABELS = {
  ready: "Pronto",
  warning: "Atenção",
  blocked: "Bloqueio",
} as const;

const STATUS_CLASS_NAMES = {
  ready: "border-[#B6E9E8] bg-[#ECFEFF] text-[#0B6D6D]",
  warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  blocked: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
} as const;

export function MVPReadinessItem({ item }: { item: ReadinessItem }) {
  return (
    <li
      className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4"
      data-testid={`mvp-readiness-item-${item.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{item.label}</h3>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS_NAMES[item.status]}`}
              data-testid={`mvp-readiness-item-status-${item.id}`}
            >
              {STATUS_LABELS[item.status]}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>

        {item.href ? (
          <Link
            href={item.href}
            className="inline-flex h-9 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
            data-testid={`mvp-readiness-item-link-${item.id}`}
          >
            Abrir módulo
          </Link>
        ) : null}
      </div>
    </li>
  );
}
