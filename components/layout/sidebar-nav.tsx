"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NAVIGATION_GROUP_LABELS,
  PRIMARY_NAVIGATION,
  type NavigationGroup,
  type NavigationItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

const NAV_GROUP_ORDER: NavigationGroup[] = ["principal", "operacao", "inteligencia"];

function isItemActive(pathname: string, item: NavigationItem): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div
      className="hidden h-screen w-[308px] flex-col border-r border-[#D9E3EE] bg-[#F8FBFF] px-5 py-6 lg:flex"
      data-testid="sidebar-nav"
    >
      <Link
        href="/"
        className="mb-7 flex items-center gap-2.5 rounded-2xl border border-[#DCE5EF] bg-white px-3 py-3 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.55)]"
        data-testid="home-logo-link"
      >
        <Image
          src="/brand/firmus-logo-square.png"
          alt="Logo Firmus"
          width={36}
          height={36}
          className="h-9 w-9"
          priority
        />
        <Image
          src="/brand/firmus-logo-horizontal.png"
          alt="Firmus"
          width={124}
          height={36}
          className="h-auto w-[114px]"
          priority
        />
      </Link>

      <nav aria-label="Navegação principal" className="min-h-0 flex-1 overflow-y-auto pr-1.5">
        <div className="space-y-7">
          {NAV_GROUP_ORDER.map((group) => {
            const groupItems = PRIMARY_NAVIGATION.filter((item) => item.group === group);

            return (
              <section key={group} className="space-y-2.5">
                <h2 className="px-2 text-[11px] font-semibold tracking-[0.12em] text-[#64748B] uppercase">
                  {NAVIGATION_GROUP_LABELS[group]}
                </h2>
                <ul className="space-y-1.5">
                  {groupItems.map((item) => {
                    const active = isItemActive(pathname, item);
                    const Icon = item.icon;

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          data-testid={item.testId}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all",
                            active
                              ? "border border-[#B9E6E4] bg-[#E8F7F6] text-[#0B6D6D] shadow-[0_12px_28px_-24px_rgba(8,124,123,0.5)]"
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
              </section>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
