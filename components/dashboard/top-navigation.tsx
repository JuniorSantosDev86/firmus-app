"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type MainNavItem = {
  href: string;
  label: string;
  testId: string;
};

const mainNavItems: MainNavItem[] = [
  { href: "/", label: "Dashboard", testId: "nav-dashboard" },
  { href: "/business-profile", label: "Perfil da Empresa", testId: "nav-business-profile" },
  { href: "/clients", label: "Clientes", testId: "nav-clients" },
  { href: "/services", label: "Serviços", testId: "nav-services" },
  { href: "/quotes", label: "Orçamentos", testId: "nav-quotes" },
];

const auxNavItems = [
  { href: "/charges", label: "Cobranças", testId: "nav-charges" },
  {
    href: "/financial-overview",
    label: "Visão Financeira",
    testId: "nav-financial-overview",
  },
];

export function TopNavigation() {
  const pathname = usePathname();

  return (
    <header className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_48px_-36px_rgba(15,23,42,0.45)]">
      <nav className="flex min-h-20 items-center justify-between gap-6 px-5 sm:px-8" aria-label="Navegação principal">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl" data-testid="home-logo-link">
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
            width={140}
            height={44}
            className="h-auto w-[118px]"
            priority
          />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-testid={item.testId}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center rounded-xl px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#E6FFFA] text-[#087C7B]"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 sm:flex">
          {auxNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-xl border px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#0EA5A4] bg-[#ECFEFF] text-[#087C7B]"
                    : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex gap-2 border-t border-[#E2E8F0] px-5 py-3 sm:hidden">
        {mainNavItems.slice(1, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] px-3 text-xs font-medium text-[#475569]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 border-t border-[#E2E8F0] px-5 py-3 sm:hidden">
        {mainNavItems.slice(4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] px-3 text-xs font-medium text-[#475569]"
          >
            {item.label}
          </Link>
        ))}
        {auxNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] px-3 text-xs font-medium text-[#475569]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
