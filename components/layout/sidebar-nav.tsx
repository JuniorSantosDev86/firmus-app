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
      className="hidden h-screen w-[290px] flex-col border-r border-[#E2E8F0] bg-white px-4 py-5 lg:flex"
      data-testid="sidebar-nav"
    >
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 rounded-xl px-2 py-1"
        data-testid="home-logo-link"
      >
        <Image
          src="/brand/firmus-logo-square.png"
          alt="Logo Firmus"
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
        <Image
          src="/brand/firmus-logo-horizontal.png"
          alt="Firmus"
          width={124}
          height={36}
          className="h-auto w-[108px]"
          priority
        />
      </Link>

      <nav aria-label="Navegação principal" className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-6">
          {NAV_GROUP_ORDER.map((group) => {
            const groupItems = PRIMARY_NAVIGATION.filter((item) => item.group === group);

            return (
              <section key={group} className="space-y-2">
                <h2 className="px-2 text-xs font-semibold tracking-wide text-[#64748B] uppercase">
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
                            "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-[#E6FFFA] text-[#087C7B]"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
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

      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold text-[#334155]">Torre de Controle</p>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
          Fluxos reais, atividade recente e próximas ações em um só lugar.
        </p>
      </div>
    </div>
  );
}
