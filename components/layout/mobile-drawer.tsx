"use client";

import Link from "next/link";

import { PRIMARY_NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileDrawerProps = {
  open: boolean;
  pathname: string;
  onClose: () => void;
};

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileDrawer({ open, pathname, onClose }: MobileDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-[#0F172A]/45"
        onClick={onClose}
        aria-label="Fechar menu"
      />

      <aside
        id="mobile-nav-drawer"
        className="fixed inset-y-0 left-0 z-50 w-[86%] max-w-[326px] border-r border-[#D9E3EE] bg-[#F8FBFF] p-5 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.6)]"
        data-testid="mobile-drawer"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#0F172A]">Navegação</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-lg border border-[#DCE5EF] bg-white px-3 text-xs font-medium text-[#334155]"
            data-testid="mobile-drawer-close"
          >
            Fechar
          </button>
        </div>

        <nav aria-label="Navegação móvel" className="h-[calc(100%-2rem)] overflow-y-auto pr-1">
          <ul className="space-y-1.5">
            {PRIMARY_NAVIGATION.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(pathname, item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    data-testid={`${item.testId}-mobile`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all",
                      active
                        ? "border border-[#B9E6E4] bg-[#E8F7F6] text-[#0B6D6D]"
                        : "text-[#334155] hover:bg-[#EEF4FA] hover:text-[#0F172A]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-[#0EA5A4]" : "text-[#64748B]")} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
